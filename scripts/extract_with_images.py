import xml.etree.ElementTree as ET, os, re, shutil

W  = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R  = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

BASE = os.path.dirname(os.path.abspath(__file__))

# Build rId -> image filename map
rels_data = open(os.path.join(BASE, 'docx_media', 'document.xml.rels'), 'rb').read()
rels_root = ET.fromstring(rels_data)
img_map = {}
for rel in rels_root.findall('{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
    if 'image' in rel.get('Type', ''):
        img_map[rel.get('Id')] = rel.get('Target', '').replace('media/', '')

# Build numId -> format map
num_data = open(os.path.join(BASE, 'docx_media', 'numbering.xml'), 'rb').read()
num_root = ET.fromstring(num_data)
abstract_fmt = {}
for absNum in num_root.findall('{%s}abstractNum' % W):
    absId = absNum.get('{%s}abstractNumId' % W)
    lvl0 = absNum.find('.//{%s}lvl[@{%s}ilvl="0"]' % (W, W))
    if lvl0 is not None:
        nf = lvl0.find('{%s}numFmt' % W)
        if nf is not None:
            abstract_fmt[absId] = nf.get('{%s}val' % W)
num_id_map = {}
for num in num_root.findall('{%s}num' % W):
    numId = num.get('{%s}numId' % W)
    absRef = num.find('{%s}abstractNumId' % W)
    if absRef is not None:
        num_id_map[numId] = abstract_fmt.get(absRef.get('{%s}val' % W), 'bullet')

CODE_FONTS = {'Courier New', 'Courier', 'Consolas', 'Lucida Console', 'Monaco', 'Roboto Mono'}

# Patterns that indicate a line of text is a shell/code command
CODE_CMD_STARTS = (
    'msfvenom', 'Msfvenom', 'hashcat', 'john ', 'john--', 'hydra ',
    'python3', 'python ', 'nmap ', 'git ', 'curl ', 'wget ',
    'Get-', 'Set-', 'Invoke-', 'New-Object', 'Add-Type',
    'reg query', 'reg add', 'reg delete',
    'nc ', 'netcat ', 'powershell', 'cmd /c',
    'whoami', 'net user', 'net localgroup',
    '(New-Object', 'IntPtr ', '$Kernel32', '$cmd',
    'C:\\>', 'C:\\P', 'C:\\W',  # Windows paths
    '<url>',
)

def looks_like_code(text):
    t = text.strip()
    if any(t.startswith(s) for s in CODE_CMD_STARTS):
        return True
    if 'LHOST=' in t or 'LPORT=' in t:
        return True
    # looks like a shell command with flags
    if re.match(r'^[a-zA-Z0-9_\-]+\s+-[a-zA-Z]', t) and len(t) > 30:
        return True
    return False

def wrap_md(text, marker):
    """Wrap text with markdown marker, keeping leading/trailing spaces outside."""
    stripped = text.strip()
    if not stripped:
        return text
    lead  = ' ' if text != text.lstrip()  else ''
    trail = ' ' if text != text.rstrip() else ''
    return lead + marker + stripped + marker + trail

def run_to_md(run):
    rPr = run.find('{%s}rPr' % W)
    text = ''.join(t.text or '' for t in run.findall('{%s}t' % W))
    if not text:
        return ''
    is_bold   = rPr is not None and rPr.find('{%s}b' % W) is not None
    is_italic = rPr is not None and rPr.find('{%s}i' % W) is not None
    is_code   = False
    if rPr is not None:
        rf = rPr.find('{%s}rFonts' % W)
        if rf is not None and any(v in CODE_FONTS for v in rf.attrib.values()):
            is_code = True
    if is_code:               return '`%s`' % text.strip()
    if is_bold and is_italic: return wrap_md(text, '***')
    if is_bold:               return wrap_md(text, '**')
    if is_italic:             return wrap_md(text, '*')
    return text

def collect_runs(para):
    """Collect all text runs and drawings from a paragraph as structured data."""
    items = []
    for child in para:
        tag = child.tag.split('}')[1] if '}' in child.tag else child.tag
        if tag == 'r':
            drawing = child.find('{%s}drawing' % W)
            if drawing is not None:
                items.append(('drawing', drawing))
            else:
                rPr = child.find('{%s}rPr' % W)
                text = ''.join(t.text or '' for t in child.findall('{%s}t' % W))
                if text:
                    is_bold   = rPr is not None and rPr.find('{%s}b' % W) is not None
                    is_italic = rPr is not None and rPr.find('{%s}i' % W) is not None
                    is_code   = False
                    if rPr is not None:
                        rf = rPr.find('{%s}rFonts' % W)
                        if rf is not None and any(v in CODE_FONTS for v in rf.attrib.values()):
                            is_code = True
                    items.append(('text', text, is_bold, is_italic, is_code))
        elif tag == 'hyperlink':
            for r in child.findall('{%s}r' % W):
                drawing = r.find('{%s}drawing' % W)
                if drawing is not None:
                    items.append(('drawing', drawing))
                else:
                    text = ''.join(t.text or '' for t in r.findall('{%s}t' % W))
                    if text:
                        items.append(('text', text, False, False, False))
        elif tag == 'drawing':
            items.append(('drawing', child))
    return items

def fix_inline_spacing(text):
    """Fix missing space after period before capital (e.g. 'word.Word' -> 'word. Word')."""
    text = re.sub(r'([a-z,)])\.([A-Z])', r'\1. \2', text)
    return text

def para_to_md(para, room_slug, img_counter):
    pPr = para.find('{%s}pPr' % W)
    style = 'Normal'
    num_fmt = None
    ilvl = 0
    if pPr is not None:
        ps = pPr.find('{%s}pStyle' % W)
        if ps is not None:
            style = ps.get('{%s}val' % W, 'Normal')
        numPr = pPr.find('{%s}numPr' % W)
        if numPr is not None:
            ilvlEl  = numPr.find('{%s}ilvl' % W)
            numIdEl = numPr.find('{%s}numId' % W)
            if ilvlEl is not None and numIdEl is not None:
                ilvl = int(ilvlEl.get('{%s}val' % W, '0'))
                numId_val = numIdEl.get('{%s}val' % W, '')
                num_fmt = num_id_map.get(numId_val, 'bullet')

    items = collect_runs(para)
    text_items = [it for it in items if it[0] == 'text']
    drawing_items = [it for it in items if it[0] == 'drawing']

    # -- Image handling --
    image_lines = []
    def handle_drawing(drawing_el):
        nonlocal img_counter
        for el in drawing_el.iter():
            embed = el.get('{%s}embed' % R)
            if embed and embed in img_map:
                src_filename = img_map[embed]
                src_path = os.path.join(BASE, 'docx_media', src_filename)
                if os.path.exists(src_path):
                    img_counter += 1
                    dest_dir = os.path.join('public', 'assets', 'storage', 'images', 'writeups', room_slug)
                    os.makedirs(dest_dir, exist_ok=True)
                    dest_name = 'img%03d_%s' % (img_counter, src_filename)
                    shutil.copy2(src_path, os.path.join(dest_dir, dest_name))
                    image_lines.append('![](../assets/storage/images/writeups/%s/%s)' % (room_slug, dest_name))
                break

    for _, drawing_el in drawing_items:
        handle_drawing(drawing_el)

    result_lines = []
    if image_lines:
        result_lines.extend(image_lines)

    # -- Check for all-bold paragraph (subsection heading) --
    if (text_items and style == 'Normal' and not num_fmt and not drawing_items):
        all_bold = all(it[2] for it in text_items)  # it[2] = is_bold
        any_code_font = any(it[4] for it in text_items)  # it[4] = is_code font

        if all_bold and not any_code_font:
            plain = ''.join(it[1] for it in text_items).strip()
            if plain:
                if len(plain) <= 80:
                    result_lines.append('### %s' % plain)
                elif looks_like_code(plain):
                    result_lines.append('```\n%s\n```' % plain)
                else:
                    result_lines.append('**%s**' % plain)
                return '\n'.join(result_lines), img_counter

    # -- Normal rendering: build inline text --
    inline_parts = []
    for it in items:
        if it[0] == 'drawing':
            pass  # already handled above
        else:
            _, text, is_bold, is_italic, is_code = it
            if is_code:
                inline_parts.append('`%s`' % text.strip())
            elif is_bold and is_italic:
                inline_parts.append(wrap_md(text, '***'))
            elif is_bold:
                inline_parts.append(wrap_md(text, '**'))
            elif is_italic:
                inline_parts.append(wrap_md(text, '*'))
            else:
                inline_parts.append(text)

    inline = fix_inline_spacing(''.join(inline_parts)).strip()

    if inline:
        indent = '  ' * ilvl
        if style == 'Heading3':
            result_lines.append('## %s' % inline)
        elif num_fmt == 'decimal':
            result_lines.append('%s1. %s' % (indent, inline))
        elif num_fmt == 'bullet':
            result_lines.append('%s- %s' % (indent, inline))
        else:
            result_lines.append(inline)

    return '\n'.join(result_lines), img_counter

# Parse document
data = open(os.path.join(BASE, 'docx_media', 'document.xml'), 'rb').read()
root = ET.fromstring(data)
body = root.find('{%s}body' % W)

SKIP_ROOMS = {'Room: Red Team Engagements', 'Room: Windows Local Persistence'}

def slugify(name):
    name = re.sub(r'[^a-z0-9\s-]', '', name.lower())
    return re.sub(r'[\s-]+', '_', name).strip('_')

current_module = None
current_room = None
current_room_module = None
rooms = []
room_paras = []

for para in body.findall('{%s}p' % W):
    pPr = para.find('{%s}pPr' % W)
    style = 'Normal'
    if pPr is not None:
        ps = pPr.find('{%s}pStyle' % W)
        if ps is not None:
            style = ps.get('{%s}val' % W, 'Normal')
    text = ''.join(t.text or '' for t in para.iter('{%s}t' % W)).strip()

    if style == 'Heading1' and text.startswith('Module:'):
        current_module = text
        continue
    if style == 'Heading2' and text.startswith('Room:'):
        if current_room and room_paras:
            rooms.append((current_room, current_room_module, list(room_paras)))
        current_room = text
        current_room_module = current_module
        room_paras = []
        continue
    if current_room:
        room_paras.append(para)

if current_room and room_paras:
    rooms.append((current_room, current_room_module, list(room_paras)))

part = 0
OUTPUT_DIR = os.path.join(os.path.dirname(BASE), 'src', 'md', 'writeups')
total_images = 0

for room_heading, module, paras in rooms:
    if room_heading in SKIP_ROOMS:
        continue
    part += 1
    room_name = room_heading.replace('Room: ', '').strip()
    module_name = module.replace('Module: ', '').strip() if module else 'Unknown'
    room_slug = slugify(room_name)
    filename = room_slug + '_writeup.thm.redteam.md'
    filepath = os.path.join(OUTPUT_DIR, filename)

    lines = ['---',
             'series: thm-red-team-path',
             'series_title: TryHackMe Red Team Path',
             'module: %s' % module_name,
             'part: %d' % part,
             '---', '',
             '# %s' % room_name, '']

    img_counter = 0

    for para in paras:
        md, img_counter = para_to_md(para, room_slug, img_counter)
        if md:
            # Always ensure a blank line before each content block
            if lines and lines[-1] != '':
                lines.append('')
            lines.append(md)
        # Blank docx paragraphs are ignored — blank lines are inserted automatically above

    while lines and lines[-1] == '':
        lines.pop()

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')

    total_images += img_counter
    print('Part %2d | %3d imgs | %s' % (part, img_counter, filename))

print('\nTotal: %d files, %d images copied' % (part, total_images))
