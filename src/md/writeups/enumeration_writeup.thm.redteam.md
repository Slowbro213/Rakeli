---
series: thm-red-team-path
series_title: TryHackMe Red Team Path
module: Post Compromise
part: 10
---

# Enumeration

**Purpose**
The goal of post-exploitation enumeration is to **gather information** about the compromised host and the surrounding network. Whether it’s a **server** or **user machine**, the objective is to collect data that enables:
- **Lateral movement**
- **Privilege escalation**
- **Credential harvesting**
- **Data exfiltration**
Key Targets of Enumeration
- **Users and groups**
- **Hostnames**
- **Routing tables**
- **Network shares**
- **Network services**
- **Application versions and banners**
- **Firewall configurations**
- **Service settings and audit policies**
- **SNMP and DNS settings**
- **Credentials (from browsers, client apps, config files)**
Valuable information we might find:**SSH keys**: If you find a private key, it may grant access to other systems where the matching public key is trusted.
**Saved credentials**: Files like **passwords.txt** or** passwords.xlsx** often contain valuable secrets.
**Source code**: Might expose hardcoded passwords, tokens, or keys — especially if it's not meant for public release.

**Linux Enumeration**
Identifying OS Version
- Use **ls /etc/*-release** to find distribution-specific release files.
- View detailed OS info with cat /etc/os-release.
Hostname and User Information
- **Get system name: **hostname
- **View logged-in users: **who
- **Identify current user: **whoami
- **Detailed login info: **w (shows user activity)
- **Show user/group IDs: **id
- **View login history: **last
User & Group Files
- **/etc/passwd: **Lists users and their shells (readable by all).
- **/etc/group**: Lists groups and group memberships.
- **/etc/shadow**: Stores hashed passwords (root-only access).
Mail and Sensitive Files
- Mail stored at** /var/mail/** (viewable with ls **-lh /var/mail**).
- Root's mailbox often contains sensitive info.
Installed Applications
- **View available binaries:** ls /usr/bin/** or** ls /sbin/
- **List packages:**
  - **RPM-based: **rpm -qa
  - **Debian-based: **dpkg -l
Running Services and Processes
- **List processes:**
  - ps -e, ps -ef, ps aux** for full lists.**
  - ps axf** for tree view.**
  - **Use grep to filter: e.g. **ps -ef | grep peter
Sudo Privileges
- **Check user sudo rights: **sudo -l

**Networking Enumeration**
1. Network Interfaces & IP
- ip a s **or** ifconfig **-a to view interfaces and IPs.**
2. DNS Settings
- **View DNS server:** cat /etc/resolv.conf
3. Network Connections
- **netstat options:**
  - -a: **all connections**
  - -l: **listening sockets**
  - -n:** numeric output**
  - -p: **show PID/program name**
  - -t: **TCP**, -u: **UDP**, -x:** UNIX**
- Example: sudo netstat -plt shows TCP listeners
- Example: sudo netstat -atupn shows all TCP/UDP connections
4. Open Files and Ports
- lsof -i: Show open internet/network connections
- lsof -i :25: Show services using port 25 (e.g., SMTP)

**OS and User info**: Easily accessible via** /etc** files and basic commands (**who, id, last**).
**Sensitive files**:** /etc/shadow**, **/var/mail/root**, running services.
**Network details**: Can be mapped with **ip**, **netstat**, and** lsof**.
**Processes**: **ps** shows real-time system activity, useful for identifying what users are doing.
**Security Insight**: Internal enumeration reveals much more detail than external scans (e.g., `nmap`).

**Windows Enumeration**
**System Information**
**systeminfo: **Displays OS version, hotfixes, build number, hardware, and more.
**wmic qfe get Caption,Description: **Lists installed Windows updates and hotfixes.

**Installed Applications & Services**
**wmic product get name,version,vendor**: Lists installed software.
**net start**: Shows currently running services.

**User Enumeration**
**whoami: Shows current username.**
**whoami /priv:** Lists privileges (e.g.**, SeTakeOwnershipPrivilege**)
**whoami /groups:** Lists group memberships.
**net user:** Lists all local user accounts.
**net localgroup: **Lists local groups.
**net localgroup administrators**: Lists members of the Administrators group.
**net accounts:** Displays local account and password policy.
**net accounts /domain** for domain policies.

**Network Configuration**
`ipconfig` or** **`ipconfig /all` Displays IP address, subnet mask, gateway, and DNS configuration.
`netstat -abno` Shows all listening and established connections, associated processes, and PIDs. Options:
- `-a`: **all connections**
- `-b`: **show executable**
- `-n`: **numeric IPs/ports**
- `-o`: **process ID**
`arp -a` Lists recent LAN IP-to-MAC address mappings.

**DNS,SMB and SMTP**
**DNS Enumeration**
- Purpose: Discover subdomains and internal hosts by querying DNS records.
- Records: Common types include `A`**, **`AAAA`**, **`CNAME`**, **`TXT`.
- Zone Transfer:
  - A misconfigured DNS server may allow full zone transfers, revealing all records.
Use the `dig` command:`dig -t AXFR DOMAIN_NAME @DNS_SERVER`
    - `-t AXFR`: Zone transfer query type
    - `@DNS_SERVER`: Target DNS server
**SMB Enumeration**
Purpose: Identify shared folders, files, printers, and users on Windows systems.
Command:**net share**
- Reveals all shared resources.
Other tools: **smbclient, enum4linux, and crackmapexec** can also be used for advanced enumeration.

**Other Windows Tools**
**Sysinternals Suite**
The Sysinternals Suite is a group of command-line and GUI utilities and tools that provides information about various aspects related to the Windows system. To give you an idea, we listed a few examples in the table below.

**Process Explorer**Shows the processes along with the open files and registry keys
**Process Monitor**Monitor the file system, processes, and Registry
**PsList**Provides information about processes
**PsLoggedOn**Shows the logged-in users
Check **Sysinternals Utilities Index** for a complete list of the utilities.
**Process Hacker**
Another efficient and reliable MS Windows GUI tool that lets you gather information about running processes is Process Hacker. Process Hacker gives you detailed information regarding running processes and related active network connections; moreover, it gives you deep insight into system resource utilization from CPU and memory to disk and network.

**GhostPack Seatbelt**
Seatbelt, part of the GhostPack collection, is a tool written in C#. It is not officially released in binary form; therefore, you are expected to compile it yourself using MS Visual Studio.
