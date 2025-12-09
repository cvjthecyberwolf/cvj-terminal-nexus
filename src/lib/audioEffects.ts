// Sharp cyberpunk startup sound effect - loud and surprising
export const playCyberpunkStartupSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  
  // Master gain for overall volume control - LOUD
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.8, currentTime);
  masterGain.connect(audioContext.destination);

  // === INITIAL SHARP ATTACK - The "surprise" element ===
  const attackOsc = audioContext.createOscillator();
  const attackGain = audioContext.createGain();
  attackOsc.type = 'square';
  attackOsc.frequency.setValueAtTime(2000, currentTime);
  attackOsc.frequency.exponentialRampToValueAtTime(100, currentTime + 0.1);
  attackGain.gain.setValueAtTime(0.9, currentTime);
  attackGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
  attackOsc.connect(attackGain);
  attackGain.connect(masterGain);
  attackOsc.start(currentTime);
  attackOsc.stop(currentTime + 0.15);

  // === BASS DROP - Heavy cyberpunk bass ===
  const bassOsc = audioContext.createOscillator();
  const bassGain = audioContext.createGain();
  bassOsc.type = 'sawtooth';
  bassOsc.frequency.setValueAtTime(80, currentTime + 0.05);
  bassOsc.frequency.exponentialRampToValueAtTime(40, currentTime + 0.5);
  bassGain.gain.setValueAtTime(0, currentTime);
  bassGain.gain.linearRampToValueAtTime(0.7, currentTime + 0.08);
  bassGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
  bassOsc.connect(bassGain);
  bassGain.connect(masterGain);
  bassOsc.start(currentTime);
  bassOsc.stop(currentTime + 0.6);

  // === GLITCH EFFECT - Rapid frequency modulation ===
  for (let i = 0; i < 5; i++) {
    const glitchOsc = audioContext.createOscillator();
    const glitchGain = audioContext.createGain();
    const startTime = currentTime + 0.1 + (i * 0.04);
    
    glitchOsc.type = 'square';
    glitchOsc.frequency.setValueAtTime(800 + Math.random() * 1200, startTime);
    glitchGain.gain.setValueAtTime(0.3, startTime);
    glitchGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);
    
    glitchOsc.connect(glitchGain);
    glitchGain.connect(masterGain);
    glitchOsc.start(startTime);
    glitchOsc.stop(startTime + 0.03);
  }

  // === POWER-UP SWEEP - Rising synth ===
  const sweepOsc = audioContext.createOscillator();
  const sweepGain = audioContext.createGain();
  sweepOsc.type = 'sawtooth';
  sweepOsc.frequency.setValueAtTime(200, currentTime + 0.2);
  sweepOsc.frequency.exponentialRampToValueAtTime(1500, currentTime + 0.5);
  sweepOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.7);
  sweepGain.gain.setValueAtTime(0, currentTime + 0.2);
  sweepGain.gain.linearRampToValueAtTime(0.4, currentTime + 0.35);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.7);
  sweepOsc.connect(sweepGain);
  sweepGain.connect(masterGain);
  sweepOsc.start(currentTime + 0.2);
  sweepOsc.stop(currentTime + 0.7);

  // === DIGITAL NOISE BURST ===
  const noiseLength = 0.3;
  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * noiseLength, audioContext.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
  }
  
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3000, currentTime);
  noiseFilter.Q.setValueAtTime(2, currentTime);
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0.5, currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);
  
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSource.start(currentTime);

  // === FINAL IMPACT - Dramatic ending ===
  const impactOsc = audioContext.createOscillator();
  const impactGain = audioContext.createGain();
  impactOsc.type = 'sine';
  impactOsc.frequency.setValueAtTime(60, currentTime + 0.5);
  impactOsc.frequency.exponentialRampToValueAtTime(30, currentTime + 0.8);
  impactGain.gain.setValueAtTime(0.8, currentTime + 0.5);
  impactGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.9);
  impactOsc.connect(impactGain);
  impactGain.connect(masterGain);
  impactOsc.start(currentTime + 0.5);
  impactOsc.stop(currentTime + 0.9);
};

// Cyber missile launch sound effect using Web Audio API
export const playCyberMissileSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;

  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const oscillator3 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const masterGain = audioContext.createGain();

  oscillator1.type = 'sawtooth';
  oscillator2.type = 'square';
  oscillator3.type = 'sine';

  oscillator1.frequency.setValueAtTime(800, currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(200, currentTime + 0.3);
  oscillator1.frequency.exponentialRampToValueAtTime(100, currentTime + 0.8);

  oscillator2.frequency.setValueAtTime(400, currentTime);
  oscillator2.frequency.exponentialRampToValueAtTime(100, currentTime + 0.3);
  oscillator2.frequency.exponentialRampToValueAtTime(50, currentTime + 0.8);

  oscillator3.frequency.setValueAtTime(1200, currentTime);
  oscillator3.frequency.exponentialRampToValueAtTime(300, currentTime + 0.4);

  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.8);

  masterGain.gain.setValueAtTime(0.4, currentTime);

  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  oscillator3.connect(gainNode);
  gainNode.connect(masterGain);
  masterGain.connect(audioContext.destination);

  oscillator1.start(currentTime);
  oscillator2.start(currentTime);
  oscillator3.start(currentTime);

  oscillator1.stop(currentTime + 0.8);
  oscillator2.stop(currentTime + 0.8);
  oscillator3.stop(currentTime + 0.8);
};

// Terminal window open sound - classic CRT power-on with digital glitch
export const playTerminalSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.6, currentTime);
  masterGain.connect(audioContext.destination);

  // CRT power-on buzz
  const buzzOsc = audioContext.createOscillator();
  const buzzGain = audioContext.createGain();
  buzzOsc.type = 'sawtooth';
  buzzOsc.frequency.setValueAtTime(60, currentTime);
  buzzGain.gain.setValueAtTime(0.4, currentTime);
  buzzGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
  buzzOsc.connect(buzzGain);
  buzzGain.connect(masterGain);
  buzzOsc.start(currentTime);
  buzzOsc.stop(currentTime + 0.15);

  // Digital beep sequence
  for (let i = 0; i < 3; i++) {
    const beepOsc = audioContext.createOscillator();
    const beepGain = audioContext.createGain();
    const startTime = currentTime + 0.1 + (i * 0.05);
    beepOsc.type = 'square';
    beepOsc.frequency.setValueAtTime(800 + (i * 200), startTime);
    beepGain.gain.setValueAtTime(0.3, startTime);
    beepGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);
    beepOsc.connect(beepGain);
    beepGain.connect(masterGain);
    beepOsc.start(startTime);
    beepOsc.stop(startTime + 0.04);
  }
};

// Browser window sound - network connection whoosh
export const playBrowserSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, currentTime);
  masterGain.connect(audioContext.destination);

  // Rising sweep
  const sweepOsc = audioContext.createOscillator();
  const sweepGain = audioContext.createGain();
  sweepOsc.type = 'sine';
  sweepOsc.frequency.setValueAtTime(200, currentTime);
  sweepOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.2);
  sweepGain.gain.setValueAtTime(0.4, currentTime);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
  sweepOsc.connect(sweepGain);
  sweepGain.connect(masterGain);
  sweepOsc.start(currentTime);
  sweepOsc.stop(currentTime + 0.3);

  // Confirmation click
  const clickOsc = audioContext.createOscillator();
  const clickGain = audioContext.createGain();
  clickOsc.type = 'sine';
  clickOsc.frequency.setValueAtTime(600, currentTime + 0.25);
  clickGain.gain.setValueAtTime(0.3, currentTime + 0.25);
  clickGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
  clickOsc.connect(clickGain);
  clickGain.connect(masterGain);
  clickOsc.start(currentTime + 0.25);
  clickOsc.stop(currentTime + 0.35);
};

// Package Manager sound - mechanical installation
export const playPackageManagerSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, currentTime);
  masterGain.connect(audioContext.destination);

  // Mechanical clicks
  for (let i = 0; i < 4; i++) {
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();
    const startTime = currentTime + (i * 0.08);
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(150, startTime);
    clickGain.gain.setValueAtTime(0.4, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);
    clickOsc.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.03);
  }

  // Confirmation chime
  const chimeOsc = audioContext.createOscillator();
  const chimeGain = audioContext.createGain();
  chimeOsc.type = 'triangle';
  chimeOsc.frequency.setValueAtTime(440, currentTime + 0.35);
  chimeGain.gain.setValueAtTime(0.3, currentTime + 0.35);
  chimeGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.55);
  chimeOsc.connect(chimeGain);
  chimeGain.connect(masterGain);
  chimeOsc.start(currentTime + 0.35);
  chimeOsc.stop(currentTime + 0.55);
};

// Network Tools sound - radar ping
export const playNetworkToolsSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.6, currentTime);
  masterGain.connect(audioContext.destination);

  // Radar ping
  const pingOsc = audioContext.createOscillator();
  const pingGain = audioContext.createGain();
  pingOsc.type = 'sine';
  pingOsc.frequency.setValueAtTime(1800, currentTime);
  pingOsc.frequency.exponentialRampToValueAtTime(900, currentTime + 0.15);
  pingGain.gain.setValueAtTime(0.5, currentTime);
  pingGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
  pingOsc.connect(pingGain);
  pingGain.connect(masterGain);
  pingOsc.start(currentTime);
  pingOsc.stop(currentTime + 0.4);

  // Echo effect
  const echoOsc = audioContext.createOscillator();
  const echoGain = audioContext.createGain();
  echoOsc.type = 'sine';
  echoOsc.frequency.setValueAtTime(900, currentTime + 0.2);
  echoGain.gain.setValueAtTime(0.2, currentTime + 0.2);
  echoGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
  echoOsc.connect(echoGain);
  echoGain.connect(masterGain);
  echoOsc.start(currentTime + 0.2);
  echoOsc.stop(currentTime + 0.5);
};

// Security Tools sound - alert/warning tone
export const playSecurityToolsSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, currentTime);
  masterGain.connect(audioContext.destination);

  // Warning oscillation
  const warnOsc = audioContext.createOscillator();
  const warnGain = audioContext.createGain();
  warnOsc.type = 'square';
  warnOsc.frequency.setValueAtTime(440, currentTime);
  warnOsc.frequency.setValueAtTime(660, currentTime + 0.1);
  warnOsc.frequency.setValueAtTime(440, currentTime + 0.2);
  warnGain.gain.setValueAtTime(0.4, currentTime);
  warnGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
  warnOsc.connect(warnGain);
  warnGain.connect(masterGain);
  warnOsc.start(currentTime);
  warnOsc.stop(currentTime + 0.35);

  // Lock click
  const lockOsc = audioContext.createOscillator();
  const lockGain = audioContext.createGain();
  lockOsc.type = 'sine';
  lockOsc.frequency.setValueAtTime(1200, currentTime + 0.3);
  lockGain.gain.setValueAtTime(0.3, currentTime + 0.3);
  lockGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
  lockOsc.connect(lockGain);
  lockGain.connect(masterGain);
  lockOsc.start(currentTime + 0.3);
  lockOsc.stop(currentTime + 0.4);
};

// Bot Manager sound - robotic initialization
export const playBotManagerSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, currentTime);
  masterGain.connect(audioContext.destination);

  // Robot startup sequence
  for (let i = 0; i < 5; i++) {
    const robotOsc = audioContext.createOscillator();
    const robotGain = audioContext.createGain();
    const startTime = currentTime + (i * 0.06);
    robotOsc.type = 'sawtooth';
    robotOsc.frequency.setValueAtTime(100 + (i * 100), startTime);
    robotGain.gain.setValueAtTime(0.3, startTime);
    robotGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.04);
    robotOsc.connect(robotGain);
    robotGain.connect(masterGain);
    robotOsc.start(startTime);
    robotOsc.stop(startTime + 0.04);
  }

  // Power-up confirmation
  const powerOsc = audioContext.createOscillator();
  const powerGain = audioContext.createGain();
  powerOsc.type = 'sine';
  powerOsc.frequency.setValueAtTime(300, currentTime + 0.35);
  powerOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.5);
  powerGain.gain.setValueAtTime(0.4, currentTime + 0.35);
  powerGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.55);
  powerOsc.connect(powerGain);
  powerGain.connect(masterGain);
  powerOsc.start(currentTime + 0.35);
  powerOsc.stop(currentTime + 0.55);
};

// Virtual Machine sound - heavy machinery boot
export const playVirtualMachineSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.6, currentTime);
  masterGain.connect(audioContext.destination);

  // Hard drive spin-up
  const spinOsc = audioContext.createOscillator();
  const spinGain = audioContext.createGain();
  spinOsc.type = 'sawtooth';
  spinOsc.frequency.setValueAtTime(30, currentTime);
  spinOsc.frequency.exponentialRampToValueAtTime(200, currentTime + 0.4);
  spinGain.gain.setValueAtTime(0.5, currentTime);
  spinGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.4);
  spinOsc.connect(spinGain);
  spinGain.connect(masterGain);
  spinOsc.start(currentTime);
  spinOsc.stop(currentTime + 0.5);

  // Boot beep
  const bootOsc = audioContext.createOscillator();
  const bootGain = audioContext.createGain();
  bootOsc.type = 'square';
  bootOsc.frequency.setValueAtTime(800, currentTime + 0.45);
  bootGain.gain.setValueAtTime(0.4, currentTime + 0.45);
  bootGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.55);
  bootOsc.connect(bootGain);
  bootGain.connect(masterGain);
  bootOsc.start(currentTime + 0.45);
  bootOsc.stop(currentTime + 0.55);
};

// OS Launcher sound - system activation
export const playOSLauncherSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.6, currentTime);
  masterGain.connect(audioContext.destination);

  // Orchestral power chord
  const frequencies = [261.63, 329.63, 392]; // C, E, G chord
  frequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, currentTime + (i * 0.03));
    gain.gain.setValueAtTime(0.3, currentTime + (i * 0.03));
    gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(currentTime + (i * 0.03));
    osc.stop(currentTime + 0.5);
  });

  // Sweep effect
  const sweepOsc = audioContext.createOscillator();
  const sweepGain = audioContext.createGain();
  sweepOsc.type = 'sine';
  sweepOsc.frequency.setValueAtTime(200, currentTime);
  sweepOsc.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.3);
  sweepGain.gain.setValueAtTime(0.2, currentTime);
  sweepGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
  sweepOsc.connect(sweepGain);
  sweepGain.connect(masterGain);
  sweepOsc.start(currentTime);
  sweepOsc.stop(currentTime + 0.35);
};

// Cyber Jungle sound - AI/magical sparkle
export const playCyberJungleSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;
  const masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, currentTime);
  masterGain.connect(audioContext.destination);

  // Sparkle arpeggios
  const sparkleNotes = [523.25, 659.25, 783.99, 1046.50, 783.99]; // C5, E5, G5, C6, G5
  sparkleNotes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = currentTime + (i * 0.05);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.35, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  });

  // AI hum
  const humOsc = audioContext.createOscillator();
  const humGain = audioContext.createGain();
  humOsc.type = 'triangle';
  humOsc.frequency.setValueAtTime(220, currentTime);
  humGain.gain.setValueAtTime(0.2, currentTime);
  humGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.4);
  humOsc.connect(humGain);
  humGain.connect(masterGain);
  humOsc.start(currentTime);
  humOsc.stop(currentTime + 0.4);
};

// Generic window sound for fallback
export const playGenericWindowSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const currentTime = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, currentTime);
  gain.gain.setValueAtTime(0.3, currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(currentTime);
  osc.stop(currentTime + 0.15);
};

// Map window types to their sounds
export const windowSounds: Record<string, () => void> = {
  terminal: playTerminalSound,
  browser: playBrowserSound,
  packageManager: playPackageManagerSound,
  networkTools: playNetworkToolsSound,
  securityTools: playSecurityToolsSound,
  botManager: playBotManagerSound,
  virtualMachine: playVirtualMachineSound,
  realVirtualMachine: playVirtualMachineSound,
  osLauncher: playOSLauncherSound,
  cyberJungle: playCyberJungleSound,
};
