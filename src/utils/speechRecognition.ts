// Types for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechOptions {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  /** Fires the instant microphone detects sound — before a result is ready */
  onSpeechStart?: () => void;
}

export class VoiceRecognition {
  private recognition: any | null = null;
  public isListening = false;

  constructor(options: SpeechOptions) {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    // Set to Kenyan English (en-KE) to better recognize African English accents. 
    this.recognition.lang = "en-KE";

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    // Fires as soon as sound is detected — before a word is recognised
    this.recognition.onspeechstart = () => {
      if (options.onSpeechStart) {
        options.onSpeechStart();
      }
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      options.onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (options.onError) {
        options.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) {
        options.onEnd();
      }
    };
  }

  start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }
}
