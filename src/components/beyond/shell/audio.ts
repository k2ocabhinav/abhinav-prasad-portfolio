type RoomSound = "paper" | "thud";

let context: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return null;
  }

  if (!context || context.state === "closed") {
    context = new window.AudioContext();
  }

  if (context.state === "suspended") {
    void context.resume().catch(() => undefined);
  }

  return context;
}

function getNoiseBuffer(audioContext: AudioContext): AudioBuffer {
  if (noiseBuffer) {
    return noiseBuffer;
  }

  const length = Math.ceil(audioContext.sampleRate * 0.12);
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * (1 - index / length);
  }

  noiseBuffer = buffer;
  return buffer;
}

export function playRoomSound(sound: RoomSound): void {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return;
  }

  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0.0001, now);

  if (sound === "paper") {
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    source.buffer = getNoiseBuffer(audioContext);
    filter.type = "highpass";
    filter.frequency.setValueAtTime(720, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    source.connect(filter);
    filter.connect(gain);
    source.start(now);
    source.stop(now + 0.125);
    return;
  }

  const oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(112, now);
  oscillator.frequency.exponentialRampToValueAtTime(54, now + 0.13);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
  oscillator.connect(gain);
  oscillator.start(now);
  oscillator.stop(now + 0.145);
}
