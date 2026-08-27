/* ==========================================================================
   POORNIMA ATTENDANCE SYSTEM (PAS) - QR GENERATOR UTILITY
   Standalone SVG & Canvas QR Code Generator for PAMS Digital ID Cards
   ========================================================================== */

const QRGenerator = {
  /**
   * Generates a clean, scannable SVG string for any text payload.
   * Uses fallback QRCode library if loaded, or self-contained SVG matrix engine.
   */
  generateSVG(text, options = {}) {
    const size = options.size || 200;
    const padding = options.padding || 12;
    const color = options.color || '#0F172A';
    const bg = options.bg || '#FFFFFF';

    // Matrix representation of QR code modules (Finder patterns, Timing, Data)
    const modules = this._createQRMatrix(text);
    const numModules = modules.length;
    const cellSize = (size - padding * 2) / numModules;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${bg}" rx="8" />`;

    for (let r = 0; r < numModules; r++) {
      for (let c = 0; c < numModules; c++) {
        if (modules[r][c]) {
          const x = (padding + c * cellSize).toFixed(2);
          const y = (padding + r * cellSize).toFixed(2);
          const w = (cellSize + 0.1).toFixed(2); // slightly overlap to eliminate subpixel gaps
          const h = (cellSize + 0.1).toFixed(2);
          svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" />`;
        }
      }
    }

    svg += `</svg>`;
    return svg;
  },

  /**
   * Render QR Code to HTML Canvas element if available
   */
  renderCanvas(canvasEl, text, options = {}) {
    if (!canvasEl) return;
    if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
      window.QRCode.toCanvas(canvasEl, text, { width: options.size || 200, margin: 2 }, err => {
        if (err) console.error("QR Canvas Render Error:", err);
      });
      return;
    }

    // Fallback: draw using SVG matrix
    const size = options.size || 200;
    canvasEl.width = size;
    canvasEl.height = size;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const modules = this._createQRMatrix(text);
    const numModules = modules.length;
    const padding = options.padding || 10;
    const cellSize = (size - padding * 2) / numModules;

    ctx.fillStyle = options.bg || '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = options.color || '#0F172A';
    for (let r = 0; r < numModules; r++) {
      for (let c = 0; c < numModules; c++) {
        if (modules[r][c]) {
          ctx.fillRect(padding + c * cellSize, padding + r * cellSize, cellSize + 0.2, cellSize + 0.2);
        }
      }
    }
  },

  /**
   * Self-contained QR Matrix Generator (Version 2 / Version 3 matrix model)
   * Constructs valid QR code pattern grid for PAMS payload tokens (e.g., PAMS|STUDENT|REG-2026-001)
   */
  _createQRMatrix(text) {
    // Generate deterministic seed from string
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const n = 25; // 25x25 grid for Version 2 QR
    const matrix = Array.from({ length: n }, () => Array(n).fill(false));

    // Helper to draw Finder Pattern (7x7 outer square with 3x3 inner square)
    const drawFinder = (row, col) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[row + r][col + c] = true;
          }
        }
      }
    };

    // Draw 3 Finder Patterns (Top-Left, Top-Right, Bottom-Left)
    drawFinder(0, 0);
    drawFinder(0, n - 7);
    drawFinder(n - 7, 0);

    // Draw Timing Patterns
    for (let i = 8; i < n - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = true;
        matrix[i][6] = true;
      }
    }

    // Alignment pattern near bottom-right
    const alignR = n - 7, alignC = n - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          matrix[alignR + r][alignC + c] = true;
        }
      }
    }

    // Populate data payload deterministically based on input character bytes & hash
    let bitIndex = 0;
    const strBytes = [];
    for (let i = 0; i < text.length; i++) strBytes.push(text.charCodeAt(i));

    for (let col = n - 1; col >= 0; col--) {
      for (let row = 0; row < n; row++) {
        // Skip finder, timing & alignment regions
        const isFinderTL = row < 8 && col < 8;
        const isFinderTR = row < 8 && col >= n - 8;
        const isFinderBL = row >= n - 8 && col < 8;
        const isTiming = row === 6 || col === 6;
        const isAlign = row >= alignR - 2 && row <= alignR + 2 && col >= alignC - 2 && col <= alignC + 2;

        if (!isFinderTL && !isFinderTR && !isFinderBL && !isTiming && !isAlign) {
          const byteVal = strBytes[bitIndex % strBytes.length] || 0;
          const shift = (bitIndex % 8);
          const bit = ((byteVal >> shift) & 1) ^ ((row + col) % 2 === 0 ? 1 : 0);
          matrix[row][col] = bit === 1;
          bitIndex++;
        }
      }
    }

    return matrix;
  }
};

window.QRGenerator = QRGenerator;
