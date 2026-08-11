/* LEGACY V1 REFERENCE — NOT LOADED BY index.html.
   Still Scenes V2 runs from src/main.js and browser-native ES modules.
   This historical implementation remains intact for provenance and comparison. */

/* ==========================================================================
   STILL SCENES STUDIO — APPLICATION ENGINE & CANVAS RENDERER
   ========================================================================== */

(function () {
  'use strict';

  // --- STUDIO STATE ---
  const state = {
    route: 'split',               // split | front | back | duplex | zine
    aspectRatio: '3:2',           // 3:2 | 2:3 | 4:5 | 3:5 | A6-land
    splitRatio: 0.46,             // 0.35 - 0.60
    marginSize: 0.04,             // 0.01 - 0.08
    imageObj: null,               // HTMLImageElement or null
    imageLoaded: false,
    preservationLevel: 'high',    // high | medium | low
    photoTreatment: 'framed',     // framed | film | specimen | halftone | silhouette
    location: 'PONTIAN, JOHOR, MALAYSIA',
    date: 'APR 23, 2026',
    caption: 'A SMALL BLOOM, HELD FOR LATER.',
    writingRulesCount: 7,
    fontPairing: 'editorial',     // editorial | newsreader | typewriter
    paperTone: 'ivory',           // ivory | cream | natural | gray | kraft
    accentColor: '#E05A36',
    postalMark: 'camera',         // camera | stamp | dot | none
    printTexture: 'subtle',       // subtle | film | risograph | clean
    viewMode: 'composite'         // composite | base | back
  };

  // Preset Image Paths (Absolute or Relative)
  const PRESET_IMAGES = {
    demo1: 'demos/generated/demo-01-lantana-split-postcard.png',
    demo2: 'demos/generated/demo-02-rainy-bus-stop-front.png',
    demo3: 'demos/generated/demo-03-coastal-scene-zine.png'
  };

  // Color Palette Definitions
  const PAPER_PALETTES = {
    ivory: '#F9F6EE',
    cream: '#F6F1E5',
    natural: '#FAF8F5',
    gray: '#EFECE6',
    kraft: '#E8DEC9'
  };

  // Canvas Element & Context
  const canvas = document.getElementById('studioCanvas');
  const ctx = canvas.getContext('2d');

  // Cache Preloaded Demo Images
  const imageCache = {};

  // --- INITIALIZATION ---
  function init() {
    bindEvents();
    loadPreset('demo1');
  }

  // Bind UI Control Listeners
  function bindEvents() {
    // Route Tabs
    document.querySelectorAll('#routeNav .nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#routeNav .nav-btn').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        state.route = targetBtn.dataset.route;
        
        // Auto adjust default aspect ratio if zine selected
        if (state.route === 'zine') {
          state.aspectRatio = '3:5';
          document.getElementById('aspectRatio').value = '3:5';
        } else if (state.route === 'split') {
          state.aspectRatio = '3:2';
          document.getElementById('aspectRatio').value = '3:2';
        }
        
        updateUIControls();
        render();
      });
    });

    // Preset Selector
    document.getElementById('demoSelect').addEventListener('change', (e) => {
      const val = e.target.value;
      if (val !== 'none') {
        loadPreset(val);
      }
    });

    // Control Inputs
    document.getElementById('aspectRatio').addEventListener('change', (e) => {
      state.aspectRatio = e.target.value;
      render();
    });

    document.getElementById('splitRatio').addEventListener('input', (e) => {
      state.splitRatio = parseFloat(e.target.value) / 100;
      document.getElementById('splitRatioVal').textContent = `${e.target.value}%`;
      render();
    });

    document.getElementById('marginSize').addEventListener('input', (e) => {
      state.marginSize = parseFloat(e.target.value) / 100;
      document.getElementById('marginSizeVal').textContent = `${e.target.value}%`;
      render();
    });

    document.getElementById('preservationLevel').addEventListener('change', (e) => {
      state.preservationLevel = e.target.value;
      render();
    });

    document.getElementById('photoTreatment').addEventListener('change', (e) => {
      state.photoTreatment = e.target.value;
      render();
    });

    // Text Copy Inputs
    document.getElementById('inputLocation').addEventListener('input', (e) => {
      state.location = e.target.value;
      render();
    });

    document.getElementById('inputDate').addEventListener('input', (e) => {
      state.date = e.target.value;
      render();
    });

    document.getElementById('inputCaption').addEventListener('input', (e) => {
      state.caption = e.target.value;
      render();
    });

    document.getElementById('ruleCount').addEventListener('input', (e) => {
      state.writingRulesCount = parseInt(e.target.value, 10);
      document.getElementById('ruleCountVal').textContent = state.writingRulesCount;
      render();
    });

    document.getElementById('fontPairing').addEventListener('change', (e) => {
      state.fontPairing = e.target.value;
      render();
    });

    // Paper & Accent Controls
    document.getElementById('paperTone').addEventListener('change', (e) => {
      state.paperTone = e.target.value;
      render();
    });

    document.getElementById('accentColorPicker').addEventListener('input', (e) => {
      state.accentColor = e.target.value;
      document.getElementById('accentPreset').value = e.target.value;
      render();
    });

    document.getElementById('accentPreset').addEventListener('change', (e) => {
      state.accentColor = e.target.value;
      document.getElementById('accentColorPicker').value = e.target.value;
      render();
    });

    document.getElementById('postalMark').addEventListener('change', (e) => {
      state.postalMark = e.target.value;
      render();
    });

    document.getElementById('printTexture').addEventListener('change', (e) => {
      state.printTexture = e.target.value;
      render();
    });

    // View Mode Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        if (e.target.id === 'btnViewComposite') state.viewMode = 'composite';
        if (e.target.id === 'btnViewBase') state.viewMode = 'base';
        if (e.target.id === 'btnViewBack') state.viewMode = 'back';
        render();
      });
    });

    // File Upload Drag & Drop
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFileUpload(file);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--accent-orange)';
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-strong)';
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-strong)';
      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    // Modal Inspection Trigger
    document.getElementById('btnInspectBrief').addEventListener('click', openModal);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('briefModal').addEventListener('click', (e) => {
      if (e.target.id === 'briefModal') closeModal();
    });

    // Modal Tabs
    document.querySelectorAll('.modal-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.modal-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.modal-body .tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.tab).classList.add('active');
      });
    });

    // Copy to Clipboard buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.target.dataset.target;
        const text = document.getElementById(targetId).textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = e.target.textContent;
          e.target.textContent = 'Copied!';
          setTimeout(() => { e.target.textContent = originalText; }, 1800);
        });
      });
    });

    // Export PNG
    document.getElementById('btnExportImage').addEventListener('click', exportPNG);
  }

  // Handle user uploaded photo
  function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        state.imageObj = img;
        state.imageLoaded = true;
        document.getElementById('demoSelect').value = 'none';
        render();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Load Preset Demos
  function loadPreset(key) {
    if (key === 'demo1') {
      state.route = 'split';
      state.aspectRatio = '3:2';
      state.splitRatio = 0.46;
      state.location = 'PONTIAN, JOHOR, MALAYSIA';
      state.date = 'APR 23, 2026';
      state.caption = 'A SMALL BLOOM, HELD FOR LATER.';
      state.writingRulesCount = 7;
      state.accentColor = '#E05A36';
      state.postalMark = 'camera';
      state.paperTone = 'ivory';
    } else if (key === 'demo2') {
      state.route = 'front';
      state.aspectRatio = '3:2';
      state.location = '';
      state.date = '';
      state.caption = 'THE RAIN LEFT FIRST.';
      state.writingRulesCount = 0;
      state.accentColor = '#E05A36';
      state.postalMark = 'dot';
      state.paperTone = 'cream';
    } else if (key === 'demo3') {
      state.route = 'zine';
      state.aspectRatio = '3:5';
      state.location = '';
      state.date = '';
      state.caption = 'BETWEEN TIDE AND MORNING.';
      state.writingRulesCount = 0;
      state.accentColor = '#E05A36';
      state.postalMark = 'none';
      state.paperTone = 'natural';
    }

    updateUIControls();

    const imgPath = PRESET_IMAGES[key];
    if (imageCache[imgPath]) {
      state.imageObj = imageCache[imgPath];
      state.imageLoaded = true;
      render();
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache[imgPath] = img;
        state.imageObj = img;
        state.imageLoaded = true;
        render();
      };
      img.src = imgPath;
    }
  }

  // Synchronize UI Form Elements with State
  function updateUIControls() {
    document.getElementById('aspectRatio').value = state.aspectRatio;
    document.getElementById('splitRatio').value = Math.round(state.splitRatio * 100);
    document.getElementById('splitRatioVal').textContent = `${Math.round(state.splitRatio * 100)}%`;
    document.getElementById('marginSize').value = Math.round(state.marginSize * 100);
    document.getElementById('marginSizeVal').textContent = `${Math.round(state.marginSize * 100)}%`;
    document.getElementById('inputLocation').value = state.location;
    document.getElementById('inputDate').value = state.date;
    document.getElementById('inputCaption').value = state.caption;
    document.getElementById('ruleCount').value = state.writingRulesCount;
    document.getElementById('ruleCountVal').textContent = state.writingRulesCount;
    document.getElementById('paperTone').value = state.paperTone;
    document.getElementById('accentColorPicker').value = state.accentColor;
    document.getElementById('postalMark').value = state.postalMark;
    document.getElementById('fontPairing').value = state.fontPairing;
    
    // Toggle split slider visibility
    const splitRow = document.getElementById('splitWidthRow');
    if (state.route === 'split') {
      splitRow.style.display = 'flex';
    } else {
      splitRow.style.display = 'none';
    }

    // Update Route Nav buttons
    document.querySelectorAll('#routeNav .nav-btn').forEach(btn => {
      if (btn.dataset.route === state.route) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Calculate Canvas Dimensions based on Aspect Ratio
  function getCanvasDimensions() {
    switch (state.aspectRatio) {
      case '3:2': return { w: 1536, h: 1024 };
      case '2:3': return { w: 1024, h: 1536 };
      case '4:5': return { w: 1200, h: 1500 };
      case '3:5': return { w: 972, h: 1620 };
      case 'A6-land': return { w: 1748, h: 1240 };
      default: return { w: 1536, h: 1024 };
    }
  }

  // --- RENDER ENGINE ---
  function render() {
    const dims = getCanvasDimensions();
    canvas.width = dims.w;
    canvas.height = dims.h;

    document.getElementById('dimIndicator').textContent = `${dims.w} × ${dims.h} px (${state.aspectRatio})`;

    // Clear Canvas
    ctx.clearRect(0, 0, dims.w, dims.h);

    if (state.viewMode === 'back') {
      renderWritableBackSurface(dims);
    } else if (state.route === 'split') {
      renderSplitPostcard(dims);
    } else if (state.route === 'front') {
      renderImageFrontPostcard(dims);
    } else if (state.route === 'zine') {
      renderDistilledZine(dims);
    } else if (state.route === 'back') {
      renderWritableBackSurface(dims);
    } else if (state.route === 'duplex') {
      renderSplitPostcard(dims); // Default render front side for duplex
    }

    // Apply Print Texture Overlay
    if (state.printTexture !== 'clean') {
      applyTextureGrain(dims);
    }

    // Update Quality Gates & Inspector Brief
    updateQualityGates();
    updateModalBrief();
  }

  // Fill Paper Background
  function drawPaperBackground(dims) {
    ctx.fillStyle = PAPER_PALETTES[state.paperTone] || '#F9F6EE';
    ctx.fillRect(0, 0, dims.w, dims.h);
  }

  // Render Route 1: Split Postcard (Field-Note Split)
  function renderSplitPostcard(dims) {
    drawPaperBackground(dims);

    const safeInset = dims.w * state.marginSize;
    const availWidth = dims.w - (safeInset * 2);
    const availHeight = dims.h - (safeInset * 2);

    const photoWidth = availWidth * state.splitRatio;
    const gutter = availWidth * 0.04;
    const writingWidth = availWidth - photoWidth - gutter;

    const leftX = safeInset;
    const rightX = safeInset + photoWidth + gutter;
    const topY = safeInset;

    // --- LEFT PHOTO FIELD ---
    const photoMatMargin = photoWidth * 0.06;
    const photoDrawX = leftX + photoMatMargin;
    const photoDrawY = topY + photoMatMargin;
    const photoDrawW = photoWidth - (photoMatMargin * 2);
    const photoDrawH = availHeight - (photoMatMargin * 2);

    // Photo Paper Mat Border
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.fillRect(photoDrawX - 4, photoDrawY - 4, photoDrawW + 8, photoDrawH + 8);
    ctx.shadowBlur = 0;

    if (state.imageLoaded && state.imageObj) {
      drawPhotoCrop(state.imageObj, photoDrawX, photoDrawY, photoDrawW, photoDrawH);
    } else {
      // Fallback Photo Placeholder
      ctx.fillStyle = '#DCD6CD';
      ctx.fillRect(photoDrawX, photoDrawY, photoDrawW, photoDrawH);
      ctx.fillStyle = '#8C857B';
      ctx.font = '16px ' + getFontFamily('sans');
      ctx.textAlign = 'center';
      ctx.fillText('[ Photo Zone ]', photoDrawX + photoDrawW / 2, photoDrawY + photoDrawH / 2);
    }

    if (state.viewMode === 'base') return; // Exit early if text-free requested

    // --- RIGHT WRITING FIELD ---
    let currentY = topY + 24;

    // 1. Header: Location & Date
    if (state.location || state.date) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#2A2725';

      if (state.location) {
        ctx.font = 'italic 600 20px ' + getFontFamily('serif');
        ctx.fillText(state.location.toUpperCase(), rightX, currentY);
        currentY += 22;
      }

      if (state.date) {
        ctx.font = '500 13px ' + getFontFamily('sans');
        ctx.fillStyle = '#6E6760';
        ctx.fillText(state.date.toUpperCase(), rightX, currentY);
        currentY += 28;
      }
    }

    // 2. Postal Accent Mark (Camera / Stamp / Dot)
    drawPostalAccentMark(rightX + writingWidth - 36, topY + 12, state.accentColor);

    // 3. Exact Caption
    if (state.caption) {
      currentY += 10;
      ctx.fillStyle = '#221F1D';
      ctx.font = 'italic 500 22px ' + getFontFamily('serif');
      
      const words = state.caption.split(' ');
      let line = '';
      const maxTextWidth = writingWidth - 20;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line, rightX, currentY);
          line = words[n] + ' ';
          currentY += 28;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, rightX, currentY);
      currentY += 34;
    }

    // 4. Writing Rules
    if (state.writingRulesCount > 0) {
      ctx.strokeStyle = 'rgba(110, 103, 96, 0.2)';
      ctx.lineWidth = 1;
      const ruleSpacing = 32;

      for (let i = 0; i < state.writingRulesCount; i++) {
        if (currentY > topY + availHeight - 40) break;
        ctx.beginPath();
        ctx.moveTo(rightX, currentY);
        ctx.lineTo(rightX + writingWidth, currentY);
        ctx.stroke();
        currentY += ruleSpacing;
      }
    }

    // 5. Footer Divider & Micro Brand Mark
    const footerY = topY + availHeight - 16;
    ctx.strokeStyle = 'rgba(110, 103, 96, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rightX, footerY);
    ctx.lineTo(rightX + writingWidth, footerY);
    ctx.stroke();

    ctx.fillStyle = '#8C857B';
    ctx.font = '600 10px ' + getFontFamily('sans');
    ctx.textAlign = 'right';
    ctx.fillText('STILL SCENES', rightX + writingWidth, footerY - 6);
  }

  // Render Route 2: Image-Led Postcard Front
  function renderImageFrontPostcard(dims) {
    drawPaperBackground(dims);

    const safeInset = dims.w * state.marginSize;
    const photoW = dims.w - (safeInset * 2);
    const captionBandH = dims.h * 0.20;
    const photoH = dims.h - (safeInset * 2) - captionBandH;

    const photoX = safeInset;
    const photoY = safeInset;

    // Draw Main Image
    if (state.imageLoaded && state.imageObj) {
      drawPhotoCrop(state.imageObj, photoX, photoY, photoW, photoH);
    } else {
      ctx.fillStyle = '#DCD6CD';
      ctx.fillRect(photoX, photoY, photoW, photoH);
    }

    if (state.viewMode === 'base') return;

    // Caption Band
    const bandY = photoY + photoH + 16;
    ctx.fillStyle = '#221F1D';
    ctx.textAlign = 'left';
    ctx.font = 'italic 500 24px ' + getFontFamily('serif');
    ctx.fillText(state.caption, photoX, bandY + 28);

    if (state.date || state.location) {
      ctx.font = '500 12px ' + getFontFamily('sans');
      ctx.fillStyle = '#6E6760';
      ctx.textAlign = 'right';
      ctx.fillText((state.location + ' ' + state.date).trim(), photoX + photoW, bandY + 28);
    }
  }

  // Render Route 3: Distilled Scene Zine
  function renderDistilledZine(dims) {
    drawPaperBackground(dims);

    // Large quiet paper (~75% open space)
    const clusterW = dims.w * 0.45;
    const clusterH = dims.h * 0.35;
    const clusterX = dims.w * 0.12;
    const clusterY = dims.h * 0.48;

    // Distilled Visual Window
    ctx.save();
    ctx.beginPath();
    ctx.rect(clusterX, clusterY, clusterW, clusterH);
    ctx.clip();

    if (state.imageLoaded && state.imageObj) {
      drawPhotoCrop(state.imageObj, clusterX, clusterY, clusterW, clusterH);
    } else {
      ctx.fillStyle = '#3B5973';
      ctx.fillRect(clusterX, clusterY, clusterW, clusterH);
    }
    ctx.restore();

    // Accent Sun/Block
    ctx.fillStyle = state.accentColor;
    ctx.beginPath();
    ctx.arc(clusterX + clusterW + 20, clusterY + 30, 24, 0, Math.PI * 2);
    ctx.fill();

    if (state.viewMode === 'base') return;

    // Poetic Caption (Upper Right)
    ctx.fillStyle = '#1D1A18';
    ctx.textAlign = 'left';
    ctx.font = 'italic 500 26px ' + getFontFamily('serif');
    
    const words = state.caption.split(' ');
    let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');

    ctx.fillText(line1, dims.w * 0.48, dims.h * 0.22);
    if (line2) {
      ctx.fillText(line2, dims.w * 0.48, dims.h * 0.22 + 34);
    }
  }

  // Render Route 4: Writable Back Surface
  function renderWritableBackSurface(dims) {
    drawPaperBackground(dims);

    const margin = dims.w * 0.05;
    const midX = dims.w * 0.55;

    // Center Vertical Fine Rule Divider
    ctx.strokeStyle = 'rgba(110, 103, 96, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(midX, margin);
    ctx.lineTo(midX, dims.h - margin);
    ctx.stroke();

    // Upper Right Stamp Frame
    const stampW = 70;
    const stampH = 85;
    const stampX = dims.w - margin - stampW;
    const stampY = margin;

    ctx.strokeStyle = state.accentColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(stampX, stampY, stampW, stampH);
    ctx.setLineDash([]);

    // Message Rules (Left side)
    const ruleStartY = margin + 40;
    ctx.strokeStyle = 'rgba(110, 103, 96, 0.18)';
    ctx.lineWidth = 1;
    for (let y = ruleStartY; y < dims.h - margin - 30; y += 32) {
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(midX - 30, y);
      ctx.stroke();
    }

    // Address Rules (Right side)
    const addrStartY = stampY + stampH + 40;
    for (let y = addrStartY; y < dims.h - margin - 30; y += 40) {
      ctx.beginPath();
      ctx.moveTo(midX + 30, y);
      ctx.lineTo(dims.w - margin, y);
      ctx.stroke();
    }

    // Footer Microcopy
    ctx.fillStyle = '#8C857B';
    ctx.font = '500 11px ' + getFontFamily('sans');
    ctx.textAlign = 'left';
    ctx.fillText('STILL SCENES POSTCARD ZINE • POSTAL BACK', margin, dims.h - margin + 10);
  }

  // Draw Photo with Aspect Fit/Cover logic
  function drawPhotoCrop(img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;

    let sx, sy, sw, sh;

    if (imgRatio > targetRatio) {
      sh = img.height;
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / targetRatio;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // Draw Postal / Camera Outline Mark
  function drawPostalAccentMark(x, y, color) {
    if (state.postalMark === 'none') return;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;

    if (state.postalMark === 'camera') {
      // Small Camera Outline
      ctx.strokeRect(x, y + 4, 24, 16);
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillRect(x + 8, y + 1, 8, 3);
    } else if (state.postalMark === 'stamp') {
      // Stamp Frame
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(x, y, 26, 32);
      ctx.setLineDash([]);
    } else if (state.postalMark === 'dot') {
      // Date Dot
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Apply Texture Grain to Canvas
  function applyTextureGrain(dims) {
    const imgData = ctx.getImageData(0, 0, dims.w, dims.h);
    const data = imgData.data;
    const noiseAmount = state.printTexture === 'film' ? 14 : 7;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseAmount;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // Helper font resolver
  function getFontFamily(role) {
    if (role === 'serif') {
      if (state.fontPairing === 'newsreader') return "'Newsreader', serif";
      if (state.fontPairing === 'typewriter') return "'Space Mono', monospace";
      return "'Cormorant Garamond', serif";
    }
    return "'Inter', sans-serif";
  }

  // Update Quality Gate Strip Badges
  function updateQualityGates() {
    const copyGate = document.getElementById('gateCopy');
    const presGate = document.getElementById('gatePreservation');
    
    if (state.caption.length > 0) {
      copyGate.className = 'gate-pill gate-pass';
      copyGate.innerHTML = '<span class="gate-icon">✓</span> Exact Copy Match';
    } else {
      copyGate.className = 'gate-pill gate-warn';
      copyGate.innerHTML = '<span class="gate-icon">!</span> Writable Copy';
    }

    presGate.className = 'gate-pill gate-pass';
    presGate.innerHTML = `<span class="gate-icon">✓</span> ${state.preservationLevel.toUpperCase()} Preservation`;
  }

  // Update Creation Brief & Prompt Inspector Modal
  function updateModalBrief() {
    const yamlBrief = `route: ${state.route}
surface: ${state.route}
image_source: ${state.imageLoaded ? 'supplied' : 'generated'}
image_role: edit-target
preservation: ${state.preservationLevel}
subject_or_scene: ${state.caption || 'Personal scene'}
exact_caption: "${state.caption}"
message: ""
location: "${state.location}"
date: "${state.date}"
orientation: ${state.aspectRatio.includes('2:3') || state.aspectRatio.includes('3:5') ? 'portrait' : 'landscape'}
style_recipe:
  layout: field-note-split
  paper: ${state.paperTone}
  typography: ${state.fontPairing}
  accent: "${state.accentColor}"
  texture: ${state.printTexture}`;

    document.getElementById('codeBrief').textContent = yamlBrief;

    const compiledPrompt = `Create a ${state.aspectRatio} ${state.route} postcard composition on warm ${state.paperTone} matte paper.
Place photo/image in the left ${Math.round(state.splitRatio * 100)}% of the canvas with a clean paper mat.
Include exact location "${state.location}", date "${state.date}", accent mark "${state.postalMark}", and exact caption "${state.caption}".
Preservation: ${state.preservationLevel}. Hard avoids: commercial advertising, CTA, fake logo, glossy mockup, 3D depth.`;

    document.getElementById('codePrompt').textContent = compiledPrompt;

    const altText = `Landscape ${state.paperTone} postcard featuring an image on the left, with location "${state.location}", date "${state.date}", and exact caption "${state.caption}".`;
    document.getElementById('codeAlt').textContent = altText;
  }

  function openModal() {
    document.getElementById('briefModal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('briefModal').classList.add('hidden');
  }

  // Export Canvas to PNG
  function exportPNG() {
    const link = document.createElement('a');
    link.download = `still-scenes-${state.route}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Initialize App on DOM Load
  document.addEventListener('DOMContentLoaded', init);

})();
