/**
 * Accessibility Web Speech Synthesis Service
 * Provides screen-reader / read-aloud functionality with play, pause, resume, stop, and rate controls.
 */

export interface SpeechStatus {
  isSpeaking: boolean;
  isPaused: boolean;
  supported: boolean;
  currentText: string | null;
  rate: number;
}

class SpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private listeners: ((status: SpeechStatus) => void)[] = [];
  private rate: number = 1.0;
  private currentText: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public subscribe(listener: (status: SpeechStatus) => void): () => void {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach((l) => l(status));
  }

  public getStatus(): SpeechStatus {
    const supported = this.isSupported();
    if (!supported) {
      return {
        isSpeaking: false,
        isPaused: false,
        supported: false,
        currentText: null,
        rate: this.rate,
      };
    }

    return {
      isSpeaking: window.speechSynthesis.speaking && !window.speechSynthesis.paused,
      isPaused: window.speechSynthesis.paused,
      supported: true,
      currentText: this.currentText,
      rate: this.rate,
    };
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.7, Math.min(2.0, newRate));
    if (this.utterance && window.speechSynthesis.speaking) {
      // Restart with new rate
      const text = this.currentText;
      this.stop();
      if (text) this.speak(text);
    } else {
      this.notify();
    }
  }

  public speak(text: string, language: string = 'en') {
    if (!this.isSupported()) return;

    this.stop();
    this.currentText = text;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (language === 'hi') {
      const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.includes('Hindi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      this.notify();
    };

    utterance.onpause = () => {
      this.notify();
    };

    utterance.onresume = () => {
      this.notify();
    };

    utterance.onend = () => {
      this.currentText = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentText = null;
      this.notify();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.notify();
  }

  public pause() {
    if (!this.isSupported()) return;
    window.speechSynthesis.pause();
    this.notify();
  }

  public resume() {
    if (!this.isSupported()) return;
    window.speechSynthesis.resume();
    this.notify();
  }

  public stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.currentText = null;
    this.notify();
  }
}

export const speechService = new SpeechService();
