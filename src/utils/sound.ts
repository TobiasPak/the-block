export function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Autoplay blocked or AudioContext unavailable — silent fail
  }
}

export function playNotificationSound(kind: 'outbid' | 'won' | 'urgent' | 'info') {
  switch (kind) {
    case 'outbid': playTone(220, 0.3, 'square'); break;
    case 'won':    playTone(523, 0.5, 'sine');   break;
    case 'urgent': playTone(440, 0.2, 'sine');   break;
    case 'info':   playTone(880, 0.15, 'sine');  break;
  }
}
