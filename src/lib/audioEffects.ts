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
