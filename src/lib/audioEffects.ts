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

  // Create oscillators for the missile sound
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const oscillator3 = audioContext.createOscillator();
  
  // Create gain nodes for volume control
  const gainNode = audioContext.createGain();
  const masterGain = audioContext.createGain();
  
  // Configure oscillators for cyber/electronic missile sound
  oscillator1.type = 'sawtooth';
  oscillator2.type = 'square';
  oscillator3.type = 'sine';
  
  // Frequency sweep for missile launch effect
  oscillator1.frequency.setValueAtTime(800, currentTime);
  oscillator1.frequency.exponentialRampToValueAtTime(200, currentTime + 0.3);
  oscillator1.frequency.exponentialRampToValueAtTime(100, currentTime + 0.8);
  
  oscillator2.frequency.setValueAtTime(400, currentTime);
  oscillator2.frequency.exponentialRampToValueAtTime(100, currentTime + 0.3);
  oscillator2.frequency.exponentialRampToValueAtTime(50, currentTime + 0.8);
  
  oscillator3.frequency.setValueAtTime(1200, currentTime);
  oscillator3.frequency.exponentialRampToValueAtTime(300, currentTime + 0.4);
  
  // Volume envelope for dramatic effect
  gainNode.gain.setValueAtTime(0, currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.8);
  
  masterGain.gain.setValueAtTime(0.4, currentTime);
  
  // Connect audio nodes
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  oscillator3.connect(gainNode);
  gainNode.connect(masterGain);
  masterGain.connect(audioContext.destination);
  
  // Start and stop oscillators
  oscillator1.start(currentTime);
  oscillator2.start(currentTime);
  oscillator3.start(currentTime);
  
  oscillator1.stop(currentTime + 0.8);
  oscillator2.stop(currentTime + 0.8);
  oscillator3.stop(currentTime + 0.8);
  
  // Add white noise for missile "whoosh" effect
  const bufferSize = audioContext.sampleRate * 0.8;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  
  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(2000, currentTime);
  
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, currentTime);
  noiseGain.gain.linearRampToValueAtTime(0.15, currentTime + 0.05);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
  
  whiteNoise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  
  whiteNoise.start(currentTime);
  whiteNoise.stop(currentTime + 0.6);
};
