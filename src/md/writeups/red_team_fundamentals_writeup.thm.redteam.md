---
series: thm-red-team-path
series_title: TryHackMe Red Team Path
module: Red Team Fundamentals
part: 1
---

# Red Team Fundamentals


A **vulnerability assessment** focuses on scanning hosts for vulnerabilities as individual entities so that security deficiencies can be **Identified** and effective security measures can be deployed to **protect** the network in a prioritized manner.

**Penetration Tests**
Pentesters can explore the impact of an attacker on the network by doing additional steps like exploiting the vulnerabilities found in systems and conducting post-exploitation tasks on a compromised host to extract helpful information or pivot to other hosts which were previously inaccessible.

**APTs and why Regular Pentesting is not enough**

Limitations to security engagements and how much they can prepare a company against a real attacker may include: Time Constrains, Budget, Limited Scope, Non-disruptiveness and Heavy IT Focus

Penetration tests differ from real-life attacks. They are much louder since they have no need to stay undetected, they have been contracted for this pentest after all.
There is also a common tendency to ignore non-technical attack vectors like attacks based on social engineering (phishing etc.) and physical intrusions when performing a test.

Also, most of the time some security mechanisms are disabled to provide efficiency to the pentesting team, due to the fact they only have a limited time to perform the network check. Therefore they don’t need to find ways to bypass security systems like WAFs etc. but can focus on protecting critical infrastructure directly.

Real attackers however are unrestricted and the most major groups are known as Advanced Persistent Threats **(APTs)**, who are formed of either skilled groups of people or state actors.

Red team engagements are advanced security assessments focused on testing an organization's detection and response capabilities rather than just identifying vulnerabilities. Unlike traditional penetration tests, red teaming simulates real-world threat actors using stealthy Tactics, Techniques, and Procedures (TTPs) to achieve specific goals (e.g., data exfiltration or server compromise) without alerting defenders.

Red team exercises can include:
**Technical attacks** (infrastructure exploitation),**Social engineering** (phishing, pretexting),**Physical intrusion** (access control bypass).
Common formats include:
**Full Engagement** (from initial compromise to objective),**Assumed Breach** (start with limited access),**Tabletop Exercises** (theoretical scenarios).

Red teams often use adversary emulation to simulate real-world attackers, applying known TTPs to test how defenders respond. A core framework for structuring these simulations is the **Cyber Kill Chain**, commonly used by both red and blue teams to map attacker behavior.
