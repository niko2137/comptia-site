/**
 * encrypt-content.js
 * 
 * Encrypts the protected HTML content using XOR + Base64 encoding.
 * Password: A+CompTIA#1200
 * 
 * Usage: node encrypt-content.js
 * 
 * This outputs the encrypted blob that gets pasted into members.html.
 * The decryption logic in the browser reverses this process:
 *   1. Base64 decode the blob
 *   2. XOR each byte with the password (repeating)
 *   3. UTF-8 decode the result
 *   4. Verify the result starts with the marker "<!--VERIFIED-->"
 * 
 * To update the protected content:
 *   1. Edit the `plaintext` variable below
 *   2. Run: node encrypt-content.js
 *   3. Copy the output and replace the ENCRYPTED_BLOB value in members.html
 */

const crypto = require('crypto');

const PASSWORD = 'A+CompTIA#1200';

// The marker that proves decryption succeeded
const MARKER = '<!--VERIFIED-->';

// Protected HTML content
const plaintext = MARKER + `
<div class="members-welcome">
  <div class="welcome-banner">
    <h2>Welcome, book owner!</h2>
    <p>Here's your exclusive content. You've earned it.</p>
  </div>

  <!-- SECTION A: SEARCHABLE GLOSSARY -->
  <div class="glossary-section">
    <h3>Key Terms &amp; Concepts</h3>
    <div class="glossary-controls">
      <div class="search-wrapper">
        <span class="search-icon">&#128269;</span>
        <input type="text" id="glossarySearch" placeholder="Search terms..." class="glossary-search">
      </div>
      <div class="filter-buttons">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="HIGH">HIGH</button>
        <button class="filter-btn" data-filter="MED">MEDIUM</button>
        <button class="filter-btn" data-filter="LOW">LOW</button>
      </div>
    </div>
    <div class="glossary-grid" id="glossaryGrid">
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="tcp">
        <div class="glossary-card-header"><h4>TCP</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Connection-oriented, guarantees delivery. Web, email, file transfers.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="udp">
        <div class="glossary-card-header"><h4>UDP</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Connectionless, no guarantee. Streaming, VoIP, gaming, DNS.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="dhcp">
        <div class="glossary-card-header"><h4>DHCP</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Auto-assigns IPs. Ports 67/68. DORA process.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="dns">
        <div class="glossary-card-header"><h4>DNS</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Names to IPs. Port 53. A, AAAA, MX, CNAME records.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="ssh">
        <div class="glossary-card-header"><h4>SSH</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Port 22. Encrypted CLI access. Replaces Telnet.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="https">
        <div class="glossary-card-header"><h4>HTTPS</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Port 443. Encrypted web. TLS/SSL.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="rdp remote desktop">
        <div class="glossary-card-header"><h4>RDP</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Port 3389. Windows remote desktop. Never expose without VPN.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="smb file sharing">
        <div class="glossary-card-header"><h4>SMB</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Port 445. Windows file sharing. Block from WAN.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="vlan virtual lan">
        <div class="glossary-card-header"><h4>VLAN</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Logical network segments. Needs L3 for inter-VLAN routing.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="nat network address translation">
        <div class="glossary-card-header"><h4>NAT</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Private IPs share one public IP via router.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="bitlocker encryption">
        <div class="glossary-card-header"><h4>BitLocker</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Full-disk encryption. Needs TPM + Pro/Enterprise.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="apipa 169.254">
        <div class="glossary-card-header"><h4>APIPA</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>169.254.x.x = DHCP failure. Always.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="tpm trusted platform module">
        <div class="glossary-card-header"><h4>TPM</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Security chip. Required for BitLocker and Windows 11.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="raid 5 striping parity">
        <div class="glossary-card-header"><h4>RAID 5</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Striping + parity. Min 3 drives. Survives 1 failure.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="secure erase ssd">
        <div class="glossary-card-header"><h4>Secure Erase</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>SSD firmware wipe. Correct method for SSDs.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="ransomware malware">
        <div class="glossary-card-header"><h4>Ransomware</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Encrypts data, demands payment. Disconnect, don't pay, restore backup.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="mfa multi-factor authentication">
        <div class="glossary-card-header"><h4>MFA</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Two or more factors: know/have/are.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="evil twin wifi attack">
        <div class="glossary-card-header"><h4>Evil Twin</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Fake Wi-Fi AP with same SSID. Use VPN on public Wi-Fi.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="pxe boot network">
        <div class="glossary-card-header"><h4>PXE Boot</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Network boot via DHCP+TFTP. Enterprise OS deployment.</p>
      </div>
      <div class="glossary-card priority-high" data-priority="HIGH" data-term="sfc scannow system file checker">
        <div class="glossary-card-header"><h4>sfc /scannow</h4><span class="priority-badge badge-high">HIGH</span></div>
        <p>Repairs corrupted Windows system files.</p>
      </div>
    </div>
  </div>

  <!-- SECTION B: FLASH CARDS -->
  <div class="flashcard-section">
    <h3>Flash Card Study Mode</h3>
    <p class="section-desc">Click a card to flip it. Use the arrows to navigate. Master all 20 terms!</p>
    <div class="flashcard-controls">
      <button class="fc-btn" id="fcPrev">&#9664; Previous</button>
      <span class="fc-counter" id="fcCounter">1 / 20</span>
      <button class="fc-btn" id="fcNext">Next &#9654;</button>
      <button class="fc-btn fc-shuffle" id="fcShuffle">&#128256; Shuffle</button>
    </div>
    <div class="flashcard-container" id="flashcardContainer">
      <div class="flashcard" id="flashcard" onclick="this.classList.toggle('flipped')">
        <div class="flashcard-front"><h3 id="fcFront">TCP</h3><p class="fc-hint">Click to reveal</p></div>
        <div class="flashcard-back"><p id="fcBack">Connection-oriented, guarantees delivery. Web, email, file transfers.</p></div>
      </div>
    </div>
    <div class="fc-progress"><div class="fc-progress-bar" id="fcProgress"></div></div>
  </div>

  <!-- SECTION C: ARCADE GAMES -->
  <div class="games-section">
    <h3>Arcade Learning Games</h3>
    <p class="section-desc">Learn while you play! These games reinforce exam concepts through gameplay.</p>
    <div class="games-grid">
      <div class="game-card">
        <div class="game-icon">&#127918;</div>
        <h4>Cable Match</h4>
        <p>Falling cables drop from above — sort them into the correct speed categories before they hit the ground!</p>
        <div class="game-tags"><span>Networking</span><span>Core 1</span></div>
        <button class="btn btn-primary game-launch" data-game="cable-match">Play Now</button>
      </div>
      <div class="game-card">
        <div class="game-icon">&#127959;</div>
        <h4>Troubleshooting Tower</h4>
        <p>Stack the correct troubleshooting methodology steps in order before the tower collapses!</p>
        <div class="game-tags"><span>Methodology</span><span>Core 2</span></div>
        <button class="btn btn-primary game-launch" data-game="troubleshoot-tower">Play Now</button>
      </div>
      <div class="game-card">
        <div class="game-icon">&#128308;</div>
        <h4>OSI Layer Climb</h4>
        <p>Identify which OSI layer each protocol belongs to as you climb from Layer 1 to Layer 7!</p>
        <div class="game-tags"><span>Networking</span><span>Core 1</span></div>
        <button class="btn btn-primary game-launch" data-game="osi-climb">Play Now</button>
      </div>
      <div class="game-card">
        <div class="game-icon">&#127775;</div>
        <h4>Port Blaster</h4>
        <p>Arcade-style speed game! Match ports to protocols in 60 seconds. Beat your high score!</p>
        <div class="game-tags"><span>Ports</span><span>Speed</span></div>
        <a href="pbq/game.html" class="btn btn-primary">Play Now</a>
      </div>
    </div>
  </div>

  <!-- SECTION D: BONUS STUDY TOOLS -->
  <div class="bonus-section">
    <h3>Bonus Study Tools</h3>
    <div class="bonus-grid">
      <div class="bonus-card">
        <h4>&#9989; Exam Day Checklist</h4>
        <ul class="checklist">
          <li><label><input type="checkbox"> Bring two forms of ID</label></li>
          <li><label><input type="checkbox"> Arrive 15 minutes early</label></li>
          <li><label><input type="checkbox"> Know your Pearson VUE login</label></li>
          <li><label><input type="checkbox"> Review port numbers one last time</label></li>
          <li><label><input type="checkbox"> Remember: flag difficult questions and come back</label></li>
          <li><label><input type="checkbox"> Read EVERY answer before selecting</label></li>
          <li><label><input type="checkbox"> Eliminate obviously wrong answers first</label></li>
          <li><label><input type="checkbox"> Check for "BEST" or "FIRST" in the question stem</label></li>
        </ul>
      </div>
      <div class="bonus-card">
        <h4>&#128197; Study Schedule</h4>
        <div class="schedule">
          <div class="schedule-week"><strong>Week 1-2:</strong> Hardware + Networking (Core 1 heaviest domains)</div>
          <div class="schedule-week"><strong>Week 3:</strong> OS + Troubleshooting commands</div>
          <div class="schedule-week"><strong>Week 4:</strong> Security + Cloud + Mobile</div>
          <div class="schedule-week"><strong>Week 5:</strong> Practice PBQs + Review weak areas</div>
          <div class="schedule-week"><strong>Week 6:</strong> Full practice exams + final glossary review</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION E: RESOURCE CENTER -->
  <div class="resource-section">
    <h3>Resource Center</h3>
    <p class="section-desc">Curated resources, freebies, and tools for IT professionals and CompTIA candidates.</p>
    <div class="resource-grid">
      <div class="resource-card">
        <div class="resource-icon">&#127891;</div>
        <h4>CompTIA Official Resources</h4>
        <ul>
          <li><a href="https://www.comptia.org/certifications/a" target="_blank">CompTIA A+ Certification Page</a></li>
          <li><a href="https://www.comptia.org/training/resources/exam-objectives" target="_blank">Official Exam Objectives (PDF)</a></li>
          <li><a href="https://www.comptia.org/blog" target="_blank">CompTIA Blog &amp; News</a></li>
        </ul>
      </div>
      <div class="resource-card">
        <div class="resource-icon">&#127909;</div>
        <h4>Video Tutorials</h4>
        <ul>
          <li><a href="https://www.youtube.com/c/professormesser" target="_blank">Professor Messer (Free Videos)</a></li>
          <li><a href="https://www.youtube.com/c/PowerCertAnimatedVideos" target="_blank">PowerCert Animated Videos</a></li>
          <li><a href="https://www.cbtnuggets.com" target="_blank">CBT Nuggets (Premium)</a></li>
        </ul>
      </div>
      <div class="resource-card">
        <div class="resource-icon">&#128295;</div>
        <h4>Free Tools for Techs</h4>
        <ul>
          <li><a href="https://www.sysinternals.com" target="_blank">Sysinternals Suite</a></li>
          <li><a href="https://www.wireshark.org" target="_blank">Wireshark Network Analyzer</a></li>
          <li><a href="https://rufus.ie" target="_blank">Rufus (Bootable USB Creator)</a></li>
          <li><a href="https://www.voidtools.com" target="_blank">Everything Search</a></li>
        </ul>
      </div>
      <div class="resource-card">
        <div class="resource-icon">&#128218;</div>
        <h4>Practice Exams &amp; Labs</h4>
        <ul>
          <li><a href="https://www.examcompass.com/comptia-a-plus-certification-exam-free-practice-test" target="_blank">ExamCompass Free Tests</a></li>
          <li><a href="https://www.professormesser.com/220-1101-practice-exam/" target="_blank">Messer Practice Exams</a></li>
          <li><a href="https://www.pearsonvue.com/comptia" target="_blank">Pearson VUE (Schedule Exam)</a></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- SECTION F: QUICK LINKS -->
  <div class="quick-links-section">
    <h3>Quick Links</h3>
    <div class="links-grid">
      <a href="pbq/hardware.html" class="link-card"><span>&#128421;</span> Hardware PBQ</a>
      <a href="pbq/networking.html" class="link-card"><span>&#127760;</span> Networking PBQ</a>
      <a href="pbq/os.html" class="link-card"><span>&#128187;</span> OS PBQ</a>
      <a href="pbq/security.html" class="link-card"><span>&#128274;</span> Security PBQ</a>
      <a href="pbq/mobile.html" class="link-card"><span>&#128241;</span> Mobile PBQ</a>
      <a href="pbq/game.html" class="link-card"><span>&#127918;</span> Port Blaster</a>
      <a href="reference/ports.html" class="link-card"><span>&#128268;</span> Port Reference</a>
      <a href="reference/cables.html" class="link-card"><span>&#128279;</span> Cable Guide</a>
      <a href="reference/commands.html" class="link-card"><span>&#9000;</span> Commands</a>
      <a href="reference/bios.html" class="link-card"><span>&#9881;</span> BIOS/UEFI</a>
    </div>
    <div class="coming-soon">
      <p>&#127775; More exclusive content coming soon — check back regularly!</p>
    </div>
  </div>
</div>`;

// XOR encode function
function xorEncode(text, password) {
  const textBytes = Buffer.from(text, 'utf-8');
  const passBytes = Buffer.from(password, 'utf-8');
  const result = Buffer.alloc(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i++) {
    result[i] = textBytes[i] ^ passBytes[i % passBytes.length];
  }
  
  return result.toString('base64');
}

// Generate SHA-256 hash of password (used for localStorage remember-me)
const passwordHash = crypto.createHash('sha256').update(PASSWORD).digest('hex');

// Encrypt the content
const encrypted = xorEncode(plaintext, PASSWORD);

console.log('=== PASSWORD HASH (SHA-256) ===');
console.log(passwordHash);
console.log('');
console.log('=== ENCRYPTED BLOB LENGTH ===');
console.log(`${encrypted.length} characters`);
console.log('');

// Write to a temp file for easy inclusion
const fs = require('fs');
fs.writeFileSync('/projects/sandbox/comptia-site/encrypted-blob.txt', encrypted);
console.log('Written to encrypted-blob.txt');
