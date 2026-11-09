/**
 * Voice synthesis and sensory acoustic engine for Iris AI
 * Employs Web Speech API for sensual, elegant vocal delivery
 * and Web Audio API for harmonic cybernetic chimes.
 */

class IrisVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingState = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prioritize natural Spanish female voices
    const spanishVoices = voices.filter(
      (v) => v.lang.startsWith('es') || v.lang.startsWith('es-')
    );

    const preferredFemale = spanishVoices.find(
      (v) =>
        v.name.toLowerCase().includes('monica') ||
        v.name.toLowerCase().includes('paulina') ||
        v.name.toLowerCase().includes('helena') ||
        v.name.toLowerCase().includes('lucia') ||
        v.name.toLowerCase().includes('sabina') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('mujer')
    );

    this.selectedVoice = preferredFemale || spanishVoices[0] || voices[0] || null;
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    this.stop();

    // Clean markdown and symbols for clean spoken voice
    const cleanText = text
      .replace(/[*#`_~[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/Carlos Smith Zambrano Gonzalez/gi, 'Carlos Smith')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = this.selectedVoice;
    utterance.lang = this.selectedVoice?.lang || 'es-ES';
    // Sensual, warm, relaxed vocal cadence
    utterance.pitch = 0.98;
    utterance.rate = 0.95;

    utterance.onstart = () => {
      this.isSpeakingState = true;
      onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingState = false;
      onError?.(e);
      onEnd?.();
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState || (this.synth?.speaking ?? false);
  }

  // Harmonic chord chime when neural action or stock movement succeeds
  public playHarmonicChime(type: 'spark' | 'stock' | 'encrypt' = 'spark') {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'spark') {
        // Soft sensual etheric glide (F#5 -> A#5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(739.99, now);
        osc.frequency.exponentialRampToValueAtTime(932.33, now + 0.35);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'stock') {
        // Warm double pulse
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        // Crystalline encryption lock
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const irisVoice = new IrisVoiceEngine();
