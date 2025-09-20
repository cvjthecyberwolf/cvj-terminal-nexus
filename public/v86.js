// This file loads the v86 WebAssembly emulator
// v86 is a x86 virtualization library written in JavaScript
// It provides real hardware emulation in the browser

// Load v86 from CDN
(function() {
  if (typeof window !== 'undefined' && !window.v86LoadAttempted) {
    window.v86LoadAttempted = true;
    
    // Try to load v86 from official CDN
    const script = document.createElement('script');
    script.src = 'https://copy.sh/v86/v86.js';
    script.async = true;
    script.onload = function() {
      console.log('✅ v86 emulator loaded successfully');
      window.v86Available = true;
    };
    script.onerror = function() {
      console.warn('⚠️ Failed to load v86 from CDN, using fallback');
      window.v86Available = false;
    };
    
    document.head.appendChild(script);
  }
})();