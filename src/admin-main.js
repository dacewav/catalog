// ═══ DACEWAV.STORE — Admin Entry Point (v5.2) ═══
// This bundle replaces the inline <script> in admin.html

// Import config & constants
import './admin/config.js';

// Import core (helpers, undo, auto-save, preview, theme, presets, particles, etc.)
import './admin/helpers.js';
import './admin/core.js';

// Import feature modules (each assigns to window)
import './admin/colors.js';
import './admin/fonts.js';
import './admin/nav.js';
import './admin/qr.js';
import './admin/cmd-palette.js';
import './admin/resize.js';
import './admin/beat-preview.js';
import './admin/beats.js';
import './admin/card-global.js';
import './admin/r2.js';
import './admin/features.js';

// Import auth & firebase init (bootstraps everything)
import './admin/firebase-init.js';

console.log('[DACE Admin] v5.2 bundle loaded');
