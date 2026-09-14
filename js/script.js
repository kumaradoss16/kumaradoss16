/* ============================================================
   WAVE FUNCTION — IT ENGINEERING COMMAND CENTER PORTFOLIO
   script.js  |  Kumaradoss S
   ============================================================ */

'use strict';

/* ------------------------------------------------------------------
   UTILITY HELPERS
   ------------------------------------------------------------------ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// Escapes user-controlled text before it is ever placed into innerHTML.
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg, duration = 3500) {
  const container = $('#toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.35s ease';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ------------------------------------------------------------------
   1. STATUS BAR — LIVE CLOCK
   ------------------------------------------------------------------ */
function initClock() {
  const el = $('#status-time');
  if (!el) return;
  function tick() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    el.innerHTML = `<strong>UTC+5:30</strong> <span>${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}</span>`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ------------------------------------------------------------------
   2. STICKY NAVIGATION & ACTIVE SECTION HIGHLIGHT
   ------------------------------------------------------------------ */
function initNav() {
  const sections = $$('section[id], div[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = navLinks.find(l => l.getAttribute('href') === '#' + e.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.2, rootMargin: '-60px 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));

  // Mobile Hamburger Drawer
  const hamburger = $('#nav-hamburger');
  const navLinksContainer = $('#nav-links');
  if (hamburger && navLinksContainer) {
    function toggleDrawer(open) {
      navLinksContainer.classList.toggle('mobile-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }

    hamburger.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.contains('mobile-open');
      toggleDrawer(!isOpen);
    });

    navLinksContainer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => toggleDrawer(false));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinksContainer.classList.contains('mobile-open')) {
        toggleDrawer(false);
      }
    });
  }

  // Terminal Button in Nav
  const termBtn = $('#nav-terminal-btn');
  if (termBtn) {
    termBtn.addEventListener('click', () => {
      const terminal = $('.hero-terminal-card');
      const cliTab = $('#tab-cli');
      if (terminal) {
        cliTab?.click();
        terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => $('#terminal-input')?.focus(), 600);
      }
    });
  }
}

/* ------------------------------------------------------------------
   AUDIENCE VIEW SWITCHER
   ------------------------------------------------------------------ */
function initAudienceSwitcher() {
  const btns = $$('.audience-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.dataset.role;

      if (role === 'recruiter') {
        executeTerminalCommand('recruiter');
        showToast('Switched to Recruiter Profile view.');
      } else if (role === 'client') {
        executeTerminalCommand('client');
        $('#services-pc')?.scrollIntoView({ behavior: 'smooth' });
        showToast('Viewing Client PC & Web Services.');
      } else if (role === 'tech') {
        executeTerminalCommand('tech');
        showToast('Viewing Technical Lead architecture.');
      } else {
        executeTerminalCommand('help');
        showToast('Showing all-in-one portfolio.');
      }
    });
  });
}

/* ------------------------------------------------------------------
   3. COMMAND PALETTE (CTRL + K)
   ------------------------------------------------------------------ */
const COMMAND_DESTINATIONS = [
  { name: 'Capabilities & Domains', target: '#domains', key: 'Section' },
  { name: 'Architecture Lab & Topology', target: '#architecture', key: 'Lab' },
  { name: 'Selected Projects & Case Studies', target: '#projects', key: 'Work' },
  { name: 'Ongoing Research & Labs', target: '#ongoing', key: 'Status' },
  { name: 'Professional Experience Timeline', target: '#experience', key: 'Career' },
  { name: 'Education & Qualifications', target: '#education', key: 'Academic' },
  { name: 'Verified Certifications Matrix', target: '#certifications', key: 'Certs' },
  { name: 'Interactive CLI Terminal', target: '#terminal-section', key: 'Shell' },
  { name: 'DevspireHub Knowledge Engine', target: '#devspirehub', key: 'Founder' },
  { name: 'Freelance Desktop & Web Services', target: '#services-pc', key: 'Services' },
  { name: 'Support Request & Contact Form', target: '#contact', key: 'Inquiry' },
  { name: 'Open Resume Generator', action: 'resume', key: 'Modal' },
  { name: 'Share Portfolio', action: 'share', key: 'Modal' },
  { name: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/kumaradoss-s/', key: 'External' },
  { name: 'GitHub Profile', url: 'https://github.com/', key: 'External' }
];

function initCommandPalette() {
  const modal = $('#cmd-modal');
  const input = $('#cmd-search-input');
  const results = $('#cmd-results');
  const openBtn = $('#nav-cmd-btn');
  const closeBtn = $('#cmd-modal-close');

  if (!modal || !input || !results) return;

  function renderList(query = '') {
    const q = query.toLowerCase().trim();
    const filtered = COMMAND_DESTINATIONS.filter(d => d.name.toLowerCase().includes(q) || d.key.toLowerCase().includes(q));

    results.innerHTML = filtered.map(item => `
      <div class="cmd-item" data-target="${item.target || ''}" data-url="${item.url || ''}" data-action="${item.action || ''}" role="option" tabindex="0">
        <span>${item.name}</span>
        <span class="cmd-item-key">[ ${item.key} ]</span>
      </div>
    `).join('');

    $$('.cmd-item', results).forEach(el => {
      el.addEventListener('click', () => triggerItem(el));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') triggerItem(el); });
    });
  }

  function triggerItem(el) {
    const target = el.dataset.target;
    const url = el.dataset.url;
    const action = el.dataset.action;

    closeCmdModal();
    if (action === 'resume') {
      $('#nav-resume-btn')?.click();
    } else if (action === 'share') {
      $('#floating-share')?.click();
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (target) {
      $(target)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function openCmdModal() {
    renderList('');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }

  function closeCmdModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openCmdModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCmdModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeCmdModal(); });

  input.addEventListener('input', () => renderList(input.value));

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (modal.classList.contains('open')) closeCmdModal();
      else openCmdModal();
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeCmdModal();
    }
  });
}

/* ------------------------------------------------------------------
   SKILL BARS — ANIMATE ON SCROLL
   ------------------------------------------------------------------ */
function initSkillBars() {
  const fills = $$('.skill-bar-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.width || 0;
        e.target.style.width = w + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
}

/* ------------------------------------------------------------------
   SKILLS FILTER
   ------------------------------------------------------------------ */
function initSkillsFilter() {
  const btns = $$('.filter-btn');
  const cards = $$('.skill-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        card.setAttribute('aria-hidden', String(!match));
      });
    });
    btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
  });
}

/* ------------------------------------------------------------------
   4. INTERACTIVE SVG TOPOLOGY INSPECTOR (HERO)
   ------------------------------------------------------------------ */
const TOPOLOGY_DATABASE = {
  internet: {
    device: 'INTERNET WAN',
    role: 'External uplink & upstream ISP gateway',
    tools: 'BGP routing, Fiber / Ethernet WAN',
    notes: 'Zero-trust perimeter boundary, dynamic DNS resolution.'
  },
  firewall: {
    device: 'FIREWALL (pfSense / Netgate)',
    role: 'Stateful packet filtering & network security perimeter',
    tools: 'pfSense, UFW, Snort IDS, Strict ACLs',
    notes: 'Default-deny inbound policy, DMZ routing, NAT overload.'
  },
  router: {
    device: 'CORE ROUTER / LAYER 3 SWITCH',
    role: 'Inter-VLAN routing & subnet segmentation gateway',
    tools: 'Cisco IOS, Router-on-a-Stick, 802.1Q Trunks',
    notes: 'Enforces routing boundaries between VLAN 10, 20, and 30.'
  },
  server: {
    device: 'LINUX APPLICATION SERVER',
    role: 'Hosts internal tools, web applications, and database services',
    tools: 'Ubuntu Linux, Nginx, Gunicorn, Docker, Python 3',
    notes: 'SSH key-only auth, Fail2Ban, isolated on VLAN 20.'
  },
  client: {
    device: 'WINDOWS CLIENT WORKSTATION',
    role: 'Operator desktop endpoint & diagnostics lab PC',
    tools: 'Windows 11 Pro, PowerShell, Sysinternals, Wireshark',
    notes: 'Workstation subnet on VLAN 10, authenticated via domain controls.'
  },
  vpn: {
    device: 'IPSEC / WIREGUARD VPN GATEWAY',
    role: 'Encrypted remote administration tunnel',
    tools: 'WireGuard, OpenVPN, IPSec, 2FA MFA',
    notes: 'Secure remote management access to lab nodes.'
  },
  monitoring: {
    device: 'DATABASE & SIEM MONITORING',
    role: 'Centralized telemetry, log aggregation, and health checks',
    tools: 'PostgreSQL, Wazuh SIEM, Wireshark, Prometheus',
    notes: 'Continuous log inspection and audit trail compliance.'
  }
};

function initTopologyInspector() {
  const nodes = $$('.topo-node');
  const inspector = $('#node-inspector');
  if (!nodes.length || !inspector) return;

  function inspect(key) {
    const data = TOPOLOGY_DATABASE[key];
    if (!data) return;
    inspector.innerHTML = `
      <strong>${data.device}:</strong> ${data.role}<br>
      <span>Tools:</span> ${data.tools} &nbsp;|&nbsp; <span>Notes:</span> ${data.notes}
    `;
  }

  nodes.forEach(node => {
    node.addEventListener('click', () => inspect(node.dataset.node));
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inspect(node.dataset.node);
      }
    });
  });
}

/* ------------------------------------------------------------------
   5. TECHNOLOGY STACK MATRIX FILTERING
   ------------------------------------------------------------------ */
function initStackFilters() {
  const btns = $$('.filter-btn[data-filter]');
  const rows = $$('#stack-table-body tr');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      rows.forEach(row => {
        const cat = row.dataset.cat || '';
        const match = filter === 'all' || cat.includes(filter);
        row.style.display = match ? '' : 'none';
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Case Study Data Repository for all 6 projects
  const caseStudiesData = {
    'net-diag': {
      code: 'PROJECT // NET-001',
      title: 'Network Diagnostic API',
      subtitle: 'A modular FastAPI service for automated network diagnostics and structured JSON results.',
      overview: [
        { label: 'TYPE', val: 'Backend API' },
        { label: 'ROLE', val: 'Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / FastAPI' }
      ],
      problem: 'Manual network testing and reachability troubleshooting across multiple endpoints is repetitive, slow, and lacks standardized machine-readable outputs for automation scripts.',
      objectives: [
        'Standardize diagnostic operations',
        'Reduce repetitive manual checks',
        'Provide structured API responses',
        'Support multiple diagnostic methods'
      ],
      architecture: [
        { type: 'step', text: 'CLIENT REQUEST (HTTP GET/POST)' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'API ROUTER / ENDPOINT VALIDATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'CORE SERVICE LAYER (Pings, DNS, Ports)' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'STRUCTURED JSON RESPONSE MODEL' }
      ],
      implementation: [
        { title: 'FastAPI Routing', desc: 'Asynchronous route handlers for fast execution and non-blocking network socket operations.' },
        { title: 'Pydantic Validation', desc: 'Strict payload validation for target IP addresses, hostnames, and port ranges to prevent injection attacks.' }
      ],
      technology: ['Python', 'FastAPI', 'Pydantic', 'HTTPX', 'AsyncIO', 'Pytest', 'Linux'],
      security: 'Implemented strict input regex validation on all target host parameters, timeout bounds on socket queries, and safe error handling without leaking internal stack traces.',
      challenges: 'Handling asynchronous timeout states gracefully when querying unresponsive target hosts without blocking the ASGI event loop.',
      solution: 'Engineered an asynchronous worker pattern utilizing AsyncIO tasks with explicit timeout thresholds, ensuring reliable service performance.',
      results: 'Delivered a reproducible, container-ready diagnostic backend service capable of running automated network sanity checks in sub-second timeframes.',
      future: [
        'Authentication & authorization middleware',
        'Rate limiting per client token',
        'Monitoring dashboard integration',
        'Persistent historical query logging'
      ],
      links: [
        { label: 'VIEW SOURCE', url: 'https://github.com/kumaradoss16/network-diagnostic-api', primary: true },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/network-diagnostic-api/blob/main/README.md', primary: false }
      ]
    },
    'net-diag-tool': {
      code: 'PROJECT // NET-001',
      title: 'Network Diagnostics Tool',
      subtitle: 'Python-based utility for performing practical network connectivity and diagnostic checks.',

      overview: [
        { label: 'TYPE', val: 'Networking / Python' },
        { label: 'ROLE', val: 'Network Engineer / Python Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / Networking' }
      ],

      problem: 'Network troubleshooting often requires running multiple commands and utilities separately to identify connectivity, DNS, IP, and network-related issues. This makes basic diagnostics repetitive and less convenient.',

      objectives: [
        'Provide a simple Python-based network diagnostics utility',
        'Perform common connectivity and network information checks',
        'Present diagnostic information in a clear and usable format',
        'Create a practical tool for learning and real-world network troubleshooting'
      ],

      architecture: [
        { type: 'step', text: 'USER / NETWORK TARGET' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'PYTHON NETWORK DIAGNOSTICS TOOL' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'CONNECTIVITY / DNS / IP DIAGNOSTIC CHECKS' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'NETWORK DIAGNOSTIC RESULTS' }
      ],

      implementation: [
        {
          title: 'Network Diagnostics',
          desc: 'Implemented Python-based checks to collect practical network connectivity and diagnostic information.'
        },
        {
          title: 'Network Information',
          desc: 'Provides useful network and IP-related information to support basic troubleshooting and analysis.'
        },
        {
          title: 'Diagnostic Workflow',
          desc: 'Combined common network checks into a single utility to make routine troubleshooting more convenient.'
        }
      ],

      technology: [
        'Python',
        'Networking',
        'DNS',
        'IP Diagnostics',
        'Network Troubleshooting'
      ],

      security: 'Designed for legitimate network troubleshooting and authorized environments. Network targets and diagnostic operations should only be used against systems and networks for which the user has permission.',

      challenges: 'Handling different network conditions and diagnostic failures while keeping the tool simple enough to provide useful information during troubleshooting.',

      solution: 'Built a lightweight Python networking utility that brings common diagnostic operations into a single workflow, reducing the need to manually execute multiple network troubleshooting commands.',

      results: 'Created a practical Python-based networking tool that can assist with basic connectivity analysis, DNS and IP diagnostics, and day-to-day network troubleshooting.',

      future: [
        'Add additional network diagnostic checks',
        'Improve structured diagnostic reporting',
        'Add logging and historical results',
        'Add a graphical or web-based interface',
        'Add automated network health monitoring'
      ],

      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/Networking/tree/main/Python/Network%20Diagnostics%20Tool',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/Networking/blob/main/Python/Network%20Diagnostics%20Tool/readme.md', primary: false }
      ]
    },
    'http-analyzer': {
      code: 'PROJECT // NET-002',
      title: 'HTTP Request Analyzer',
      subtitle: 'Command-line Python tool for analyzing DNS, HTTP, redirects, response headers, timing, and TLS certificate information.',

      overview: [
        { label: 'TYPE', val: 'Networking / CLI Tool' },
        { label: 'ROLE', val: 'Network Engineer / Python Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / Requests / SSL' }
      ],

      problem: 'Understanding what happens when a client connects to a web server often requires using multiple tools to inspect DNS resolution, HTTP responses, redirects, response headers, timing, and TLS certificate details.',

      objectives: [
        'Build a command-line tool for practical HTTP diagnostics',
        'Resolve target hostnames and measure DNS resolution time',
        'Analyze HTTP status, headers, redirects, response time, and response size',
        'Inspect TLS protocol, cipher suite, and certificate information for HTTPS targets'
      ],

      architecture: [
        { type: 'step', text: 'COMMAND-LINE URL INPUT' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'URL / HOSTNAME PROCESSING' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'DNS RESOLUTION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'HTTP REQUEST / REDIRECT ANALYSIS' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'HTTPS TLS / CERTIFICATE INSPECTION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TERMINAL DIAGNOSTIC REPORT' }
      ],

      implementation: [
        {
          title: 'DNS Analysis',
          desc: 'Uses Python socket resolution to identify IPv4 and IPv6 addresses and measure hostname resolution time.'
        },
        {
          title: 'HTTP Analysis',
          desc: 'Sends an HTTP GET request and reports status code, reason, response time, headers, downloaded response size, and redirect information.'
        },
        {
          title: 'TLS Inspection',
          desc: 'For HTTPS targets, establishes a TLS connection and reports the negotiated protocol, cipher suite, certificate subject, issuer, validity period, and remaining certificate lifetime.'
        },
        {
          title: 'Command-Line Interface',
          desc: 'Uses argparse to accept a target URL together with configurable request timeout and optional insecure TLS verification.'
        }
      ],

      technology: [
        'Python',
        'Requests',
        'Socket',
        'SSL/TLS',
        'Cryptography',
        'Argparse',
        'Dataclasses'
      ],

      security: 'Designed for authorized diagnostic use. The tool performs network connections to user-supplied destinations, so targets should only be systems the user owns or has permission to analyze. The --insecure option disables TLS certificate and hostname verification and should be limited to trusted testing environments.',

      challenges: 'Collecting DNS, HTTP, redirect, timing, and TLS information through different Python networking interfaces while presenting the results as one consistent command-line report.',

      solution: 'Created a lightweight Python analyzer that combines socket-based DNS resolution, requests-based HTTP analysis, and ssl/cryptography-based TLS certificate inspection into a single diagnostic workflow.',

      results: 'Delivered a command-line networking tool capable of analyzing DNS resolution, HTTP response behavior, redirects, response headers, timing, response size, and HTTPS/TLS certificate information from a single command.',

      future: [
        'Add JSON and CSV report output',
        'Support custom HTTP headers and proxy configuration',
        'Add retry handling for temporary network failures',
        'Improve URL validation and error handling',
        'Add automated tests for DNS, HTTP, redirects, and TLS',
        'Add structured logging',
        'Support additional HTTP methods'
      ],

      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/Networking/tree/main/Python/http-request-analyzer',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/Networking/blob/main/Python/http-request-analyzer/README.md', primary: false }
      ]
    },
    'advanced-lan-scanner': {
      code: 'PROJECT // NET-004',
      title: 'Advanced LAN Network Scanner',
      subtitle: 'Multi-threaded Python LAN scanner for discovering live hosts, identifying network information, scanning common TCP ports, and generating structured reports.',

      overview: [
        { label: 'TYPE', val: 'Networking / Security Tool' },
        { label: 'ROLE', val: 'Network Engineer / Security Engineer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / Networking / Multithreading' }
      ],

      problem: 'Manual LAN discovery often requires multiple tools and commands to identify active hosts, determine basic device information, inspect common open ports, and organize the results. This makes routine network inventory and troubleshooting time-consuming.',

      objectives: [
        'Discover live hosts across a specified LAN subnet',
        'Collect hostname, MAC address, vendor, and TTL information',
        'Estimate the likely operating system using network fingerprints',
        'Scan the top 100 commonly used TCP ports on active hosts',
        'Perform basic banner grabbing on detected open ports',
        'Generate structured JSON and CSV reports for later analysis'
      ],

      architecture: [
        { type: 'step', text: 'LAN SUBNET / CIDR INPUT' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'MULTI-THREADED ICMP PING SWEEP' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'LIVE HOST DISCOVERY' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'HOST INFORMATION & OS FINGERPRINTING' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TOP 100 TCP PORT SCAN + BANNER GRABBING' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'JSON / DETAILED CSV / SUMMARY CSV' }
      ],

      implementation: [
        {
          title: 'Two-Phase Network Scanning',
          desc: 'Uses a fast ICMP ping sweep to identify active hosts first, then performs deeper scanning only against hosts that respond.'
        },
        {
          title: 'Multi-Threaded Discovery',
          desc: 'Uses ThreadPoolExecutor to perform parallel host discovery, per-host scanning, and TCP port checks for faster LAN scanning.'
        },
        {
          title: 'OS Fingerprinting',
          desc: 'Estimates the likely operating system using TTL values together with MAC vendor information and heuristic classification.'
        },
        {
          title: 'MAC & Vendor Discovery',
          desc: 'Reads the local ARP table to obtain MAC addresses and uses mac-vendor-lookup to identify the associated hardware manufacturer.'
        },
        {
          title: 'Hostname Resolution',
          desc: 'Performs reverse DNS lookups for discovered hosts to obtain hostnames when available.'
        },
        {
          title: 'Port & Banner Scanning',
          desc: 'Checks the top 100 commonly used TCP ports on active hosts and performs lightweight banner grabbing when an open port is detected.'
        },
        {
          title: 'Structured Reporting',
          desc: 'Exports complete scan information to JSON, detailed per-port CSV, and per-host summary CSV files with timestamped filenames.'
        }
      ],
      technology: [
        'Python',
        'ThreadPoolExecutor',
        'ICMP Ping',
        'TCP',
        'ARP',
        'Reverse DNS',
        'MAC Vendor Lookup',
        'JSON',
        'CSV'
      ],
      security: 'Designed for authorized network administration, auditing, and educational use. Scanning should only be performed against networks and devices that the operator owns or has explicit permission to test. Port and OS identification are heuristic and should not be treated as definitive security findings.',
      challenges: 'Scanning an entire LAN efficiently while avoiding unnecessary work on inactive hosts, handling platform-specific ping behavior, retrieving local ARP information, and performing parallel TCP checks without making the scanning workflow unnecessarily slow.',
      solution: 'Implemented a two-stage multi-threaded scanner that first discovers active hosts and then performs deeper host analysis only where required. The tool combines ping-based discovery, TTL and MAC-vendor heuristics, reverse DNS, TCP port scanning, basic banner grabbing, and structured report generation into one workflow.',
      results: 'Created a cross-platform LAN scanning utility capable of discovering live hosts, collecting network identity information, estimating operating systems, identifying commonly open TCP ports, displaying basic service banners, calculating scan statistics, and exporting the results in JSON and CSV formats.',
      future: [
        'Add configurable port ranges and custom port lists',
        'Improve OS fingerprinting accuracy',
        'Add additional service detection',
        'Add configurable scan concurrency',
        'Add richer network topology visualization',
        'Add HTML report generation',
        'Add scan comparison and historical reporting',
        'Add configurable output directories'
      ],
      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/Networking/tree/main/Python/Advanced%20LAN%20Scanner%20Tool',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/Networking/blob/main/Python/Advanced%20LAN%20Scanner%20Tool/README.md', primary: false }
      ]
    },
    'network-sweep': {
      code: 'PROJECT // NET-005',
      title: 'Network Sweep Tool',
      subtitle: 'Cross-platform Python CLI tool for discovering active devices on a local subnet and collecting practical network identity information.',
      overview: [
        { label: 'TYPE', val: 'Networking / CLI Tool' },
        { label: 'ROLE', val: 'Network Engineer / Python Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / Networking / Multithreading' }
      ],
      problem: 'Manually discovering active devices across a local network requires checking hosts individually and using multiple commands to collect IP addresses, hostnames, MAC addresses, vendors, and response information. This makes basic network inventory and troubleshooting slower and less convenient.',
      objectives: [
        'Discover active devices across a specified subnet',
        'Perform concurrent host scanning for faster network discovery',
        'Collect IP address, TTL, response time, hostname, and MAC information',
        'Identify hardware vendors using MAC address information',
        'Estimate device type from TTL-based network characteristics',
        'Automatically detect the local subnet when no target network is provided',
        'Export scan results as JSON for scripting and logging'
      ],
      architecture: [
        { type: 'step', text: 'LOCAL NETWORK / CIDR INPUT' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'NETWORK SUBNET ENUMERATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'MULTI-THREADED PING SWEEP' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'ACTIVE HOST DISCOVERY' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'ARP / HOSTNAME / VENDOR LOOKUP' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TTL-BASED DEVICE TYPE DETECTION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TABLE / JSON NETWORK REPORT' }
      ],
      implementation: [
        {
          title: 'Concurrent Network Scanning',
          desc: 'Uses Python ThreadPoolExecutor to scan multiple hosts concurrently, allowing large local subnets to be checked efficiently.'
        },
        {
          title: 'Host Discovery',
          desc: 'Sends platform-native ping requests to subnet hosts and records whether each device is active together with TTL and round-trip response time.'
        },
        {
          title: 'MAC Address Resolution',
          desc: 'Reads the operating system ARP table to retrieve MAC addresses associated with discovered hosts.'
        },
        {
          title: 'Vendor Identification',
          desc: 'Uses the MAC address and IEEE OUI database through mac-vendor-lookup to identify the likely hardware manufacturer.'
        },
        {
          title: 'Hostname Resolution',
          desc: 'Performs reverse DNS lookups for active devices to retrieve hostnames when available.'
        },
        {
          title: 'Device Type Detection',
          desc: 'Uses TTL values to estimate whether a discovered device is likely running Linux/Unix, Windows, or functioning as a network device such as a router or switch.'
        },
        {
          title: 'Automatic Network Detection',
          desc: 'Can determine the local subnet automatically when no target network is supplied, making the tool convenient for local network inventory.'
        },
        {
          title: 'Structured JSON Output',
          desc: 'Provides an optional JSON output mode so scan results can be saved, processed by scripts, or used for logging.'
        }
      ],
      technology: [
        'Python',
        'ThreadPoolExecutor',
        'ICMP Ping',
        'ARP',
        'Reverse DNS',
        'MAC / OUI Lookup',
        'CIDR / IP Addressing',
        'JSON',
        'Socket',
        'Subprocess'
      ],
      security: 'Designed for legitimate network administration, troubleshooting, inventory, and authorized educational environments. Network scanning should only be performed against networks and devices that the operator owns or has explicit permission to inspect. MAC address retrieval may require administrator or root privileges.',
      challenges: 'Scanning an entire subnet efficiently while collecting additional host information such as MAC addresses, hostnames, vendors, TTL values, and response times. Platform differences between Windows, native Linux, and WSL also affect ARP and MAC address availability.',
      solution: 'Built a cross-platform Python command-line utility that combines concurrent ping discovery with ARP table inspection, reverse DNS, MAC vendor lookup, and TTL-based device classification. The workflow focuses on identifying active devices first and then collecting additional network information for those hosts.',
      results: 'Created a practical LAN discovery tool capable of scanning up to 254 hosts concurrently, identifying active devices, reporting response time and TTL values, resolving hostnames, identifying MAC vendors, estimating device types, and exporting complete results as JSON.',
      future: [
        'Add configurable output file paths',
        'Add CSV report generation',
        'Improve device and operating-system fingerprinting',
        'Add configurable ping methods and retry handling',
        'Add richer network inventory reporting',
        'Add historical scan comparison',
        'Add network topology visualization',
        'Add additional device identification methods'
      ],
      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/Networking/tree/main/Python/Network%20Sweep%20Tool',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/Networking/blob/main/Python/Network%20Sweep%20Tool/README.md', primary: false }
      ]
    },
    'atm-system': {
      code: 'PROJECT // PY-006',
      title: 'ATM System Management',
      subtitle: 'Multi-user Python ATM banking simulation with SQLite database, authentication, transaction processing, receipt generation, and administrative controls.',
      overview: [
        { label: 'TYPE', val: 'Python / Database Application' },
        { label: 'ROLE', val: 'Python Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'Python / SQLite' }
      ],
      problem: 'Basic ATM simulations often focus only on menu-driven operations without persistent data, transaction history, authentication controls, or administrative management. This project was designed as a more complete banking simulation with database persistence, user security, transaction management, and ATM administration.',
      objectives: [
        'Build a multi-user ATM banking application using Python',
        'Store account and transaction data persistently using SQLite',
        'Implement secure user authentication with masked PIN input',
        'Provide balance inquiry, deposit, withdrawal, mini statement, and PIN change operations',
        'Implement account lockout after repeated failed login attempts',
        'Generate transaction receipts with masked account information',
        'Provide an authenticated administrative panel for account and ATM management',
        'Protect financial operations using validation and transaction rollback'
      ],
      architecture: [
        { type: 'step', text: 'USER / ADMIN INPUT' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'PYTHON ATM APPLICATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'AUTHENTICATION & INPUT VALIDATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'USER / ADMIN OPERATIONS' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'SQLITE DATABASE' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TRANSACTION LOGS / RECEIPTS / UPDATED ACCOUNT STATE' }
      ],
      implementation: [
        {
          title: 'User Account Management',
          desc: 'Implemented account creation with validated names, unique 10-digit account numbers, secure PIN setup, and minimum initial deposit requirements.'
        },
        {
          title: 'Authentication & Account Lockout',
          desc: 'Implemented masked PIN input using getpass, hashed PIN verification, failed-attempt tracking, and automatic account locking after three unsuccessful login attempts.'
        },
        {
          title: 'Banking Transactions',
          desc: 'Implemented balance inquiry, deposits, withdrawals, mini statements, and PIN changes with validation and persistent transaction records.'
        },
        {
          title: 'Withdrawal Validation',
          desc: 'Withdrawal processing checks account balance, minimum required balance, daily withdrawal limits, and available ATM cash before modifying account and ATM balances.'
        },
        {
          title: 'SQLite Database',
          desc: 'Uses SQLite to persist users, transactions, account status, withdrawal information, ATM cash reserves, daily limits, and administrator credentials.'
        },
        {
          title: 'Transaction Safety',
          desc: 'Uses a database transaction context manager with automatic commit and rollback so failed operations do not leave partial database updates.'
        },
        {
          title: 'Receipt Generation',
          desc: 'Generates timestamped transaction receipt files containing transaction details while masking the account number to expose only the final four digits.'
        },
        {
          title: 'Administrative Controls',
          desc: 'Provides authenticated administrative operations for unlocking accounts, viewing accounts, monitoring ATM cash, refilling ATM reserves, reviewing transactions, and changing the administrator password.'
        }
      ],
      technology: [
        'Python',
        'SQLite',
        'SQL',
        'getpass',
        'Hashlib',
        'Regular Expressions',
        'Context Managers',
        'File I/O',
        'Datetime',
        'Type Hints'
      ],
      security: 'The application implements several security controls including masked PIN input, SHA-256 credential hashing, PIN-strength validation, account lockout after three failed attempts, account-number masking in receipts, administrator authentication, input validation, parameterized SQL queries, and database rollback protection. The project is an educational banking simulation and should not be treated as production banking software. In particular, the README notes that user PIN hashing uses unsalted SHA-256 and recommends stronger password/PIN storage such as unique salts for production use.',
      challenges: 'Maintaining consistent account balances, ATM cash reserves, transaction records, authentication state, and daily withdrawal limits while ensuring that failed operations do not partially modify the database. The application also needs to coordinate user-level and administrator-level operations through a shared SQLite database.',
      solution: 'Built a single-file Python ATM application backed by SQLite. Database helpers manage persistent account and transaction data, authentication functions control access, transaction operations validate financial constraints before execution, and a database transaction context manager provides automatic commit and rollback behavior.',
      results: 'Created a functional multi-user ATM banking simulation with persistent SQLite storage, account authentication, account lockout, deposits, withdrawals, balance inquiries, mini statements, PIN changes, transaction logging, receipt generation, ATM cash management, and administrator controls.',
      future: [
        'Add unique per-user salts or a dedicated password hashing algorithm such as Argon2 or bcrypt',
        'Add transaction reversal and refund functionality',
        'Implement multi-factor authentication',
        'Add user-specific withdrawal limits',
        'Add transaction search and filtering',
        'Add email or SMS transaction notifications',
        'Create a web-based interface',
        'Add account closure functionality',
        'Implement interest calculation for savings accounts',
        'Add multi-currency support',
        'Implement detailed audit logging and compliance features'
      ],
      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/Projects-Programming/tree/main/Python/ATM%20System%20Management',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/Projects-Programming/blob/main/Python/ATM%20System%20Management/readme.md', primary: false }
      ]
    },
    'netpulse': {
      code: 'PROJECT // WEB-007',
      title: 'NetPulse',
      subtitle: 'Browser-based internet speed tester interface built with HTML, CSS, and JavaScript with animated results, server selection, network information, and test history.',
      overview: [
        { label: 'TYPE', val: 'Web Application / Utility' },
        { label: 'ROLE', val: 'Web Developer' },
        { label: 'STATUS', val: 'Completed' },
        { label: 'STACK', val: 'HTML / CSS / JavaScript' }
      ],
      problem: 'Internet speed testing normally requires a service that performs actual network data transfers. This project focuses on building a browser-based speed test experience with server selection, animated measurements, network information, charts, and session history using a static web application.',

      objectives: [
        'Build a browser-based internet speed testing interface',
        'Display download, upload, ping, jitter, and packet loss results',
        'Provide an animated speedometer and live charts during testing',
        'Provide nearby and global server selection',
        'Display available public IP and network information',
        'Maintain test results during the current browser session',
        'Create the application without a frontend framework or build system'
      ],
      architecture: [
        { type: 'step', text: 'USER / BROWSER' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'NETPULSE WEB INTERFACE' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'SERVER SELECTION & NETWORK INFORMATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'PING / DOWNLOAD / UPLOAD TEST SIMULATION' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'GAUGE & LIVE CHARTS' },
        { type: 'arrow', text: '↓' },
        { type: 'step', text: 'TEST RESULTS / SESSION HISTORY' }
      ],
      implementation: [
        {
          title: 'Speed Test Interface',
          desc: 'Built a browser-based interface for starting and displaying download speed, upload speed, ping, jitter, and packet loss results.'
        },
        {
          title: 'Animated Speedometer',
          desc: 'Implemented an animated gauge that updates during the test to provide visual feedback as the test progresses.'
        },
        {
          title: 'Live Charts',
          desc: 'Uses Chart.js to display changing test values during the speed test.'
        },
        {
          title: 'Server Selection',
          desc: 'Provides a built-in list of servers distributed across multiple cities and can sort nearby servers using browser geolocation when permission is available.'
        },
        {
          title: 'Network Information',
          desc: 'Uses external IP information services to display available public IP, ISP, city, country, and timezone information.'
        },
        {
          title: 'Test Phases',
          desc: 'The interface runs through ping, download, and upload phases and updates the displayed results and visualizations during each phase.'
        },
        {
          title: 'Session History',
          desc: 'Stores completed test results for display in the application during the current page session.'
        },
        {
          title: 'Responsive Web Interface',
          desc: 'Implemented the application as a static web project using HTML, CSS, and JavaScript without a frontend framework or build step.'
        }
      ],
      technology: [
        'HTML5',
        'CSS3',
        'JavaScript',
        'Chart.js',
        'Browser Geolocation API',
        'Fetch API',
        'IP Lookup APIs',
        'Tabler Icons',
        'Font Awesome',
        'Google Fonts'
      ],
      security: 'The application runs in the browser and relies on external IP information services for network details. Browser geolocation requires user permission. External API availability and browser security policies can affect network information display. The project does not provide authentication or collect user accounts.',
      challenges: 'Creating a convincing browser-based speed test experience while coordinating server selection, location-based sorting, external network information requests, animated gauges, charts, test phases, and result history in a static JavaScript application.',
      solution: 'Built a client-side web application that combines a large predefined server dataset with browser geolocation, external IP information lookups, animated test phases, Chart.js visualizations, and session-based result history.',
      results: 'Created a functional browser-based internet speed tester interface with server selection, network information, animated speedometer, live charts, download and upload result displays, ping and jitter information, speed ratings, and test history.',
      future: [
        'Replace generated test values with actual network throughput measurements',
        'Add real download and upload test endpoints',
        'Implement real packet loss measurement',
        'Add more accurate latency and jitter measurement',
        'Add persistent test history',
        'Add selectable test servers backed by real endpoints',
        'Add configurable test duration and data size',
        'Improve network information API fallback handling'
      ],
      links: [
        {
          label: 'VIEW SOURCE',
          url: 'https://github.com/kumaradoss16/netpulse/tree/main',
          primary: true
        },
        { label: 'DOCUMENTATION', url: 'https://github.com/kumaradoss16/netpulse/blob/main/readme.md', primary: false }
      ]
    }
  };

  const modal = document.getElementById('case-study-modal');
  if (!modal) return;

  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  const caseStudyButtons = document.querySelectorAll('.btn-case-study');
  
  let lastFocusedElement = null;

  function openModal(projectId) {
    const data = caseStudiesData[projectId];
    if (!data) return;

    lastFocusedElement = document.activeElement;

    // Populate Header
    document.getElementById('modal-project-code').textContent = data.code;
    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-desc').textContent = data.subtitle;

    // Populate Overview
    const overviewGrid = document.getElementById('modal-overview-grid');
    overviewGrid.innerHTML = data.overview.map(item => `
      <div class="cs-meta-card">
        <span class="cs-meta-label">${item.label}</span>
        <span class="cs-meta-val">${item.val}</span>
      </div>
    `).join('');

    // Populate Problem
    document.getElementById('modal-problem').textContent = data.problem;

    // Populate Objectives
    const objContainer = document.getElementById('modal-objectives');
    objContainer.innerHTML = data.objectives.map((obj, idx) => `
      <div class="cs-obj-item">
        <span class="cs-obj-num">0${idx + 1}</span>
        <span class="cs-obj-text">${obj}</span>
      </div>
    `).join('');

    // Populate Architecture
    const archContainer = document.getElementById('modal-architecture');
    archContainer.innerHTML = data.architecture.map(item => {
      if (item.type === 'arrow') {
        return `<div class="cs-arch-arrow">${item.text}</div>`;
      }
      return `<div class="cs-arch-step"><span>${item.text}</span><span style="color:var(--orange)">■</span></div>`;
    }).join('');

    // Populate Implementation
    const implContainer = document.getElementById('modal-implementation');
    implContainer.innerHTML = data.implementation.map(impl => `
      <div class="cs-impl-card">
        <h4 class="cs-impl-title">${impl.title}</h4>
        <p class="cs-impl-desc">${impl.desc}</p>
      </div>
    `).join('');

    // Populate Technology Stack
    const techContainer = document.getElementById('modal-technology');
    techContainer.innerHTML = data.technology.map(tech => `
      <span class="cs-tech-tag">${tech}</span>
    `).join('');

    // Populate Security & Reliability
    document.getElementById('modal-security').textContent = data.security;

    // Populate Challenges
    document.getElementById('modal-challenges').textContent = data.challenges;

    // Populate Solution
    document.getElementById('modal-solution').textContent = data.solution;

    // Populate Results
    document.getElementById('modal-results').textContent = data.results;

    // Populate Future Improvements
    const futureContainer = document.getElementById('modal-future');
    futureContainer.innerHTML = data.future.map((fut, idx) => `
      <div class="cs-future-item">
        <span class="cs-future-num">0${idx + 1}</span>
        <span>${fut}</span>
      </div>
    `).join('');

    // Populate Footer Links
    const footerContainer = document.getElementById('modal-footer-actions');
    footerContainer.innerHTML = data.links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="cs-btn-action ${link.primary ? 'cs-btn-primary' : 'cs-btn-secondary'}">
        ${link.label} &#x2197;
      </a>
    `).join('');

    // Show modal & lock body scroll
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    const closeBtn = modal.querySelector('.cs-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  // Event Listeners for Project Cards
  caseStudyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  // Close triggers
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
});

/* ------------------------------------------------------------------
   6. CASE STUDY DETAIL MODAL (12 TECHNICAL SECTIONS)
   ------------------------------------------------------------------ */
const CASE_STUDIES_DATA = {
  'net-diag': {
    title: 'PROJECT // NET-001: NETWORK DIAGNOSTIC API',
    problem: 'Network troubleshooting often requires running separate tools such as ping, DNS lookup, TCP port checks, and HTTP requests manually. The results are inconsistent and difficult to consume programmatically from applications, scripts, or dashboards.',
    objectives: 'Build a lightweight REST API that provides a consistent interface for common network diagnostics, including reachability, DNS resolution, TCP connectivity, HTTP/HTTPS checks, latency, jitter, and combined diagnostics.',
    constraints: 'Keep the API lightweight and cross-platform while handling network timeouts, malformed input, operating-system differences, and potentially unsafe diagnostic targets without requiring a database or external services.',
    architecture: 'Client / CLI / API Documentation → FastAPI Router → Pydantic Request Validation → Target Policy Check → Diagnostic Service Layer → OS Networking / Sockets / HTTP Client → Pydantic Response Model → Structured JSON Response.',
    implementation: 'Developed modular FastAPI endpoints with separate service modules for DNS, TCP port checks, HTTP/HTTPS connectivity, ping, latency/jitter, and combined diagnostics. Used asyncio for concurrent operations and Pydantic models for request and response validation.',
    technology: 'Python 3.12+, FastAPI, Uvicorn, Pydantic, Pydantic Settings, asyncio, httpx, Linux/Windows networking utilities, pytest, pytest-asyncio.',
    security: 'Implemented strict hostname, IP, port, URL, count, and timeout validation. Added an optional private-target blocking policy to reject private, loopback, link-local, reserved, and multicast targets before network activity occurs, helping reduce SSRF-style misuse.',
    challenges: 'Handling platform differences in the system ping command while keeping the API asynchronous and non-blocking. The solution uses OS-specific ping arguments, executes blocking subprocess work through asyncio.to_thread, and parses platform-specific RTT output.',
    solution: 'Designed a layered FastAPI architecture that separates routing, validation, diagnostic services, configuration, error handling, and utilities. Each diagnostic returns a consistent structured result containing status, timing, and diagnostic-specific information.',
    results: 'Delivered six reusable diagnostic operations through a single REST API, with structured JSON responses, centralized error handling, interactive Swagger/ReDoc documentation, automated tests, and support for Windows, Linux, and macOS.',
    future: 'Add authentication and authorization, persistent diagnostic history, rate limiting, a web-based monitoring dashboard, scheduled health checks, historical latency and packet-loss visualization, and distributed probe nodes.',
    source: 'https://github.com/kumaradoss16/network-diagnostic-api'
  },
  'nmap-dash': {
    title: 'PROJECT // SEC-002: NMAP SECURITY DASHBOARD',
    problem: 'Terminal-based Nmap outputs can be hard to quickly parse and communicate during security baseline audits and authorized laboratory assessments.',
    objectives: 'Create an intuitive, responsive web management interface for authorized laboratory host scanning, service discovery visualization, and port vulnerability auditing.',
    constraints: 'Strictly restricted to authorized local RFC 1918 subnets; zero exposure to public internet scanning vectors.',
    architecture: 'Web Client UI → Python Flask Backend Controller → python-nmap Scan Orchestrator → XML/JSON Parser → Normalized Security Output Grid.',
    implementation: 'Built scanning templates (Quick Ping Sweep, Top 100 Ports, Version Detection) with live progress logging and exportable structured audit reports.',
    technology: 'Python, Flask, python-nmap, JavaScript, HTML5/CSS3, Linux Security Utilities.',
    security: 'Authorized laboratory environments only, session authentication, strict target IP restriction to RFC 1918 private subnets, detailed audit logging, and safe defaults.',
    challenges: 'Managing long-running asynchronous scans without blocking web server worker threads; solved using background worker queues and polling endpoints.',
    solution: 'Designed an asynchronous scan dispatcher that decouples scanning execution from frontend request threads.',
    results: 'Significantly reduced time required to audit local lab subnets and visual host discovery reporting.',
    future: 'Integrate automated CVE vulnerability cross-referencing and PDF audit generation.',
    source: 'https://github.com/'
  },
  'it-utils': {
    title: 'PROJECT // WEB-003: DEVELOPER & IT UTILITY PLATFORM',
    problem: 'Engineers frequently need quick, reliable, zero-data-leakage tools for subnet calculation, hash verification, DNS queries, and text transformations.',
    objectives: 'Construct an all-in-one, client-side, zero-telemetry utility platform that works instantly in the browser without sending sensitive customer data to third parties.',
    constraints: 'Zero external dependencies or CDNs; must run 100% locally in the browser sandbox.',
    architecture: 'Modular Vanilla JavaScript Web Components → Browser Web Crypto API / Bitwise Engines → Pure CSS High-Performance Grid.',
    implementation: 'Implemented bitwise binary math for IPv4 subnet calculations, Web Crypto API for SHA-256 generation, and responsive client-side tools.',
    technology: 'HTML5, CSS3, Vanilla ES6+, Web Crypto API, Browser Storage API.',
    security: '100% Client-side execution with zero external analytics or data persistence, ensuring sensitive client IP schemas and passwords never leave the local browser.',
    challenges: 'Achieving sub-10ms UI updates across heavy data conversions while maintaining zero external framework dependencies.',
    solution: 'Utilized native browser APIs (btoa, atob, crypto.subtle, bitwise operators) for maximum performance and zero dependency overhead.',
    results: 'Instant load speed, 100/100 Google Lighthouse Core Web Vitals, and total privacy assurance.',
    future: 'Add IPv6 prefix calculator and certificate expiry inspector.',
    source: 'https://github.com/'
  },
  'cis-auditor': {
    title: 'PROJECT // SEC-004: CIS ENDPOINT COMPLIANCE AUDITOR',
    problem: 'Manual verification of CIS benchmark guidelines across multi-host environments is tedious and error-prone.',
    objectives: 'Automate endpoint compliance auditing across Windows and Linux workstations with structured reporting.',
    constraints: 'Read-only audit permissions; cannot modify target system registries or configurations without operator approval.',
    architecture: 'Audit Core (Python / PowerShell) → Registry & GPO Inspector → Benchmark Rule Evaluator → HTML/CSV Scorecard Generator.',
    implementation: 'Created benchmark checks for password complexity, account lockout, audit log retention, firewall status, and unquoted service paths.',
    technology: 'Python 3, PowerShell, Windows WMI, Linux /etc/security auditing, Bash.',
    security: 'Read-only execution flags, cryptographic checksum validation of benchmark rule definitions.',
    challenges: 'Normalizing disparate Windows Registry formats and Linux sysctl configurations into a unified data structure.',
    solution: 'Engineered a unified JSON compliance schema mapping platform-specific audit tests to standard CIS control IDs.',
    results: 'Reduced manual host auditing time from 45 minutes to under 60 seconds per endpoint.',
    future: 'Add remediation script generator for automated one-click hardening.',
    source: 'https://github.com/'
  },
  'packet-sim': {
    title: 'PROJECT // NET-005: PACKET FLOW & VLAN SIMULATOR',
    problem: 'Students and junior engineers often struggle to understand 802.1Q trunk tagging and inter-VLAN routing conceptually.',
    objectives: 'Build an interactive visual simulator demonstrating packet encapsulation, MAC table lookups, and Router-on-a-Stick traversal.',
    constraints: 'Pure browser-based simulation without external canvas dependencies.',
    architecture: 'State Machine Engine (ES6) → SVG Topology Renderer → Packet Step Animator → Live Frame Inspector.',
    implementation: 'Modeled Ethernet frame headers (Preamble, DMAC, SMAC, 802.1Q Tag, EtherType, IP Payload) with animated packet travel across ports.',
    technology: 'HTML5 Canvas, SVG, Vanilla JavaScript, CSS Animations.',
    security: 'Zero external dependencies, completely sandboxed educational simulation.',
    challenges: 'Synchronizing multi-hop packet animations with frame-by-frame header state updates.',
    solution: 'Implemented an asynchronous discrete-event simulation queue that drives visual SVG transitions.',
    results: 'Deployed in corporate training cohorts, significantly improving learner grasp of VLAN trunking concepts.',
    future: 'Add Spanning Tree Protocol (STP) root election and loop prevention visualization.',
    source: 'https://github.com/'
  },
  'backup-runner': {
    title: 'PROJECT // OPS-006: ENCRYPTED BACKUP & RECOVERY RUNNER',
    problem: 'Critical configuration files and database dumps need automated, encrypted offsite backups with real-time alerting.',
    objectives: 'Develop a resilient backup workflow that handles incremental deduplication, GPG symmetric encryption, and failure alerting.',
    constraints: 'Must handle network disconnects gracefully with automatic retry backoff.',
    architecture: 'Linux Systemd Timer → Backup Runner Script → Borg / Rsync Deduplication → GPG Encryption → Telegram Webhook Bot.',
    implementation: 'Scripted automated snapshots with hash validation, log rotation, and instant status messages sent to a Telegram management channel.',
    technology: 'Bash, Python 3, GPG, Borg Backup, Systemd Timers, Telegram Bot API.',
    security: 'AES-256 GPG encryption before leaving local disk, private keys stored in secure keyring.',
    challenges: 'Ensuring backups complete even during intermittent network bandwidth throttling.',
    solution: 'Integrated exponential backoff retry algorithms with pre-flight network reachability checks.',
    results: '100% reliable automated nightly backups across lab nodes with zero data corruption incidents.',
    future: 'Add multi-cloud S3 replication target support.',
    source: 'https://github.com/'
  }
};

function initCaseStudyModals() {
  const modal = $('#case-study-modal');
  const modalTitle = $('#cs-modal-title');
  const modalBody = $('#cs-modal-body');
  const closeBtn = $('#cs-modal-close');
  let lastTrigger = null;

  if (!modal || !modalTitle || !modalBody || !closeBtn) return;

  function openModal(projKey, triggerEl) {
    const data = CASE_STUDIES_DATA[projKey];
    if (!data) return;
    lastTrigger = triggerEl;

    modalTitle.textContent = data.title;
    modalBody.innerHTML = `
      <div class="case-study-section"><p class="case-sec-title">01 — PROBLEM</p><p class="case-sec-text">${data.problem}</p></div>
      <div class="case-study-section"><p class="case-sec-title">02 — OBJECTIVES</p><p class="case-sec-text">${data.objectives}</p></div>
      <div class="case-study-section"><p class="case-sec-title">03 — CONSTRAINTS</p><p class="case-sec-text">${data.constraints}</p></div>
      <div class="case-study-section"><p class="case-sec-title">04 — ARCHITECTURE</p><p class="case-sec-text mono" style="background:#050E17;padding:0.75rem;border-radius:4px;border:1px solid var(--border-dark);color:var(--cyan);font-size:0.78rem;">${data.architecture}</p></div>
      <div class="case-study-section"><p class="case-sec-title">05 — IMPLEMENTATION</p><p class="case-sec-text">${data.implementation}</p></div>
      <div class="case-study-section"><p class="case-sec-title">06 — TECHNOLOGY</p><p class="case-sec-text">${data.technology}</p></div>
      <div class="case-study-section"><p class="case-sec-title">07 — SECURITY &amp; RISK CONTROLS</p><p class="case-sec-text">${data.security}</p></div>
      <div class="case-study-section"><p class="case-sec-title">08 — CHALLENGES</p><p class="case-sec-text">${data.challenges}</p></div>
      <div class="case-study-section"><p class="case-sec-title">09 — SOLUTION</p><p class="case-sec-text">${data.solution}</p></div>
      <div class="case-study-section"><p class="case-sec-title">10 — RESULTS</p><p class="case-sec-text">${data.results}</p></div>
      <div class="case-study-section"><p class="case-sec-title">11 — FUTURE IMPROVEMENTS</p><p class="case-sec-text">${data.future}</p></div>
      <div class="case-study-section"><p class="case-sec-title">12 — SOURCE CODE &amp; REPOSITORY</p><p class="case-sec-text"><a href="${data.source}" target="_blank" rel="noopener noreferrer" style="color:var(--orange);font-family:var(--font-mono);font-weight:500;">GITHUB REPOSITORY &#x2197;</a></p></div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  // Attach to dynamically added and static case study buttons
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-case-study');
    if (btn) {
      openModal(btn.dataset.project, btn);
    }
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* ------------------------------------------------------------------
   7. VIEW ALL TOGGLES (PROJECTS & ONGOING SECTIONS)
   ------------------------------------------------------------------ */
function initViewAllToggles() {
  // Toggle for Projects
  const projToggleBtn = $('#btn-toggle-all-projects');
  const projExtended = $$('.project-card-extended');

  if (projToggleBtn) {
    projToggleBtn.addEventListener('click', () => {
      const isExpanded = projToggleBtn.getAttribute('aria-expanded') === 'true';
      projExtended.forEach(card => {
        card.style.display = isExpanded ? 'none' : 'flex';
      });
      projToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      projToggleBtn.innerHTML = isExpanded 
        ? 'VIEW ALL PROJECTS (6) &darr;' 
        : 'COLLAPSE PROJECTS &uarr;';
    });
  }

  // Toggle for Ongoing Systems
  const ongoingToggleBtn = $('#btn-toggle-all-ongoing');
  const ongoingExtended = $$('.ongoing-card-extended');

  if (ongoingToggleBtn) {
    ongoingToggleBtn.addEventListener('click', () => {
      const isExpanded = ongoingToggleBtn.getAttribute('aria-expanded') === 'true';
      ongoingExtended.forEach(card => {
        card.style.display = isExpanded ? 'none' : 'flex';
      });
      ongoingToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      ongoingToggleBtn.innerHTML = isExpanded 
        ? 'VIEW ALL SYSTEMS (6) &darr;' 
        : 'COLLAPSE SYSTEMS &uarr;';
    });
  }
}

/* ------------------------------------------------------------------
   8. ONGOING SYSTEM TELEMETRY POPUP MODAL
   ------------------------------------------------------------------ */
const ONGOING_SYSTEMS_DATA = {
  netsecureops: {
    name: '01 — NetSecureOps',
    badge: '● ACTIVE PRODUCTION LAB',
    tagline: 'Network security and diagnostics platform',
    objective: 'Build tools for practical network diagnostics, monitoring, and security-oriented operations.',
    architecture: 'Decoupled Python diagnostic microservices with FastAPI gateway, asynchronous ping/DNS socket workers, and responsive dashboard.',
    currentFocus: 'Implementing automated packet loss telemetry graphs and scheduled port connectivity probes across subnet nodes.',
    toolchain: 'Python 3, FastAPI, Linux Sockets, Docker, Nginx, PostgreSQL, UFW.',
    security: 'Strict input sanitization against command injection, rate-limiting per client IP, and sandboxed socket workers.',
    milestone: 'V1.0 Public Open-Source Release target: Q2 2026.'
  },
  devspirehub: {
    name: '01 — DevspireHub',
    badge: '● ACTIVE KNOWLEDGE ENGINE',
    tagline: 'Technical education & knowledge platform',
    objective: 'Publish practical tutorials, programming projects, networking content, cybersecurity resources, and automation guides.',
    architecture: 'High-performance Jamstack knowledge base, structured markdown documentation engine, and interactive developer sandboxes.',
    currentFocus: 'Authoring in-depth guides for IPv4 Subnetting, Linux CIS Benchmark Hardening, and Python Network Automation.',
    toolchain: 'Semantic HTML5, CSS3, Vanilla JavaScript, Markdown, Static Site Engine.',
    security: 'Zero client telemetry, strict Content Security Policy (CSP), and privacy-first static hosting.',
    milestone: 'Over 25+ published technical articles and interactive labs.'
  },
  
  'network-monitoring-dashboard': {
    name: '02 — Network Monitoring Dashboard',
    badge: '◐ IN PROGRESS',
    tagline: 'Network monitoring & infrastructure visibility platform',
    objective: 'Build a centralized dashboard for monitoring network devices, connectivity, availability, performance indicators, and overall infrastructure health.',
    architecture: 'Centralized monitoring dashboard with network-device data collection, health checks, status aggregation, metric processing, and a web-based visualization layer.',
    currentFocus: 'Developing device discovery, connectivity monitoring, availability checks, network health indicators, status dashboards, and structured monitoring views.',
    toolchain: 'Python, networking libraries, HTTP APIs, HTML5, CSS3, JavaScript, JSON, and monitoring-oriented data processing.',
    security: 'Designed for authorized infrastructure monitoring with controlled device access, authenticated management interfaces, input validation, restricted monitoring targets, and secure handling of credentials.',
    milestone: 'Core monitoring architecture and dashboard workflow under active development.'
  },

  'email-service-manager': {
    name: '03 — Email Service Manager',
    badge: '◐ PLANNED',
    tagline: 'Email infrastructure & service management platform',
    objective: 'Develop a centralized management interface for configuring, monitoring, and operating email services, including service status, delivery operations, logs, and administrative controls.',
    architecture: 'Management interface connected to email-service components through controlled service APIs and system-level administration workflows, with centralized configuration, status monitoring, and operational reporting.',
    currentFocus: 'Designing email-service configuration management, service health monitoring, delivery-status visibility, log inspection, account and domain administration, and operational controls.',
    toolchain: 'Python, REST APIs, SMTP, IMAP, Linux services, HTML5, CSS3, JavaScript, JSON, and database-backed configuration management.',
    security: 'Security-focused service administration with authenticated access, encrypted connections, credential protection, input validation, least-privilege service operations, and controlled administrative actions.',
    milestone: 'Email service management architecture and core administrative workflows currently under development.'
  },

  'api-manager': {
    name: '04 — API Manager',
    badge: '◐ PLANNED',
    tagline: 'Google Chrome extension for API management & testing',
    objective: 'Build a browser extension for creating, organizing, sending, inspecting, and testing HTTP API requests directly from the browser.',
    architecture: 'Chrome Extension architecture with a browser-based request interface, background service-worker logic, HTTP request execution, response inspection, request collections, and local configuration storage.',
    currentFocus: 'Developing API request creation, HTTP method and header management, request-body handling, response inspection, request history, collections, environment variables, and reusable API configurations.',
    toolchain: 'HTML5, CSS3, JavaScript, Chrome Extensions API, Manifest V3, Fetch API, JSON, browser storage, and HTTP/REST APIs.',
    security: 'Designed with extension permission minimization, controlled request handling, secure credential storage considerations, input validation, restricted access to sensitive data, and protection against accidental credential exposure.',
    milestone: 'Core Chrome extension architecture and API request-management workflow under active development.'
  },
  ailab: {
    name: '03 — AI Automation Lab',
    badge: '◐ IN PROGRESS EXPERIMENT',
    tagline: 'Local AI and workflow automation experiments',
    objective: 'Prototype local LLM tooling for automated documentation, incident triage, and log summarization.',
    architecture: 'Local Ollama LLM Inference Engine → Python Automation Bridge → Vector Store (ChromaDB) → Operational Runbook Generator.',
    currentFocus: 'Fine-tuning prompt engineering pipelines for automated CIS benchmark compliance summaries and Wireshark log triage.',
    toolchain: 'Python, Ollama, Llama 3, ChromaDB, FastAPI, Docker.',
    security: '100% offline local inference ensuring zero sensitive system logs or credentials leave the local workstation.',
    milestone: 'Local CLI assistant for Linux terminal diagnosis.'
  },
  seclab: {
    name: '04 — Security Engineering Lab',
    badge: '◌ ACTIVE RESEARCH & LABS',
    tagline: 'Linux, networking & authorized security labs',
    objective: 'Test SIEM aggregation with Wazuh and firewall rules in virtualized pfSense environments.',
    architecture: 'pfSense Gateway → Isolated VLAN 30 DMZ → Wazuh Manager / Indexer / Dashboard → Monitored Windows & Linux Agents.',
    currentFocus: 'Configuring custom Wazuh detection rules for brute-force SSH attacks, unquoted service paths, and privilege escalation.',
    toolchain: 'pfSense, Wazuh SIEM, Kali Linux, Wireshark, VirtualBox, UFW, Snort.',
    security: 'Strictly sandboxed RFC 1918 virtual networks with zero external WAN exposure.',
    milestone: 'Comprehensive security baseline playbook for small business infrastructure.'
  },
  vpnmesh: {
    name: '05 — Multi-Subnet VPN Mesh',
    badge: '◐ IN PROGRESS EXPERIMENT',
    tagline: 'Site-to-site WireGuard encrypted tunnel',
    objective: 'Connect home lab hypervisors with cloud VPS infrastructure over low-latency WireGuard routing.',
    architecture: 'Point-to-Multipoint WireGuard Mesh → Kernel-level UDP Encapsulation → Dynamic DNS & Keepalive Health Checker.',
    currentFocus: 'Optimizing MTU settings and split-tunneling routing tables for minimal latency across heterogeneous cloud nodes.',
    toolchain: 'WireGuard, Linux Kernel Networking, iptables, systemd-networkd.',
    security: 'Curve25519 elliptic curve cryptography with ChaCha20-Poly1305 authentication.',
    milestone: 'Zero-drop multi-site failover routing.'
  },
  proxmox: {
    name: '06 — Proxmox Enterprise Cluster',
    badge: '◌ ACTIVE RESEARCH & LABS',
    tagline: 'Bare-metal virtualization hypervisor',
    objective: 'Deploy high-availability clustering, Ceph storage pools, and automated container lifecycle.',
    architecture: 'Dual Bare-Metal Proxmox VE Nodes → Corosync Quorum → ZFS Encrypted Storage → Automated Backup Schedules.',
    currentFocus: 'Configuring automated LXC container provisioning via cloud-init and Terraform scripts.',
    toolchain: 'Proxmox VE, KVM, LXC, ZFS, Corosync, Debian Linux.',
    security: 'Hardware IOMMU isolation, dedicated management VLAN, and two-factor administrator authentication.',
    milestone: '99.99% uptime local testing hypervisor for systems experiments.'
  }
};

function initOngoingModals() {
  const modal = $('#ongoing-modal');
  const modalTitle = $('#ongoing-modal-title');
  const modalBody = $('#ongoing-modal-body');
  const closeBtn = $('#ongoing-modal-close');
  let lastTrigger = null;

  if (!modal || !modalTitle || !modalBody || !closeBtn) return;

  function openOngoingModal(key, triggerEl) {
    const data = ONGOING_SYSTEMS_DATA[key];
    if (!data) return;
    lastTrigger = triggerEl;

    modalTitle.textContent = data.name;
    modalBody.innerHTML = `
      <div style="margin-bottom:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">
        <span class="ongoing-status-tag" style="background:rgba(56,211,159,0.15);color:var(--green);border:1px solid rgba(56,211,159,0.3);font-family:var(--font-mono);font-size:0.7rem;padding:0.25rem 0.6rem;border-radius:20px;">${data.badge}</span>
        <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--cyan);">${data.tagline}</span>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">01 — PRIMARY OBJECTIVE</p>
        <p class="case-sec-text">${data.objective}</p>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">02 — SYSTEM ARCHITECTURE</p>
        <p class="case-sec-text mono" style="background:#050E17;padding:0.75rem;border-radius:4px;border:1px solid var(--border-dark);color:var(--cyan);font-size:0.78rem;">${data.architecture}</p>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">03 — CURRENT FOCUS &amp; WORKFLOW</p>
        <p class="case-sec-text">${data.currentFocus}</p>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">04 — ACTIVE TOOLCHAIN</p>
        <p class="case-sec-text mono" style="color:var(--orange);font-size:0.8rem;">${data.toolchain}</p>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">05 — SECURITY &amp; ISOLATION</p>
        <p class="case-sec-text">${data.security}</p>
      </div>

      <div class="case-study-section">
        <p class="case-sec-title">06 — UPCOMING MILESTONE</p>
        <p class="case-sec-text" style="color:var(--cream-100);font-weight:600;">${data.milestone}</p>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeOngoingModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastTrigger) lastTrigger.focus();
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-ongoing-inspect');
    if (btn) {
      openOngoingModal(btn.dataset.ongoing, btn);
    }
  });

  closeBtn.addEventListener('click', closeOngoingModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeOngoingModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeOngoingModal();
  });
}

/* ------------------------------------------------------------------
   9. MULTI-CHANNEL SOCIAL SHARE MODAL & FLOATING ACTIONS
   ------------------------------------------------------------------ */
function initShareModal() {
  const modal = $('#share-modal');
  const shareBtn = $('#floating-share');
  const closeBtn = $('#share-modal-close');
  const copyBtn = $('#share-copy-btn');
  const waLink = $('#share-wa');
  const tgLink = $('#share-tg');
  const liLink = $('#share-li');
  const twLink = $('#share-tw');
  const emLink = $('#share-em');

  if (!modal || !shareBtn || !closeBtn) return;

  function updateLinks() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('Kumaradoss S — WAVE FUNCTION | IT Systems & Web Engineering Portfolio');
    const text = encodeURIComponent('Explore the engineering portfolio of Kumaradoss S — System & Network Engineer, Security Practitioner, and Web Developer: ');

    if (waLink) waLink.href = `https://wa.me/919514058491?text=${text}%20${url}`;
    if (tgLink) tgLink.href = `https://t.me/share/url?url=${url}&text=${title}`;
    if (liLink) liLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    if (twLink) twLink.href = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
    if (emLink) emLink.href = `mailto:?subject=${title}&body=${text}%20${url}`;
  }

  function openShareModal() {
    updateLinks();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeShareModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    shareBtn.focus();
  }

  shareBtn.addEventListener('click', () => {
    // If Web Share API is available on mobile, give user direct choice or open modal
    if (navigator.share && window.innerWidth < 768) {
      navigator.share({
        title: 'Kumaradoss S — WAVE FUNCTION Portfolio',
        text: 'Technical Problem Solver | IT Infrastructure & Security | Automation & Software',
        url: window.location.href
      }).catch(() => openShareModal());
    } else {
      openShareModal();
    }
  });

  closeBtn.addEventListener('click', closeShareModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeShareModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeShareModal();
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('Portfolio URL copied to clipboard!');
      closeShareModal();
    });
  }
}

/* ------------------------------------------------------------------
   DUAL-MODE CONSOLE (CLI TERMINAL & TELEMETRY TABS)
   ------------------------------------------------------------------ */
function initConsoleTabs() {
  const tabCli = $('#tab-cli');
  const tabTelemetry = $('#tab-telemetry');
  const termBody = $('#terminal-body');
  const telemView = $('#telemetry-view');

  if (!tabCli || !tabTelemetry) return;

  tabCli.addEventListener('click', () => {
    tabCli.classList.add('active');
    tabCli.setAttribute('aria-selected', 'true');
    tabTelemetry.classList.remove('active');
    tabTelemetry.setAttribute('aria-selected', 'false');
    termBody.style.display = 'block';
    telemView.classList.remove('active');
  });

  tabTelemetry.addEventListener('click', () => {
    tabTelemetry.classList.add('active');
    tabTelemetry.setAttribute('aria-selected', 'true');
    tabCli.classList.remove('active');
    tabCli.setAttribute('aria-selected', 'false');
    termBody.style.display = 'none';
    telemView.classList.add('active');
  });

  // Mock telemetry latency jitter
  setInterval(() => {
    const pingEl = $('#telem-ping');
    if (pingEl) {
      const ping = Math.floor(Math.random() * 8) + 10;
      pingEl.textContent = `${ping}ms`;
    }
  }, 3000);
}

/* ------------------------------------------------------------------
   INTERACTIVE CLI TERMINAL ENGINE
   ------------------------------------------------------------------ */
const TERMINAL_DATABASE = {
  help: `
<span class="term-accent">=== WAVE FUNCTION CLI COMMAND DIRECTORY ===</span>
<span class="term-cmd">recruiter</span>  : Executive candidate summary, tenure, & résumé download
<span class="term-cmd">client</span>     : Desktop PC support, hardware upgrades, & rate overview
<span class="term-cmd">web</span>        : Responsive website creation details & tech stack
<span class="term-cmd">tech</span>       : In-depth technical architecture, Cisco VLANs, & automation scripts
<span class="term-cmd">skills</span>     : Categorized capabilities (Diagnostics, Network, Web, Security)
<span class="term-cmd">certs</span>      : Accredited certifications (Cisco, Google, Meta, ISC2)
<span class="term-cmd">services</span>   : 5-Tier service matrix & add-on pricing
<span class="term-cmd">whatsapp</span>   : Start instant direct WhatsApp consultation
<span class="term-cmd">contact</span>    : Direct email, phone, & availability status
<span class="term-cmd">clear</span>      : Reset terminal screen
`,
  recruiter: `
<span class="term-accent">=== RECRUITER & HIRING SUMMARY ===</span>
<span class="term-prompt">Candidate:</span> Kumaradoss S
<span class="term-prompt">Role:</span> System & Network Engineer | Corporate IT Trainer | Web Developer
<span class="term-prompt">Location:</span> India (Open to Remote & Hybrid Opportunities)
<span class="term-prompt">Current Role:</span> Associate Corporate IT Trainer L2 @ Balsam Creative Technology (Dec 2025 – Present)
<span class="term-prompt">Education:</span> M.Sc. Materials Science (Pondicherry Technological Univ) | B.Sc. Physics
<span class="term-prompt">Credentials:</span> 10+ Certifications across Cisco, Google, Meta, & ISC2 Candidate
<span class="term-prompt">Core Strengths:</span> Active Directory, VLAN Architecture, Hardening, Python Automation, Training L&D
<span class="term-success">&#x2713; Immediate Availability for full-time & high-impact contracts.</span>
<span class="term-cmd">> Action:</span> <a href="[ADD_RESUME_URL]" target="_blank" class="term-btn-chip">Download Resume PDF &#x2197;</a>
`,
  client: `
<span class="term-accent">=== CLIENT DESKTOP & IT SERVICES ===</span>
<span class="term-prompt">PC Solutions:</span>
  1. <span class="term-cmd">PC Diagnostic Check:</span> &#x20B9;299+ (Health, S.M.A.R.T. disk, thermal triage)
  2. <span class="term-cmd">Windows Tune-Up:</span> &#x20B9;699+ (Startup cleanup, driver updates, optimization)
  3. <span class="term-cmd">Complete PC Setup:</span> &#x20B9;1,499+ (OS installation, baseline security, apps)
  4. <span class="term-cmd">Hardware Upgrade:</span> &#x20B9;299–&#x20B9;599+ (RAM, SSD, GPU installation)
<span class="term-prompt">Web Development:</span>
  5. <span class="term-cmd">Responsive Website:</span> &#x20B9;1,999+ / Custom (100/100 Lighthouse, pure HTML/CSS/JS)
<span class="term-success">> Action:</span> <a href="https://wa.me/919514058491?text=Hi+Kumaradoss,+I+would+like+to+discuss+a+project." target="_blank" class="term-btn-chip">Chat on WhatsApp &#x2197;</a>
`,
  web: `
<span class="term-accent">=== RESPONSIVE WEBSITE CREATION ===</span>
<span class="term-prompt">Philosophy:</span> Pure Semantic Code, Zero Bloat, Instant Performance
<span class="term-prompt">Stack:</span> Semantic HTML5, CSS3 Custom Properties (Flexbox/Grid), Modern Vanilla JS, Python/Flask
<span class="term-prompt">Features:</span> 
  - Mobile-First & Tablet Adaptive Layouts
  - 100/100 Google Lighthouse Core Web Vitals
  - Integrated WhatsApp Direct Booking & Validated Forms
  - JSON-LD Structured Data Schema & OpenGraph Meta Tags
  - Custom Domain, DNS Records, and SSL Setup
<span class="term-success">> Inquiry:</span> <a href="https://wa.me/919514058491?text=Hi+Kumaradoss,+I+want+to+build+a+responsive+website." target="_blank" class="term-btn-chip">Request Web Quote via WhatsApp &#x2197;</a>
`,
  tech: `
<span class="term-accent">=== TECHNICAL ARCHITECTURE & SYSTEMS SPEC ===</span>
<span class="term-prompt">Infrastructure:</span> Windows Server 2022/2019, Active Directory, GPOs, Ubuntu Linux, Bash
<span class="term-prompt">Networking:</span> 3-Tier VLAN Segmentation (10=Mgmt, 20=Workstations, 30=Servers), Cisco IOS, Router-on-a-Stick, Subnetting
<span class="term-prompt">Security:</span> CIS Benchmark Hardening, Port Security, MAC filtering, DHCP snooping, Endpoint Triage
<span class="term-prompt">Software:</span> Python 3, Flask, REST APIs, Semantic HTML5, CSS Grid, Vanilla ES6+
<span class="term-prompt">Workflow:</span> SOP runbooks, root-cause diagnostics, and automated telemetry scripting
`,
  skills: `
<span class="term-accent">=== CORE CAPABILITIES BREAKDOWN ===</span>
[88%] Hardware Diagnostics & Desktop Triage
[85%] Technical Instruction & Curriculum Architecture
[82%] Cisco Routing, Switching & VLAN Segmentation
[78%] Responsive Web Development (HTML/CSS/JS)
[75%] Python Scripting & Operations Automation
[72%] Cybersecurity Hardening & CIS Controls
`,
  certs: `
<span class="term-accent">=== VERIFIED CREDENTIALS ===</span>
01. Introduction to SQL — Simplilearn
02. Introduction to Cybersecurity — Cisco
03. Network Addressing and Basic Troubleshooting — Cisco
04. Networking Basics — Cisco
05. Networking Devices and Initial Configuration — Cisco
06. Crash Course on Python — Google
07. The Bits and Bytes of Computer Networking — Google
08. Technical Support Fundamentals — Google
09. HTML and CSS in Depth — Meta
10. ISC2 Candidate — ISC2 (Active)
`,
  services: `
<span class="term-accent">=== 5-TIER SERVICE MATRIX & RATES ===</span>
1. PC Diagnostic Check: &#x20B9;299+
2. Windows Tune-Up: &#x20B9;699+
3. Complete PC Setup: &#x20B9;1,499+
4. PC Hardware Upgrade: &#x20B9;299–&#x20B9;599+
5. Responsive Website Creation: &#x20B9;1,999+ / Custom
- Service Add-ons: Malware Removal (&#x20B9;299+), Backup/Restore (&#x20B9;499+), Disk Cloning (&#x20B9;799+)
`,
  whatsapp: `
<span class="term-success">Opening WhatsApp direct conversation...</span>
<a href="https://wa.me/919514058491?text=Hi+Kumaradoss,+I+found+your+portfolio+and+would+like+to+connect." target="_blank" class="term-btn-chip">Click to Open WhatsApp Chat &#x2197;</a>
`,
  contact: `
<span class="term-accent">=== DIRECT CHANNELS ===</span>
<span class="term-prompt">WhatsApp:</span> +91 95140 58491
<span class="term-prompt">Email:</span> kumaradoss.py@gmail.com
<span class="term-prompt">Phone:</span> [ADD_PHONE_NUMBER]
<span class="term-prompt">LinkedIn:</span> https://www.linkedin.com/in/kumaradoss-s/
<span class="term-prompt">Knowledge Platform:</span> https://devspirehub.com/
`
};

function executeTerminalCommand(cmdRaw) {
  const output = $('#terminal-output');
  const termBody = $('#terminal-body');
  if (!output || !termBody) return;

  const cmd = cmdRaw.trim().toLowerCase();
  if (!cmd) return;

  if (cmd === 'clear') {
    output.innerHTML = `
      <p class="term-line"><span class="term-prompt">Screen cleared.</span> Type <span class="term-cmd">help</span> for commands.</p>
    `;
    return;
  }

  const promptLine = document.createElement('p');
  promptLine.className = 'term-line';
  promptLine.innerHTML = `<span class="term-prompt">guest@wavefunction:~$</span> <span class="term-cmd">${escapeHTML(cmdRaw)}</span>`;
  output.appendChild(promptLine);

  const responseLine = document.createElement('div');
  responseLine.className = 'term-line term-response';

  if (TERMINAL_DATABASE[cmd]) {
    responseLine.innerHTML = TERMINAL_DATABASE[cmd];
    if (cmd === 'whatsapp') {
      window.open('https://wa.me/919514058491?text=Hi+Kumaradoss,+I+would+like+to+connect+via+WhatsApp.', '_blank');
    }
  } else {
    responseLine.innerHTML = `
      <span class="term-warn">Command not recognized: '${escapeHTML(cmdRaw)}'.</span><br>
      Type <span class="term-cmd">help</span> or try: <span class="term-btn-chip" data-cmd="recruiter">recruiter</span> <span class="term-btn-chip" data-cmd="client">client</span> <span class="term-btn-chip" data-cmd="web">web</span> <span class="term-btn-chip" data-cmd="services">services</span>
    `;
  }
  output.appendChild(responseLine);

  $$('.term-btn-chip', responseLine).forEach(chip => {
    chip.addEventListener('click', () => {
      const c = chip.dataset.cmd;
      if (c) executeTerminalCommand(c);
    });
  });

  termBody.scrollTop = termBody.scrollHeight;
}

function initTerminal() {
  const input = $('#terminal-input');
  if (!input) return;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      executeTerminalCommand(val);
    }
  });

  $$('.term-quick-btn, .term-btn-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.cmd;
      if (c) executeTerminalCommand(c);
    });
  });
}
/* ------------------------------------------------------------------
   11. TECHNICAL RESUME GENERATOR (ROLE-TAILORED PRINT VIEW)
   ------------------------------------------------------------------ */
const RESUME_PROFILES = {
  network: {
    title: 'Network Engineer',
    summary: 'Infrastructure and Network Engineer with deep foundations in TCP/IP, Cisco routing and switching, VLAN 10/20/30 segmentation, subnetting, DHCP/DNS, and firewall packet inspection. Associate Corporate IT Trainer L2 with proven ability to document and teach complex network topologies.',
    coreSkills: 'Cisco IOS, Routing & Switching, VLANs, Subnetting, TCP/IP, DNS, DHCP, NAT, VPN, Wireshark, pfSense, Packet Tracer, UFW, Network Troubleshooting.',
    featuredProject: 'Segmented VLAN Network Lab & Network Diagnostic REST API'
  },
  backend: {
    title: 'Backend Developer (Python & APIs)',
    summary: 'Backend Engineer specializing in Python, Flask, FastAPI, RESTful API architecture, SQL databases, and Linux server deployment. Focused on secure endpoints, rate-limiting, process automation, and zero-telemetry utilities.',
    coreSkills: 'Python 3, Flask, FastAPI, Django, REST APIs, SQL, PostgreSQL, Gunicorn, Nginx, Docker, Linux, Git, Task Automation.',
    featuredProject: 'Network Diagnostic API & Nmap Security Scanner Controller'
  },
  frontend: {
    title: 'Frontend Developer (Pure Web Standards)',
    summary: 'Frontend Developer focused on high-performance semantic HTML5, modern CSS3 Grid/Flexbox, accessible UI/UX, and Vanilla JavaScript. Committed to 100/100 Google Lighthouse Core Web Vitals and zero heavy framework dependencies.',
    coreSkills: 'HTML5, CSS3 Custom Properties, Responsive Mobile-First Design, Vanilla ES6+, Web APIs, Accessibility (a11y), JSON-LD Schema, SEO.',
    featuredProject: 'WAVE FUNCTION Engineering Command Center & IT Utility Platform'
  },
  python: {
    title: 'Python Developer & Automation Specialist',
    summary: 'Python Developer skilled in scripting, task automation, network telemetry parsing, backend web applications (Flask/FastAPI), and systems automation. Diploma holder in Python & Flask Framework.',
    coreSkills: 'Python 3, Flask, FastAPI, Scripting, REST APIs, Automation, JSON/XML parsing, Linux subprocesses, SQL, Git.',
    featuredProject: 'Automated Diagnostic Probes & Operations Runbooks'
  },
  support: {
    title: 'IT Support & Systems Specialist',
    summary: 'Hands-on IT Systems Specialist experienced in physical desktop diagnostics, RAM/SSD hardware upgrades, Windows deployment & optimization, thermal triage, malware triage, and user enablement.',
    coreSkills: 'Hardware Triage, PC Assembly, RAM/SSD/GPU Upgrades, Windows 10/11 Deployment, Driver Troubleshooting, BIOS/UEFI, Backup & Cloning.',
    featuredProject: 'Freelance Desktop Support & Windows Optimization Suite'
  },
  cyber: {
    title: 'Cybersecurity Trainee & Practitioner',
    summary: 'Cybersecurity practitioner and active ISC2 Candidate with Cisco cybersecurity credentials. Hands-on experience in CIS benchmark hardening, authorized Nmap scanning, firewall ACLs, and network monitoring.',
    coreSkills: 'System Hardening, CIS Controls, Nmap, Kali Linux, Burp Suite, UFW, pfSense, Wireshark, SIEM Concepts, Least Privilege.',
    featuredProject: 'Nmap Security Dashboard & Hardened VLAN Architecture'
  }
};

function renderResume(roleKey) {
  const profile = RESUME_PROFILES[roleKey] || RESUME_PROFILES.network;
  const preview = $('#resume-preview-sheet');
  if (!preview) return;

  preview.innerHTML = `
    <div style="border-bottom:2px solid #11202C;padding-bottom:0.75rem;margin-bottom:1rem;display:flex;justify-content:space-between;align-items:flex-end;">
      <div>
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:1.6rem;font-weight:800;color:#11202C;margin:0;">KUMARADOSS S</h2>
        <p style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;font-weight:700;color:#E55826;margin:0;">TARGET ROLE: ${profile.title.toUpperCase()}</p>
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:0.72rem;color:#4A5568;text-align:right;">
        Location: India &bull; LinkedIn: in/kumaradoss-s<br>
        DevspireHub.com &bull; GitHub: github.com/
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:800;border-bottom:1px solid #CBD5E0;padding-bottom:0.2rem;margin-bottom:0.4rem;">PROFESSIONAL SUMMARY</h3>
      <p style="font-size:0.82rem;line-height:1.55;color:#2D3748;">${profile.summary}</p>
    </div>

    <div style="margin-bottom:1rem;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:800;border-bottom:1px solid #CBD5E0;padding-bottom:0.2rem;margin-bottom:0.4rem;">CORE TECHNICAL CAPABILITIES</h3>
      <p style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;line-height:1.5;color:#1A202C;">${profile.coreSkills}</p>
    </div>

    <div style="margin-bottom:1rem;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:800;border-bottom:1px solid #CBD5E0;padding-bottom:0.2rem;margin-bottom:0.4rem;">EXPERIENCE &amp; INSTRUCTION</h3>
      <div style="margin-bottom:0.5rem;">
        <strong style="font-size:0.85rem;">Associate Corporate IT Trainer - L2</strong> &mdash; <em>Balsam Creative Technology</em> <span style="float:right;font-family:'JetBrains Mono',monospace;font-size:0.72rem;">Dec 2025 &ndash; Present</span><br>
        <span style="font-size:0.78rem;color:#4A5568;">Deliver advanced systems engineering, routing topologies, and security configurations to corporate trainees.</span>
      </div>
      <div style="margin-bottom:0.5rem;">
        <strong style="font-size:0.85rem;">Corporate IT Trainer - L1</strong> &mdash; <em>Balsam Creative Technology</em> <span style="float:right;font-family:'JetBrains Mono',monospace;font-size:0.72rem;">Aug 2025 &ndash; Present</span><br>
        <span style="font-size:0.78rem;color:#4A5568;">Hands-on workshops on computer hardware, OS deployment, and network triage.</span>
      </div>
      <div>
        <strong style="font-size:0.85rem;">Web Developer</strong> &mdash; <em>Balsam Creative Technology</em> <span style="float:right;font-family:'JetBrains Mono',monospace;font-size:0.72rem;">Jul 2024 &ndash; Oct 2024</span><br>
        <span style="font-size:0.78rem;color:#4A5568;">Developed responsive web systems using HTML5, CSS3, JavaScript, and Python/Flask.</span>
      </div>
    </div>

    <div style="margin-bottom:1rem;">
      <h3 style="font-family:'Space Grotesk',sans-serif;font-size:0.95rem;font-weight:800;border-bottom:1px solid #CBD5E0;padding-bottom:0.2rem;margin-bottom:0.4rem;">EDUCATION &amp; CERTIFICATIONS</h3>
      <p style="font-size:0.78rem;line-height:1.5;color:#2D3748;">
        &bull; <strong>M.Sc. Materials Science &amp; Technology</strong> &mdash; Pondicherry Technological University (2021&ndash;2023)<br>
        &bull; <strong>B.Sc. Physics</strong> &mdash; Tagore Government Arts and Science College (2018&ndash;2021)<br>
        &bull; <strong>Adv. Diploma in System &amp; Network Engineer</strong> (VKR Solutions) &bull; <strong>Diploma in Python &amp; Flask</strong> (Ocean Academy)<br>
        &bull; <strong>Verified Certifications:</strong> Cisco (Cybersecurity, Addressing, Basics, Devices), Google (Python, Computer Networking, IT Support), Meta (HTML/CSS), Simplilearn (SQL), ISC2 Candidate (In Progress).
      </p>
    </div>
  `;
}

function initResumeGenerator() {
  const modal = $('#resume-modal');
  const openBtn = $('#nav-resume-btn');
  const closeBtn = $('#resume-modal-close');
  const printBtn = $('#btn-print-resume');
  const resetBtn = $('#btn-reset-resume');
  const roleBtns = $$('.role-select-btn');

  if (!modal || !openBtn || !closeBtn) return;

  function openResumeModal() {
    renderResume('network');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeResumeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    openBtn.focus();
  }

  openBtn.addEventListener('click', openResumeModal);
  closeBtn.addEventListener('click', closeResumeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeResumeModal(); });

  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderResume(btn.dataset.role);
    });
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      roleBtns[0].classList.add('active');
      renderResume('network');
      showToast('Reset to default Network Engineer profile.');
    });
  }
}

/* ==================== 9. LIVE TECHNICAL PLAYGROUND TOOLS ==================== */
function initPlaygroundTools() {
  // Tab switching
  const tabBtns = document.querySelectorAll('.pg-tab-btn');
  const tabPanels = document.querySelectorAll('.pg-tool-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // Tool 1: Subnet Calculator
  const calcBtn = document.getElementById('btn-calc-subnet');
  if (calcBtn) {
    calcBtn.addEventListener('click', calculateSubnet);
  }

  function calculateSubnet() {
    const ipStr = (document.getElementById('subnet-ip').value || '').trim();
    const cidr = parseInt(document.getElementById('subnet-cidr').value, 10);

    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ipStr) || isNaN(cidr) || cidr < 1 || cidr > 32) {
      alert('Please enter a valid IPv4 address (e.g. 192.168.1.1) and CIDR prefix (1-32).');
      return;
    }

    const octets = ipStr.split('.').map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
      alert('IPv4 octets must be between 0 and 255.');
      return;
    }

    const ipInt = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
    const maskInt = cidr === 0 ? 0 : (~0 << (32 - cidr));
    const netInt = ipInt & maskInt;
    const bcastInt = netInt | (~maskInt);
    const wildInt = ~maskInt;

    function intToIp(val) {
      return [
        (val >>> 24) & 255,
        (val >>> 16) & 255,
        (val >>> 8) & 255,
        val & 255
      ].join('.');
    }

    document.getElementById('so-net').textContent = intToIp(netInt);
    document.getElementById('so-mask').textContent = intToIp(maskInt);
    document.getElementById('so-bcast').textContent = intToIp(bcastInt);
    document.getElementById('so-wild').textContent = intToIp(wildInt);

    if (cidr >= 31) {
      document.getElementById('so-range').textContent = `${intToIp(netInt)} – ${intToIp(bcastInt)}`;
      document.getElementById('so-hosts').textContent = cidr === 32 ? '1 (Host route)' : '2 (Point-to-point)';
    } else {
      const firstHost = netInt + 1;
      const lastHost = bcastInt - 1;
      const totalHosts = Math.pow(2, 32 - cidr) - 2;
      document.getElementById('so-range').textContent = `${intToIp(firstHost)} – ${intToIp(lastHost)}`;
      document.getElementById('so-hosts').textContent = totalHosts.toLocaleString();
    }
  }

  // Tool 2: JSON Formatter
  const jsonBtn = document.getElementById('btn-format-json');
  const jsonMinBtn = document.getElementById('btn-minify-json');
  const jsonInput = document.getElementById('json-input');
  const jsonResult = document.getElementById('json-result');

  if (jsonBtn && jsonInput) {
    jsonBtn.addEventListener('click', () => {
      try {
        const obj = JSON.parse(jsonInput.value);
        jsonResult.style.display = 'block';
        jsonResult.className = 'tool-result-box text-success';
        jsonResult.textContent = JSON.stringify(obj, null, 2);
      } catch (err) {
        jsonResult.style.display = 'block';
        jsonResult.className = 'tool-result-box text-error';
        jsonResult.textContent = `JSON Parse Error: ${err.message}`;
      }
    });

    jsonMinBtn.addEventListener('click', () => {
      try {
        const obj = JSON.parse(jsonInput.value);
        jsonResult.style.display = 'block';
        jsonResult.className = 'tool-result-box text-success';
        jsonResult.textContent = JSON.stringify(obj);
      } catch (err) {
        jsonResult.style.display = 'block';
        jsonResult.className = 'tool-result-box text-error';
        jsonResult.textContent = `JSON Parse Error: ${err.message}`;
      }
    });
  }

  // Tool 3: Base64
  const b64Input = document.getElementById('b64-input');
  const b64EncBtn = document.getElementById('btn-b64-encode');
  const b64DecBtn = document.getElementById('btn-b64-decode');
  const b64Result = document.getElementById('b64-result');

  if (b64EncBtn && b64Input) {
    b64EncBtn.addEventListener('click', () => {
      try {
        b64Result.style.display = 'block';
        b64Result.className = 'tool-result-box text-cyan';
        b64Result.textContent = btoa(unescape(encodeURIComponent(b64Input.value)));
      } catch (e) {
        b64Result.style.display = 'block';
        b64Result.className = 'tool-result-box text-error';
        b64Result.textContent = `Encoding Error: ${e.message}`;
      }
    });

    b64DecBtn.addEventListener('click', () => {
      try {
        b64Result.style.display = 'block';
        b64Result.className = 'tool-result-box text-cyan';
        b64Result.textContent = decodeURIComponent(escape(atob(b64Input.value.trim())));
      } catch (e) {
        b64Result.style.display = 'block';
        b64Result.className = 'tool-result-box text-error';
        b64Result.textContent = `Decoding Error: Invalid Base64 string.`;
      }
    });
  }

  // Tool 4: Password Entropy Estimator
  const pwdInput = document.getElementById('pwd-input');
  const emMeter = document.getElementById('entropy-meter');
  const emBar = document.getElementById('em-bar');
  const emBits = document.getElementById('em-bits');
  const emRating = document.getElementById('em-rating');

  if (pwdInput) {
    pwdInput.addEventListener('input', () => {
      const pwd = pwdInput.value;
      if (!pwd) {
        emMeter.style.display = 'none';
        return;
      }
      emMeter.style.display = 'block';

      let pool = 0;
      if (/[a-z]/.test(pwd)) pool += 26;
      if (/[A-Z]/.test(pwd)) pool += 26;
      if (/[0-9]/.test(pwd)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

      const bits = Math.round(pwd.length * (Math.log2(pool || 1)));
      emBits.textContent = `${bits} bits`;

      let pct = Math.min(100, (bits / 80) * 100);
      emBar.style.width = `${pct}%`;

      if (bits < 35) {
        emBar.style.backgroundColor = 'var(--color-error)';
        emRating.textContent = 'Weak';
        emRating.className = 'text-error';
      } else if (bits < 60) {
        emBar.style.backgroundColor = 'var(--color-warning)';
        emRating.textContent = 'Moderate';
        emRating.className = 'text-warning';
      } else {
        emBar.style.backgroundColor = 'var(--color-success)';
        emRating.textContent = 'Strong (Cryptographically Resilient)';
        emRating.className = 'text-success';
      }
    });
  }

  // Tool 6: File SHA-256 Checksum Generator
  const fileInput = document.getElementById('hash-file-input');
  const hashResult = document.getElementById('hash-result');

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      hashResult.style.display = 'block';
      hashResult.className = 'tool-result-box text-cyan';
      hashResult.textContent = `Computing SHA-256 checksum for "${file.name}"...`;

      try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        hashResult.className = 'tool-result-box text-success';
        hashResult.textContent = `FILE: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\nSHA-256: ${hashHex}`;
      } catch (err) {
        hashResult.className = 'tool-result-box text-error';
        hashResult.textContent = `Hashing error: ${err.message}`;
      }
    });
  }

  // Tool 7: Troubleshooting Decision Tree
  const treeOpts = document.querySelectorAll('.tree-opt');
  const treeDiagnosis = document.getElementById('tree-diagnosis');
  const btnResetTree = document.getElementById('btn-reset-tree');

  const diagnoses = {
    'ts-power': `<strong>Diagnostic Path: Power / Electrical Fault</strong><br>
      • Verify AC power cable and wall outlet socket.<br>
      • Perform paperclip test or PSU voltage check.<br>
      • Check motherboard 24-pin and CPU 8-pin connectors.<br>
      • Inspect front panel power switch header pins.`,
    'ts-post': `<strong>Diagnostic Path: POST Failure / Display Initialization</strong><br>
      • Reseat RAM DIMM sticks in alternating slots (try 1 stick at a time).<br>
      • Verify monitor cable is plugged into Dedicated GPU (not motherboard).<br>
      • Clear CMOS battery for 5 minutes.<br>
      • Check motherboard Debug LEDs or beep codes.`,
    'ts-os': `<strong>Diagnostic Path: Windows Boot Failure / Storage / Driver Loop</strong><br>
      • Check BIOS boot order and SATA/NVMe drive detection.<br>
      • Boot into Windows Recovery Environment (WinRE) → Startup Repair.<br>
      • Run <code>chkdsk /f /r</code> and <code>sfc /scannow</code> from Recovery Command Prompt.<br>
      • Test SSD health via SMART metrics.`,
    'ts-slow': `<strong>Diagnostic Path: Thermal Throttling / Background Resource Contention</strong><br>
      • Inspect CPU/GPU temperatures with HWMonitor (look for >90°C throttling).<br>
      • Check Task Manager for 100% disk usage or rogue background processes.<br>
      • Check SSD remaining endurance &amp; DRAM degradation.<br>
      • Clean thermal paste and reseat cooler heatsink.`
  };

  treeOpts.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (diagnoses[target]) {
        treeDiagnosis.style.display = 'block';
        treeDiagnosis.innerHTML = diagnoses[target];
        if (btnResetTree) btnResetTree.style.display = 'inline-flex';
      }
    });
  });

  if (btnResetTree) {
    btnResetTree.addEventListener('click', () => {
      treeDiagnosis.style.display = 'none';
      btnResetTree.style.display = 'none';
    });
  }
}

/* ------------------------------------------------------------------
   12. IPV4 SUBNET CALCULATOR
   ------------------------------------------------------------------ */
function calcSubnet(cidr) {
  const [ip, prefix] = cidr.trim().split('/');
  if (!ip || !prefix) return null;
  const pfx = parseInt(prefix, 10);
  if (isNaN(pfx) || pfx < 0 || pfx > 32) return null;

  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;

  const ipInt = parts.reduce((acc, p) => (acc << 8) | p, 0) >>> 0;
  const mask = pfx === 0 ? 0 : (0xFFFFFFFF << (32 - pfx)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const first = pfx >= 31 ? network : (network + 1) >>> 0;
  const last = pfx >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const hosts = pfx >= 32 ? 1 : pfx === 31 ? 2 : (broadcast - network - 1);

  const toStr = n => [(n >> 24) & 0xFF, (n >> 16) & 0xFF, (n >> 8) & 0xFF, n & 0xFF].join('.');
  return { network: toStr(network), broadcast: toStr(broadcast), mask: toStr(mask), first: toStr(first), last: toStr(last), hosts };
}

function initSubnetCalc() {
  const input = $('#calc-ip');
  const btn = $('#calc-btn');
  const result = $('#calc-result');
  if (!btn || !input || !result) return;

  function run() {
    const val = input.value.trim();
    const data = calcSubnet(val);
    if (!data) {
      result.innerHTML = '<span style="color:var(--red);">Invalid CIDR format. Example: 192.168.1.0/24</span>';
      return;
    }
    result.innerHTML = `
      <strong>Network:</strong> ${data.network}<br>
      <strong>Subnet Mask:</strong> ${data.mask}<br>
      <strong>Broadcast:</strong> ${data.broadcast}<br>
      <strong>Host Range:</strong> ${data.first} &ndash; ${data.last}<br>
      <strong>Usable Hosts:</strong> ${data.hosts.toLocaleString()}
    `;
  }
  btn.addEventListener('click', run);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
}

/* ------------------------------------------------------------------
   13. PASSWORD ENTROPY METER
   ------------------------------------------------------------------ */
function initPasswordMeter() {
  const input = $('#pw-input');
  const fill = $('#pw-strength-fill');
  const result = $('#pw-result');
  if (!input || !fill || !result) return;

  input.addEventListener('input', () => {
    const pw = input.value;
    let charset = 0;
    if (/[a-z]/.test(pw)) charset += 26;
    if (/[A-Z]/.test(pw)) charset += 26;
    if (/[0-9]/.test(pw)) charset += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) charset += 32;
    const entropy = charset > 0 ? Math.log2(charset) * pw.length : 0;

    let label, color, pct;
    if (pw.length === 0) { fill.style.width = '0'; result.innerHTML = ''; return; }
    if (entropy < 28) { label = 'VERY WEAK'; color = 'var(--red)'; pct = 20; }
    else if (entropy < 36) { label = 'WEAK'; color = '#FF9F43'; pct = 40; }
    else if (entropy < 60) { label = 'MODERATE'; color = 'var(--yellow)'; pct = 65; }
    else { label = 'STRONG'; color = 'var(--green)'; pct = 100; }

    fill.style.width = pct + '%';
    fill.style.background = color;
    result.innerHTML = `<strong style="color:${color};">${label}</strong> &bull; Entropy: ~${Math.round(entropy)} bits &bull; Length: ${pw.length}`;
  });
}

/* ------------------------------------------------------------------
   14. SERVICE SOLVER CATEGORY SWITCHER & FORM PRESELECTION
   ------------------------------------------------------------------ */
function initServicesAndSolver() {
  const solverBtns = $$('.solver-categories .filter-btn');
  const serviceCards = $$('.services-ref-grid-5 .service-ref-card');
  const form = $('#contact-form');
  const serviceSelect = $('#cf-service');
  const priceNotice = $('#price-notice-box');
  const feedback = $('#form-feedback');

  // Category filtering
  solverBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      solverBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const solver = btn.dataset.solver;

      serviceCards.forEach(card => {
        const group = card.dataset.solverGroup || '';
        const match = solver === 'all' || group === solver;
        card.style.display = match ? 'flex' : 'none';
      });
    });
  });

  // Preselection from cards
  $$('.btn-card-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const sVal = btn.dataset.serviceVal;
      const sName = btn.dataset.serviceName;
      const sPrice = btn.dataset.servicePrice;

      if (serviceSelect && sVal) {
        serviceSelect.value = sVal;
      }
      if (priceNotice && sPrice) {
        priceNotice.innerHTML = `Selected Service: <strong>${sName}</strong> &mdash; Starting from <strong>${sPrice}</strong>`;
      }
      $('#contact')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => $('#cf-name')?.focus(), 600);
    });
  });

  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      const opt = serviceSelect.options[serviceSelect.selectedIndex];
      if (priceNotice) {
        priceNotice.innerHTML = opt.value ? `Selected: <strong>${opt.text}</strong>` : '';
      }
    });
  }

  // Form Validation + Real Submission (Web3Forms — free, static-site compatible)
  // REQUIRED CONFIGURATION: replace WEB3FORMS_ACCESS_KEY below with a real key
  // from https://web3forms.com (free, no backend/server required). Get a key
  // by entering the destination email on their site — no account needed.
  const WEB3FORMS_ACCESS_KEY = 'WEB3FORMS_ACCESS_KEY';
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  if (form) {
    const submitBtn = $('#cf-submit-btn');
    let isSubmitting = false;

    function renderFeedback(type, messages) {
      if (!feedback) return;
      const color = type === 'error' ? 'var(--red)' : type === 'success' ? 'var(--green)' : 'var(--text-muted-light)';
      const icon = type === 'error' ? '&#x2715;' : type === 'success' ? '&#x2713;' : '&#x25CB;';
      feedback.innerHTML = messages
        .map(msg => `<p style="color:${color};font-size:0.78rem;margin:0.2rem 0;font-weight:${type === 'success' ? 700 : 400};">${icon} ${escapeHTML(msg)}</p>`)
        .join('');
    }

    function validateForm() {
      const errors = [];
      const name = $('#cf-name')?.value.trim();
      const phone = $('#cf-phone')?.value.trim();
      const email = $('#cf-email')?.value.trim();
      const device = $('#cf-device')?.value;
      const service = $('#cf-service')?.value;
      const supportType = $('#cf-support-type')?.value;
      const desc = $('#cf-desc')?.value.trim();

      if (!name || name.length < 2) errors.push('Customer name is required.');
      if (name && name.length > 120) errors.push('Customer name is too long.');
      if (!phone || phone.length < 7) errors.push('Valid phone number is required.');
      if (phone && phone.length > 30) errors.push('Phone number is too long.');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
      if (email && email.length > 200) errors.push('Email address is too long.');
      if (!device) errors.push('Please select a device type.');
      if (!service) errors.push('Please select a required service.');
      if (!supportType) errors.push('Please select remote or on-site support.');
      if (!desc || desc.length < 10) errors.push('Problem description must be at least 10 characters.');
      if (desc && desc.length > 4000) errors.push('Problem description is too long (max 4000 characters).');

      return errors;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (isSubmitting) return; // prevent duplicate/rapid submissions

      // Honeypot check — silently drop bot submissions without an error state
      const honeypot = $('#cf-hp');
      if (honeypot && honeypot.value.trim() !== '') {
        renderFeedback('success', ['Your request has been sent. I will get back to you shortly.']);
        form.reset();
        return;
      }

      const errors = validateForm();
      if (errors.length) {
        renderFeedback('error', errors);
        const firstInvalid = form.querySelector(':invalid, [aria-invalid="true"]');
        (firstInvalid || $('#cf-name'))?.focus();
        return;
      }

      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === 'WEB3FORMS_ACCESS_KEY') {
        renderFeedback('error', [
          'Contact form is not yet configured. Set WEB3FORMS_ACCESS_KEY in script.js (free key from web3forms.com) to enable delivery.'
        ]);
        showToast('Form endpoint not configured yet.');
        return;
      }

      isSubmitting = true;
      const originalBtnText = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Sending…';
      }
      renderFeedback('info', ['Sending your request…']);

      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'New Support Request — Portfolio Contact Form',
        from_name: $('#cf-name')?.value.trim(),
        name: $('#cf-name')?.value.trim(),
        phone: $('#cf-phone')?.value.trim(),
        email: $('#cf-email')?.value.trim(),
        device_type: $('#cf-device')?.value,
        required_service: $('#cf-service')?.value,
        support_type: $('#cf-support-type')?.value,
        preferred_contact_method: $('#cf-contact-method')?.value,
        preferred_date: $('#cf-date')?.value || 'Not specified',
        problem_description: $('#cf-desc')?.value.trim(),
      };

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          renderFeedback('success', ['Your request has been sent successfully. I will get back to you shortly.']);
          showToast('Message sent successfully.');
          form.reset();
          if (priceNotice) priceNotice.innerHTML = '';
        } else {
          renderFeedback('error', [
            result.message || 'Something went wrong while sending your request. Please try again, or use WhatsApp/email below.'
          ]);
          showToast('Could not send message. Please try again.');
        }
      } catch (err) {
        renderFeedback('error', [
          'Network error — your request was not sent. Please check your connection and try again, or use WhatsApp/email below.'
        ]);
        showToast('Network error. Message not sent.');
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.textContent = originalBtnText || 'Submit Request';
        }
      }
    });
  }
}

/* ------------------------------------------------------------------
   15. SCROLL TO TOP
   ------------------------------------------------------------------ */
function initScrollTop() {
  const scrollBtn = $('#scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

/* ------------------------------------------------------------------
   INITIALIZE ALL MODULES
   ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initNav();
  initAudienceSwitcher();
  initCommandPalette();
  initSkillBars();
  initSkillsFilter();
  initTopologyInspector();
  initStackFilters();
  initCaseStudyModals();    
  initViewAllToggles();
  initOngoingModals();
  initShareModal();
  initConsoleTabs();
  initTerminal();
  initPlaygroundTools();
  initResumeGenerator();
  initSubnetCalc();
  initPasswordMeter();
  initServicesAndSolver();
  initScrollTop();

  console.log('%cWAVE FUNCTION // IT Engineering Command Center', 'color:#F5A623;font-family:monospace;font-size:14px;font-weight:bold;');
  console.log('%cKumaradoss S  |  Build. Break. Fix. Secure. Document. Teach.', 'color:#36D9FF;font-family:monospace;font-size:11px;');
});