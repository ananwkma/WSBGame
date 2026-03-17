// soundEngine.ts — Web Audio API chiptune synthesis
// No imports. No dependencies. Lazy AudioContext creation (browser autoplay policy compliance).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.12): void {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // Silently ignore if audio context is suspended or fails
  }
}

// Market open: ascending C-E-G arpeggio (upbeat, excited)
export function playMarketOpen(): void {
  playTone(523, 0.12); // C5
  setTimeout(() => playTone(659, 0.12), 130); // E5
  setTimeout(() => playTone(784, 0.25), 260); // G5
}

// Market close: descending G-E-C arpeggio (closing, winding down)
export function playMarketClose(): void {
  playTone(784, 0.12); // G5
  setTimeout(() => playTone(659, 0.12), 130); // E5
  setTimeout(() => playTone(523, 0.25), 260); // C5
}

// Big gain: quick excited ascending tones
export function playBigGain(): void {
  playTone(880, 0.08);  // A5
  setTimeout(() => playTone(1047, 0.08), 90); // C6
  setTimeout(() => playTone(1319, 0.15), 180); // E6
}

// Big loss: descending low tones, minor feel
export function playBigLoss(): void {
  playTone(440, 0.10);  // A4
  setTimeout(() => playTone(370, 0.10), 110); // F#4
  setTimeout(() => playTone(294, 0.20), 220); // D4
}

// Borrow: low ominous single tone
export function playBorrow(): void {
  playTone(196, 0.30, 'sawtooth', 0.08); // G3 sawtooth — threatening
}

// Message notification: soft two-tone ding (sine wave, gentle)
export function playMessageDing(): void {
  playTone(1047, 0.08, 'sine', 0.07); // C6
  setTimeout(() => playTone(1319, 0.18, 'sine', 0.06), 90); // E6
}
