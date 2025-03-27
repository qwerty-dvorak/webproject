// Sound effect types
export type SfxType =
  | "jump"
  | "menuSelect"
  | "gameStart"
  | "gameOver"
  | "collect"
  | "hit"
  | "keyType";

// Interface for the SFX state
export interface SfxStateInterface {
  sfxVolume: number;
  isMuted: boolean;
}

// Helper to safely parse JSON from localStorage
const getStoredValue = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error("Error loading from localStorage:", e);
    return defaultValue;
  }
};

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

// 8-bit sound generation utilities
function createOscillator(
  type: OscillatorType,
  frequency: number,
  duration: number,
  volume: number = 0.2,
  attack: number = 0.01
): AudioNode | null {
  if (!audioContext) return null;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  // Set volume based on global SFX volume
  const actualVolume = volume * sfxState.current.sfxVolume;

  // Create ADSR envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    actualVolume,
    audioContext.currentTime + attack
  );
  gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);

  return gainNode;
}

// Generate different sound effects
function generateJumpSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // Mario-style jump sound with upward frequency sweep
  // Start with a higher pitch and faster rise
  const startFreq = 230;
  const endFreq = 500;

  // Main jump oscillator - square wave for 8-bit character
  const mainOsc = createOscillator("square", startFreq, 0.25, 0.15, 0.01);

  // Secondary oscillator for richer sound
  const secondaryOsc = createOscillator(
    "square",
    startFreq * 1.5,
    0.2,
    0.1,
    0.01
  );

  // Apply frequency sweep - this creates the classic Mario jump effect
  if (mainOsc && audioContext) {
    const mainOscillator = (mainOsc as any).context.createOscillator();
    mainOscillator.frequency.setValueAtTime(
      startFreq,
      audioContext.currentTime
    );
    mainOscillator.frequency.exponentialRampToValueAtTime(
      endFreq,
      audioContext.currentTime + 0.15
    );

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.25 * sfxState.current.sfxVolume,
      audioContext.currentTime + 0.05
    );
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);

    mainOscillator.type = "square";
    mainOscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    mainOscillator.start();
    mainOscillator.stop(audioContext.currentTime + 0.25);
  }

  if (secondaryOsc && audioContext) {
    const secondaryOscillator = (
      secondaryOsc as any
    ).context.createOscillator();
    secondaryOscillator.frequency.setValueAtTime(
      startFreq * 1.5,
      audioContext.currentTime
    );
    secondaryOscillator.frequency.exponentialRampToValueAtTime(
      endFreq * 1.5,
      audioContext.currentTime + 0.12
    );

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1 * sfxState.current.sfxVolume,
      audioContext.currentTime + 0.03
    );
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

    secondaryOscillator.type = "square";
    secondaryOscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    secondaryOscillator.start();
    secondaryOscillator.stop(audioContext.currentTime + 0.2);
  }
}

function generateMenuSelectSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // More interesting menu select sound - two-tone with echo effect
  const firstTone = createOscillator("square", 540, 0.08, 0.2);

  // Delayed second tone for "click" effect
  setTimeout(() => {
    if (!audioContext) return;
    const secondTone = createOscillator("square", 650, 0.08, 0.15);
    if (secondTone) secondTone.connect(audioContext.destination);
  }, 80);

  if (firstTone && audioContext) firstTone.connect(audioContext.destination);
}

function generateGameStartSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // Create an upbeat game start sequence with ascending notes
  const ctx = audioContext;
  const baseVolume = sfxState.current.sfxVolume;

  // Play a sequence of ascending notes
  const sequence = [330, 392, 494, 587];

  sequence.forEach((freq, index) => {
    setTimeout(() => {
      if (!ctx) return;

      // Main tone for each note
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;

      // Subtle harmony for richness
      const harmony = ctx.createOscillator();
      harmony.type = "square";
      harmony.frequency.value = freq * 1.5;

      // Volume envelope for main tone
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.2 * baseVolume,
        ctx.currentTime + 0.02
      );
      gainNode.gain.linearRampToValueAtTime(
        0.1 * baseVolume,
        ctx.currentTime + 0.08
      );
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

      // Volume envelope for harmony
      const harmonyGain = ctx.createGain();
      harmonyGain.gain.setValueAtTime(0, ctx.currentTime);
      harmonyGain.gain.linearRampToValueAtTime(
        0.08 * baseVolume,
        ctx.currentTime + 0.02
      );
      harmonyGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

      // Connect everything
      osc.connect(gainNode);
      harmony.connect(harmonyGain);
      gainNode.connect(ctx.destination);
      harmonyGain.connect(ctx.destination);

      // Start and stop the oscillators
      osc.start();
      harmony.start();
      osc.stop(ctx.currentTime + 0.1);
      harmony.stop(ctx.currentTime + 0.1);
    }, index * 100); // 100ms gap between notes
  });
}

function generateGameOverSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // Create a sad, descending game over sound
  const ctx = audioContext;
  const baseVolume = sfxState.current.sfxVolume;

  // Descending notes for sad effect
  const sequence = [392, 349, 330, 262];

  sequence.forEach((freq, index) => {
    setTimeout(() => {
      if (!ctx) return;

      // Main tone
      const osc = ctx.createOscillator();
      osc.type = "sawtooth"; // More melancholy tone
      osc.frequency.value = freq;

      // Minor chord component for sadness
      const minorOsc = ctx.createOscillator();
      minorOsc.type = "triangle";
      minorOsc.frequency.value = freq * 1.189; // Minor third

      // Volume envelopes with longer decay for somber feel
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.2 * baseVolume,
        ctx.currentTime + 0.05
      );
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

      const minorGain = ctx.createGain();
      minorGain.gain.setValueAtTime(0, ctx.currentTime);
      minorGain.gain.linearRampToValueAtTime(
        0.1 * baseVolume,
        ctx.currentTime + 0.05
      );
      minorGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

      // Connect and play
      osc.connect(gainNode);
      minorOsc.connect(minorGain);
      gainNode.connect(ctx.destination);
      minorGain.connect(ctx.destination);

      osc.start();
      minorOsc.start();
      osc.stop(ctx.currentTime + 0.4);
      minorOsc.stop(ctx.currentTime + 0.4);
    }, index * 200); // Slower timing for sadness
  });
}

function generateCollectSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  const osc1 = createOscillator("sine", 660, 0.1, 0.2);
  const osc2 = createOscillator("sine", 880, 0.1, 0.15);

  if (osc1 && audioContext) osc1.connect(audioContext.destination);
  if (osc2 && audioContext) osc2.connect(audioContext.destination);
}

function generateHitSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // Create a more impactful hit sound with a thud and noise burst
  const ctx = audioContext;

  // White noise burst
  const bufferSize = ctx.sampleRate * 0.1; // 100ms noise
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const outputData = noiseBuffer.getChannelData(0);

  // Fill with noise
  for (let i = 0; i < bufferSize; i++) {
    outputData[i] = Math.random() * 2 - 1;
  }

  // Noise player
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  // Impact tone - low frequency for "thud"
  const impactOsc = ctx.createOscillator();
  impactOsc.type = "sine";
  impactOsc.frequency.value = 110;

  // High-frequency impact component
  const crackOsc = ctx.createOscillator();
  crackOsc.type = "square";
  crackOsc.frequency.value = 440;

  // Gain nodes with envelopes
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, ctx.currentTime);
  noiseGain.gain.linearRampToValueAtTime(
    0.3 * sfxState.current.sfxVolume,
    ctx.currentTime + 0.005
  );
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  const impactGain = ctx.createGain();
  impactGain.gain.setValueAtTime(0, ctx.currentTime);
  impactGain.gain.linearRampToValueAtTime(
    0.4 * sfxState.current.sfxVolume,
    ctx.currentTime + 0.005
  );
  impactGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  const crackGain = ctx.createGain();
  crackGain.gain.setValueAtTime(0, ctx.currentTime);
  crackGain.gain.linearRampToValueAtTime(
    0.2 * sfxState.current.sfxVolume,
    ctx.currentTime + 0.001
  );
  crackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  // Connect everything
  noise.connect(noiseGain);
  impactOsc.connect(impactGain);
  crackOsc.connect(crackGain);

  noiseGain.connect(ctx.destination);
  impactGain.connect(ctx.destination);
  crackGain.connect(ctx.destination);

  // Play everything
  noise.start();
  impactOsc.start();
  crackOsc.start();

  noise.stop(ctx.currentTime + 0.1);
  impactOsc.stop(ctx.currentTime + 0.1);
  crackOsc.stop(ctx.currentTime + 0.03);
}

function generateKeyTypeSound(): void {
  if (sfxState.current.isMuted || !audioContext) return;

  // Soft key typing sound - gentle click
  const ctx = audioContext;
  const baseVolume = sfxState.current.sfxVolume * 0.3; // Lower volume for typing

  // Soft click oscillator
  const clickOsc = ctx.createOscillator();
  clickOsc.type = "sine";
  clickOsc.frequency.value = 800;

  // Secondary soft tone
  const secondOsc = ctx.createOscillator();
  secondOsc.type = "sine";
  secondOsc.frequency.value = 1200;

  // Very quick envelope for clicking sound
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0, ctx.currentTime);
  clickGain.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.005);
  clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  const secondGain = ctx.createGain();
  secondGain.gain.setValueAtTime(0, ctx.currentTime);
  secondGain.gain.linearRampToValueAtTime(
    baseVolume * 0.5,
    ctx.currentTime + 0.003
  );
  secondGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  // Connect everything
  clickOsc.connect(clickGain);
  secondOsc.connect(secondGain);
  clickGain.connect(ctx.destination);
  secondGain.connect(ctx.destination);

  // Play
  clickOsc.start();
  secondOsc.start();
  clickOsc.stop(ctx.currentTime + 0.05);
  secondOsc.stop(ctx.currentTime + 0.03);
}

// Global store for SFX state
export const sfxState = {
  // Current state with localStorage persistence
  current: {
    sfxVolume: getStoredValue<number>("pixel.sfxVolume", 0.7),
    isMuted: getStoredValue<boolean>("pixel.sfxMuted", false),
  } as SfxStateInterface,

  // Listeners
  listeners: [] as Array<(state: SfxStateInterface) => void>,

  // Initialize audio context
  initSfx: () => {
    try {
      // Initialize audio context on user interaction
      if (!audioContext) {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
    } catch (e) {
      console.error("Web Audio API not supported:", e);
    }
  },

  // Play a sound effect
  playSfx: (type: SfxType) => {
    if (!audioContext) {
      sfxState.initSfx();
    }

    switch (type) {
      case "jump":
        generateJumpSound();
        break;
      case "menuSelect":
        generateMenuSelectSound();
        break;
      case "gameStart":
        generateGameStartSound();
        break;
      case "gameOver":
        generateGameOverSound();
        break;
      case "collect":
        generateCollectSound();
        break;
      case "hit":
        generateHitSound();
        break;
      case "keyType":
        generateKeyTypeSound();
        break;
    }
  },

  // Set SFX volume
  setSfxVolume: (volume: number) => {
    sfxState.current.sfxVolume = volume;
    localStorage.setItem("pixel.sfxVolume", JSON.stringify(volume));
    sfxState.notifyListeners();
  },

  // Toggle mute for SFX
  toggleMute: () => {
    sfxState.current.isMuted = !sfxState.current.isMuted;
    localStorage.setItem(
      "pixel.sfxMuted",
      JSON.stringify(sfxState.current.isMuted)
    );
    sfxState.notifyListeners();
  },

  // Subscribe to state changes
  subscribe: (listener: (state: SfxStateInterface) => void) => {
    sfxState.listeners.push(listener);
    return () => {
      sfxState.listeners = sfxState.listeners.filter((l) => l !== listener);
    };
  },

  // Notify all listeners of state changes
  notifyListeners: () => {
    sfxState.listeners.forEach((listener) => listener(sfxState.current));
  },
};
