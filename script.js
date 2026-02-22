/* ═══════════════════════════════════════════
   LUYUAN GE — HACKER PORTFOLIO SCRIPTS
   Feature Set: Matrix, Decryption, Tilt, HUD, Cursor
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  // ── 1. Matrix Rain with Interaction ──
  function initMatrix() {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, columns;
    const fontSize = 16;
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$+-*/%=<>!&|^~';
    let drops = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
    }

    function draw() {
      // Fade trail
      ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ffcc';
      ctx.font = fontSize + 'px "JetBrains Mono"';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Interaction: Repel drops around mouse
        const dist = Math.abs(x - mouse.x);
        if (dist < 50 && Math.abs(y - mouse.y) < 50) {
           ctx.fillStyle = '#ff00c1'; // Glitch color near mouse
        } else {
           ctx.fillStyle = '#00ffcc';
        }

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  // ── 2. Decryption Text Effect (HyperText) ──
  function initDecryption() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
    const targets = document.querySelectorAll('[data-decrypt]');

    const decrypt = (element) => {
      let iterations = 0;
      const originalText = element.getAttribute('data-decrypt');
      // If we've already set the text, don't reset unless we want loop
      // But we just want the effect to run once or on re-entry
      
      const interval = setInterval(() => {
        element.innerText = originalText
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join("");

        if (iterations >= originalText.length) {
          clearInterval(interval);
        }

        iterations += 1 / 2; // Speed of decoding
      }, 30);
    };

    targets.forEach(target => {
      // Use Intersection Observer to trigger
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            decrypt(entry.target);
            observer.unobserve(entry.target); // Run once
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(target);
      
      // Also trigger on hover for nav links
      if(target.classList.contains('nav__link')) {
        target.addEventListener('mouseenter', () => decrypt(target));
      }
    });
  }

  // ── 3. 3D Tilt Effect (Vanilla JS) ──
  function initTilt() {
    const cards = document.querySelectorAll('.project-card, .timeline__card, .hero__terminal, .terminal-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate rotation
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5; // Max -5deg to 5deg
        const rotateY = ((x - centerX) / centerX) * 5;

        // Apply transform
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Dynamic border/shadow/glare effect could go here
        // Simple glare using box-shadow
        // card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 20px rgba(0, 255, 204, 0.1)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        // card.style.boxShadow = 'none';
      });
    });
  }

  // ── 4. Custom Cursor ──
  function initCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth animation loop
    function animateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      // Interpolate for smooth trailing effect
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects on clickable elements
    const links = document.querySelectorAll('a, button, .project-card, .timeline__card');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => document.body.classList.add('hover-active'));
      link.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'));
    });
  }

  // ── 5. HUD System Monitor ──
  function initHUD() {
    const timeEl = document.getElementById('hudTime');
    const pingEl = document.getElementById('hudPing');
    
    // Time (Eastern Standard Time)
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    setInterval(() => {
      const now = new Date();
      timeEl.innerText = timeFormatter.format(now) + ' EST';
    }, 1000);

    // Simulated Network Latency
    setInterval(() => {
      const ping = Math.floor(Math.random() * 15) + 5; // 5-20ms
      pingEl.innerText = ping + 'ms';
    }, 1500);
  }

  // ── 6. Interactive CLI ──
  function initCLI() {
    const input = document.getElementById('cliInput');
    const history = document.getElementById('cliHistory');
    if (!input || !history) return;

    // Default startup message
    const welcome = document.createElement('div');
    welcome.className = 'cli-line info';
    welcome.innerHTML = '>> SYSTEM INITIALIZED. TYPE <span style="color:var(--text-bright)">help</span> FOR COMMANDS.';
    history.appendChild(welcome);

    const commands = {
      help: "Available commands: help, clear, goto [section], date, whoami, ls, cat [file]",
      clear: () => { history.innerHTML = ''; return null; },
      whoami: "guest@luyuange.sys (Level 1 Access)",
      ls: "about/  experience/  projects/  skills/  contact/  resume.pdf",
      date: () => new Date().toLocaleString(),
      "cat resume.pdf": "Error: Binary file. Please use the GUI link to download.",
      "goto about": () => document.getElementById('about').scrollIntoView({ behavior: 'smooth' }),
      "goto experience": () => document.getElementById('experience').scrollIntoView({ behavior: 'smooth' }),
      "goto projects": () => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' }),
      "goto skills": () => document.getElementById('skills').scrollIntoView({ behavior: 'smooth' }),
      "goto contact": () => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }),
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (!val) return;

        // Add command to history
        const cmdLine = document.createElement('div');
        cmdLine.className = 'cli-line';
        cmdLine.innerHTML = `<span style="color:var(--green)">guest@luyuange:~$</span> ${val}`;
        history.appendChild(cmdLine);

        // Process command
        let response = null;
        if (commands[val]) {
          response = typeof commands[val] === 'function' ? commands[val]() : commands[val];
        } else if (val.startsWith('goto ')) {
          const section = val.split(' ')[1];
          const target = document.getElementById(section);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            response = `Navigating to ${section}...`;
          } else {
            response = `Directory '${section}' not found.`;
          }
        } else if (val.startsWith('cat ')) {
           response = `Access Denied: File '${val.split(' ')[1]}' is encrypted.`;
        } else {
          response = `Command not found: ${val}. Type 'help' for options.`;
        }

        if (response) {
          const resLine = document.createElement('div');
          resLine.className = 'cli-line info';
          resLine.textContent = response;
          history.appendChild(resLine);
        }

        // Scroll to bottom
        history.scrollTop = history.scrollHeight;
        input.value = '';
      }
    });
  }

  // ── 7. Sonar Pulse Effect ──
  function initSonar() {
    document.addEventListener('click', (e) => {
      const pulse = document.createElement('div');
      pulse.className = 'sonar-pulse';
      pulse.style.left = `${e.clientX}px`;
      pulse.style.top = `${e.clientY}px`;
      document.body.appendChild(pulse);
      
      setTimeout(() => {
        pulse.remove();
      }, 600);
    });
  }

  // ── 8. Standard Animations (GSAP) ──
  function initGSAP() {
     // Typewriter for Hero Name
    gsap.to("#typewriter", {
      duration: 1.5,
      text: "LUYUAN GE",
      delay: 0.5,
      ease: "none"
    });

    // Reveal Sections
    const sections = document.querySelectorAll('.reveal');
    sections.forEach((section) => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
    });
  }

  // ── Init ──
  document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    initDecryption();
    initTilt();
    initCursor();
    initHUD();
    initCLI();
    initSonar();
    initGSAP();
    
    // Nav Logic
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const mobile = document.getElementById('navMobile');
    
    if (toggle) {
        toggle.addEventListener('click', () => {
            mobile.classList.toggle('nav__mobile--open');
        });
    }

    // Console Easter Egg
    console.log("%c SYSTEM READY // ACCESS GRANTED ", "background: #000; color: #00ffcc; font-size: 14px; padding: 10px; border: 1px solid #00ffcc;");
  });

})();
