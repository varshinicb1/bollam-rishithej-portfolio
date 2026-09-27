(() => {
  'use strict';

  // -------------------------------------------------------------
  // 1. Accessibility & Motion Preferences
  // -------------------------------------------------------------
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // -------------------------------------------------------------
  // 2. Scroll Reveal Animations
  // -------------------------------------------------------------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
      // A fast flick can move the viewport past an element between two
      // observer callbacks. Because unobserve() runs on first intersection,
      // anything skipped that way stays hidden for good — so sweep for
      // stragglers that are already above the fold and reveal them.
      reveals.forEach((el) => {
        if (el.classList.contains('in')) return;
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('in');
          observer.unobserve(el);
        }
      });
      // threshold 0 so a single intersecting pixel counts; the negative bottom
      // margin preserves the "rises into view" timing that 0.12 gave us.
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });

    reveals.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`;
      observer.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // -------------------------------------------------------------
  // 3. Live Executive Clock (Hyderabad, IST / UTC+5:30)
  // -------------------------------------------------------------
  const liveTimeEl = document.getElementById('liveTime');
  const mobileLiveTimeEl = document.getElementById('mobileLiveTime');
  function updateClock() {
    let timeStr = '';
    try {
      const now = new Date();
      timeStr = now.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' IST';
    } catch (e) {
      const d = new Date();
      timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')} IST`;
    }
    if (liveTimeEl) liveTimeEl.textContent = timeStr;
    if (mobileLiveTimeEl) mobileLiveTimeEl.textContent = timeStr;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // -------------------------------------------------------------
  // 4. Scroll Progress, Nav State & Active Spy
  // -------------------------------------------------------------
  const progressBar = document.getElementById('scrollProgress');
  const mainNav = document.getElementById('mainNav');
  // When the browser can run the reading rule off a native scroll timeline we
  // hand that job entirely to CSS.
  const nativeScrollTimeline =
    typeof CSS !== 'undefined' &&
    CSS.supports &&
    CSS.supports('animation-timeline: scroll()') &&
    !reduceMotion;
  let lastScrollTop = 0;
  // Declared here, not reused from the hero-parallax block further down: that
  // one is a `const` in the temporal dead zone when handleScroll() first runs.
  const heroPlate = document.getElementById('hero');
  const navLinks = document.querySelectorAll('.nav nav a');
  const spySections = ['story', 'ventures', 'journey', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Progress Bar.
    // Where CSS scroll-driven animations exist the stylesheet drives this off
    // a native scroll timeline (width:100% + scaleX), which runs on the
    // compositor. Writing an inline width here would override that and leave
    // the bar scaling a variable-width element, so stand down.
    if (progressBar && docHeight > 0 && !nativeScrollTimeline) {
      const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progressBar.style.width = `${progress}%`;
    }

    // Nav retreat: withdraw while reading downward, return on upward intent.
    if (mainNav && !reduceMotion) {
      const delta = scrollTop - lastScrollTop;
      if (scrollTop > 240 && delta > 4 && !mainNav.classList.contains('open')) {
        mainNav.classList.add('nav-retreat');
      } else if (delta < -4 || scrollTop <= 240) {
        mainNav.classList.remove('nav-retreat');
      }
      // Ignore sub-pixel jitter so the bar does not flicker at rest.
      if (Math.abs(delta) > 4) lastScrollTop = scrollTop;
    }

    // Nav scrolled style
    if (mainNav) {
      if (scrollTop > 40) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }

      // The hero is a near-black photograph, so the bar stays transparent and
      // light-on-dark for as long as it overlaps the hero. Measured rather
      // than hard-coded, because the hero height is viewport-relative.
      if (heroPlate) {
        const overHero =
          heroPlate.getBoundingClientRect().bottom > mainNav.offsetHeight;
        mainNav.classList.toggle('nav-on-dark', overHero);
      }
    }

    // Active nav link highlight
    if (spySections.length > 0) {
      let currentSectionId = '';
      spySections.forEach((sec) => {
        const top = sec.offsetTop - 200;
        if (scrollTop >= top) {
          currentSectionId = sec.id;
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // -------------------------------------------------------------
  // 5. Interactive Metric Numbers Counter
  // -------------------------------------------------------------
  const metricNums = document.querySelectorAll('.metric-num');
  if ('IntersectionObserver' in window && metricNums.length > 0 && !reduceMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-target') || el.textContent, 10);
          if (target > 0) {
            el.textContent = '0';
            animateCount(el, target, 500);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    metricNums.forEach((el) => counterObserver.observe(el));
  }

  function animateCount(el, target, duration = 500) {
    const startTime = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress >= 1) {
        clearInterval(timer);
        el.textContent = String(target);
      }
    }, 20);
  }

  // -------------------------------------------------------------
  // 6. Venture Register
  // The card spotlight and 3D perspective tilt that lived here were
  // removed with the card grid. Both belonged to the templated look,
  // and the register expresses its hover state in CSS — a ruled row
  // and a drawn underline, no per-frame JavaScript.
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // 7. Toast Notification & Copy Direct Email
  // -------------------------------------------------------------
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    playAcousticTone(880, 0.05);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  const EMAIL = 'rishi@mldynamic.com';

  async function copyEmailToClipboard(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(EMAIL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = EMAIL;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast(`Copied ${EMAIL} — Direct channel open.`);
    } catch (err) {
      window.location.href = `mailto:${EMAIL}`;
    }
  }

  const copyEmailBtn = document.getElementById('copyEmailBtn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', copyEmailToClipboard);
  }

  // -------------------------------------------------------------
  // 8. Acoustic Synthesizer (Micro-Audio Experience)
  // -------------------------------------------------------------
  let audioCtx = null;
  let soundEnabled = false;
  const soundToggle = document.getElementById('soundToggle');
  const cmdSoundLabel = document.getElementById('cmdSoundLabel');

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playAcousticTone(freq = 520, duration = 0.06, type = 'sine') {
    if (!soundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      // Graceful fallback
    }
  }

  function toggleSound() {
    initAudio();
    soundEnabled = !soundEnabled;
    if (soundToggle) {
      soundToggle.classList.toggle('active', soundEnabled);
      soundToggle.setAttribute('title', soundEnabled ? 'Acoustics: On' : 'Acoustics: Off');
    }
    if (cmdSoundLabel) {
      cmdSoundLabel.textContent = soundEnabled ? 'Disable Acoustic Experience' : 'Enable Acoustic Experience';
    }
    if (soundEnabled) {
      playAcousticTone(640, 0.08);
      showToast('Acoustic atmosphere enabled.');
    } else {
      showToast('Acoustics muted.');
    }
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', toggleSound);
  }

  // Play subtle acoustic tones on key interactions if sound enabled
  document.querySelectorAll('a, button, .venture-row').forEach((interactive) => {
    interactive.addEventListener('mouseenter', () => {
      if (soundEnabled) playAcousticTone(380, 0.04);
    });
  });

  // -------------------------------------------------------------
  // 9. Command Palette (Cmd + K / Quick Action HUD)
  // -------------------------------------------------------------
  const cmdModal = document.getElementById('cmdModal');
  const cmdBackdrop = document.getElementById('cmdBackdrop');
  const cmdTrigger = document.getElementById('cmdTrigger');
  const cmdInput = document.getElementById('cmdInput');
  const cmdList = document.getElementById('cmdList');
  const cmdItems = cmdList ? Array.from(cmdList.querySelectorAll('.cmd-item')) : [];

  function openCmd() {
    if (!cmdModal) return;
    cmdModal.classList.add('open');
    cmdModal.setAttribute('aria-hidden', 'false');
    if (cmdInput) {
      cmdInput.value = '';
      cmdInput.focus();
    }
    filterCmdItems('');
    playAcousticTone(720, 0.07);
  }

  function closeCmd() {
    if (!cmdModal) return;
    cmdModal.classList.remove('open');
    cmdModal.setAttribute('aria-hidden', 'true');
    if (cmdTrigger) cmdTrigger.focus();
  }

  function filterCmdItems(query) {
    const q = query.toLowerCase().trim();
    let firstVisible = null;

    cmdItems.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const matches = !q || text.includes(q);
      item.style.display = matches ? 'flex' : 'none';
      item.classList.remove('active');
      if (matches && !firstVisible) {
        firstVisible = item;
      }
    });

    if (firstVisible) {
      firstVisible.classList.add('active');
    }
  }

  function executeCmdItem(item) {
    if (!item) return;
    const action = item.getAttribute('data-action');
    const target = item.getAttribute('data-target');
    const url = item.getAttribute('data-url');

    closeCmd();

    if (action === 'nav' && target) {
      const el = document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'copy-email') {
      copyEmailToClipboard();
    } else if (action === 'link' && url) {
      window.open(url, '_blank', 'noopener');
    } else if (action === 'toggle-sound') {
      toggleSound();
    }
  }

  if (cmdTrigger) cmdTrigger.addEventListener('click', openCmd);
  if (cmdBackdrop) cmdBackdrop.addEventListener('click', closeCmd);

  if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
      filterCmdItems(e.target.value);
    });

    cmdInput.addEventListener('keydown', (e) => {
      const visibleItems = cmdItems.filter(it => it.style.display !== 'none');
      const activeIdx = visibleItems.findIndex(it => it.classList.contains('active'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (activeIdx + 1) % visibleItems.length;
        visibleItems.forEach(it => it.classList.remove('active'));
        if (visibleItems[nextIdx]) {
          visibleItems[nextIdx].classList.add('active');
          visibleItems[nextIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (activeIdx - 1 + visibleItems.length) % visibleItems.length;
        visibleItems.forEach(it => it.classList.remove('active'));
        if (visibleItems[prevIdx]) {
          visibleItems[prevIdx].classList.add('active');
          visibleItems[prevIdx].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = visibleItems[activeIdx] || visibleItems[0];
        if (active) executeCmdItem(active);
      } else if (e.key === 'Escape') {
        closeCmd();
      }
    });
  }

  cmdItems.forEach((item) => {
    item.addEventListener('click', () => executeCmdItem(item));
  });

  // Global Keyboard Shortcut: Cmd/Ctrl + K & Esc
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdModal && cmdModal.classList.contains('open')) {
        closeCmd();
      } else {
        openCmd();
      }
    } else if (e.key === 'Escape') {
      if (cmdModal && cmdModal.classList.contains('open')) {
        closeCmd();
      }
    }
  });

  // -------------------------------------------------------------
  // 10. Custom Magnetic Cursor (Smooth lerp, desktop only)
  // -------------------------------------------------------------
  const cursor = document.getElementById('customCursor');
  if (cursor && isFinePointer && !reduceMotion) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        cursor.classList.add('active');
        isMoving = true;
      }
      cursor.style.setProperty('--cx', `${mouseX}px`);
      cursor.style.setProperty('--cy', `${mouseY}px`);
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('active');
      isMoving = false;
    });

    // Lerp smooth follow for outer ring
    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursor.style.setProperty('--rx', `${ringX}px`);
      cursor.style.setProperty('--ry', `${ringY}px`);
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover magnification on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .venture-row, .metric-card, input, .round-link');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // -------------------------------------------------------------
  // 11. Mobile Navigation Drawer
  // -------------------------------------------------------------
  const menuBtn = document.querySelector('.menu');
  const navEl = document.querySelector('.nav');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileCopyEmailBtn = document.getElementById('mobileCopyEmailBtn');
  const mobileCmdBtn = document.getElementById('mobileCmdBtn');
  const mobileSoundBtn = document.getElementById('mobileSoundBtn');

  if (menuBtn && navEl) {
    const setMenu = (open) => {
      navEl.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        playAcousticTone(600, 0.05);
      }
    };

    menuBtn.addEventListener('click', () => setMenu(!navEl.classList.contains('open')));

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => setMenu(false));
    }

    if (mobileCopyEmailBtn) {
      mobileCopyEmailBtn.addEventListener('click', (e) => {
        copyEmailToClipboard(e);
      });
    }

    if (mobileCmdBtn) {
      mobileCmdBtn.addEventListener('click', () => {
        setMenu(false);
        openCmd();
      });
    }

    if (mobileSoundBtn) {
      mobileSoundBtn.addEventListener('click', () => {
        toggleSound();
        if (mobileSoundBtn) {
          mobileSoundBtn.textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
        }
      });
    }

    navEl.querySelectorAll('nav a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navEl.classList.contains('open')) {
        setMenu(false);
      }
    });
  }

  // -------------------------------------------------------------
  // 12. Hero 3D Spatial Parallax & Specular Lighting Engine
  // -------------------------------------------------------------
  const heroSection = document.getElementById('hero');
  const heroCopy = document.getElementById('heroCopy');
  const heroImage = document.getElementById('heroImage');
  const heroLightRig = document.getElementById('heroLightRig');

  if (heroSection && isFinePointer && !reduceMotion) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    let animId = null;
    let isHeroVisible = true;

    heroSection.addEventListener('mouseenter', () => {
      isHovering = true;
    });

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = nx;
      targetY = ny;

      if (heroLightRig) {
        heroLightRig.style.setProperty('--light-x', `${e.clientX - rect.left}px`);
        heroLightRig.style.setProperty('--light-y', `${e.clientY - rect.top}px`);
      }
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
    });

    function updateHeroSpatial() {
      if (!isHeroVisible) {
        animId = requestAnimationFrame(updateHeroSpatial);
        return;
      }

      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      // 3D Perspective Tilt on Headline & Copy
      if (heroCopy) {
        const rotY = (currentX * 5).toFixed(2);
        const rotX = (-currentY * 5).toFixed(2);
        const transX = (currentX * 12).toFixed(2);
        const transY = (currentY * 10).toFixed(2);
        heroCopy.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translate3d(${transX}px, ${transY}px, 0)`;
      }

      // Counter-Parallax on Portrait
      if (heroImage) {
        const imgX = (-currentX * 16).toFixed(2);
        const imgY = (-currentY * 12).toFixed(2);
        heroImage.style.transform = `translate3d(${imgX}px, ${imgY}px, 0)`;
      }

      animId = requestAnimationFrame(updateHeroSpatial);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isHeroVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    }

    animId = requestAnimationFrame(updateHeroSpatial);
  }
  // -------------------------------------------------------------
  // 12. Magnetic Targets
  // The primary controls lean toward the pointer as it approaches and
  // settle back on exit. Fine pointers only, and never under reduced
  // motion. The offset is published as CSS custom properties so the
  // stylesheet owns the easing and can disable the whole effect with a
  // media query.
  // -------------------------------------------------------------
  if (isFinePointer && !reduceMotion) {
    const MAGNETS = '.round-link, .copy-email-btn, .menu';
    const STRENGTH = 0.32;   // fraction of the offset the element travels
    const RADIUS = 1.6;      // activation distance, in element half-widths

    document.querySelectorAll(MAGNETS).forEach((el) => {
      let frame = null;

      const release = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = null;
        el.classList.remove('magnetic-active');
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      };

      const track = (e) => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const b = el.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2);
          const dy = e.clientY - (b.top + b.height / 2);
          const reach = Math.max(b.width, b.height) * RADIUS;
          if (Math.hypot(dx, dy) > reach) { release(); return; }
          el.classList.add('magnetic-active');
          el.style.setProperty('--mag-x', (dx * STRENGTH).toFixed(2) + 'px');
          el.style.setProperty('--mag-y', (dy * STRENGTH).toFixed(2) + 'px');
        });
      };

      // Listen on the document so the pull begins before the cursor actually
      // reaches the element, which is what makes it read as magnetism.
      document.addEventListener('mousemove', track, { passive: true });
      el.addEventListener('mouseleave', release);
      el.addEventListener('blur', release);
      window.addEventListener('blur', release);
    });
  }

  // -------------------------------------------------------------
  // 13. Marginal Section Index
  // Tracks the section currently under the reading line and inverts
  // itself while it overlaps a dark block, so the marks stay legible
  // against both paper and ink.
  // -------------------------------------------------------------
  const sectionIndex = document.getElementById('sectionIndex');

  if (sectionIndex) {
    const marks = [...sectionIndex.querySelectorAll('a')];
    const targets = marks
      .map((a) => ({ mark: a, el: document.getElementById(a.dataset.section) }))
      .filter((t) => t.el);

    const syncIndex = () => {
      // The reading line sits a third of the way down the viewport; whichever
      // section crosses it is the one being read.
      const line = window.innerHeight * 0.34;
      let current = targets[0];
      targets.forEach((t) => {
        if (t.el.getBoundingClientRect().top <= line) current = t;
      });
      marks.forEach((m) => m.classList.toggle('active', current && m === current.mark));

      // Invert over dark blocks. Probe what is behind the index rather than
      // maintaining a list of which sections are dark — but the index is
      // itself painted at that point, so walk the hit list past its own nodes
      // (elementFromPoint, singular, just returns the index every time).
      const box = sectionIndex.getBoundingClientRect();
      const stack = document.elementsFromPoint(
        Math.min(window.innerWidth - 8, Math.max(0, box.left + box.width / 2)),
        window.innerHeight / 2
      );
      const behind = stack.find((el) => !sectionIndex.contains(el) && el !== sectionIndex);
      sectionIndex.classList.toggle('on-dark', Boolean(behind && behind.closest('.tone-dark')));
    };

    let indexFrame = null;
    const queueSync = () => {
      if (indexFrame) return;
      indexFrame = requestAnimationFrame(() => { indexFrame = null; syncIndex(); });
    };

    window.addEventListener('scroll', queueSync, { passive: true });
    window.addEventListener('resize', queueSync, { passive: true });
    syncIndex();
  }

})();
