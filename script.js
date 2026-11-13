const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// --- Project detail sheet ---
const projects = {
  "hg6145d2-extender": {
    title: "HG6145D2 Wi-Fi Extender",
    meta: "FiberHome HG6145D2 · BusyBox shell",
    brief: "Reverse-engineered a locked FiberHome HG6145D2 fiber router via UART boot break and reprogrammed it as a dual-band Wi-Fi extender with NAT, DHCP, and a web control page.",
    steps: [
      "Broke into the stock ISP firmware via UART boot break to get a root shell.",
      "wl0 joins upstream Wi-Fi as a client and gets an IP via udhcpc.",
      "wl0.1 (2.4GHz) and wl1 (5GHz) rebroadcast as access points.",
      "br0 bridges wl0.1, wl1, and lan0–lan3; udhcpd serves DHCP; iptables does NAT.",
      "Web control page for status, clients, uplink scan/connect, SSID, WPA2, hostname, MAC, AP on/off.",
      "Settings persist across reboots in /fhconf/mytools.",
    ],
    facts: {
      Device: "FiberHome HG6145D2 (Broadcom, Linux 4.1.52, armv7l)",
      Shell: "BusyBox 1.30.1 sh",
      Access: "UART boot break → root shell",
      Radios: "wl0 (client) + wl0.1 (2.4GHz AP) + wl1 (5GHz AP)",
      Repo: "github.com/sheedmunir/extender",
    },
    tools: ["BusyBox sh", "wpa_supplicant", "udhcpc", "udhcpd", "iptables", "hostapd"],
    outcome: "A locked ISP fiber router turned into a dual-band Wi-Fi extender with a phone-sized control page.",
  }
};

const sheet = document.getElementById('project-sheet');
const sheetPanel = document.getElementById('sheet-panel');
const sheetScroll = document.getElementById('sheet-scroll');
const pageMain = document.getElementById('main');
const pageNav = document.querySelector('.nav');
let opener = null;

function openProject(id) {
  const p = projects[id];
  if (!p) return;
  document.getElementById('sheet-title').textContent = p.title;
  document.getElementById('sheet-meta').textContent = p.meta;
  document.getElementById('sheet-brief').textContent = p.brief;
  document.getElementById('sheet-steps').innerHTML = p.steps.map(s => `<li>${s}</li>`).join('');
  document.getElementById('sheet-facts').innerHTML = Object.entries(p.facts).map(([k, v]) => {
    const value = k === 'Repo'
      ? `<a href="https://${v}" target="_blank" rel="noopener">${v}</a>`
      : v;
    return `<dt>${k}</dt><dd>${value}</dd>`;
  }).join('');
  document.getElementById('sheet-tools').innerHTML = p.tools.map(t => `<span class="chip">${t}</span>`).join('');
  document.getElementById('sheet-outcome').textContent = p.outcome;
  opener = document.activeElement;
  sheet.classList.add('open');
  sheet.removeAttribute('aria-hidden');
  pageMain.inert = true;
  pageNav.inert = true;
  document.body.style.overflow = 'hidden';
  sheetScroll.scrollTop = 0;
  document.getElementById('sheet-back').focus();
}

function closeProject() {
  if (!sheet.classList.contains('open')) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  pageMain.inert = false;
  pageNav.inert = false;
  document.body.style.overflow = '';
  if (opener && opener.focus) opener.focus();
  opener = null;
}

document.querySelectorAll('.project-card').forEach(card => {
  const open = () => openProject(card.dataset.project);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
});

document.getElementById('sheet-back').addEventListener('click', closeProject);
document.getElementById('sheet-close').addEventListener('click', closeProject);

document.addEventListener('keydown', e => {
  if (!sheet.classList.contains('open')) return;
  if (e.key === 'Escape') { closeProject(); return; }
  if (e.key !== 'Tab') return;
  const focusable = sheetPanel.querySelectorAll('button, a[href]');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
