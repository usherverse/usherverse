let _paused = false;
let _onEndCallback: (() => void) | null = null;
let _keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let _isSpeaking = false;

/** Whether Jenny is currently speaking (safe to check from outside) */
export const isJennySpeaking = () => _isSpeaking;

const clearKeepAlive = () => {
  if (_keepAliveTimer !== null) {
    clearInterval(_keepAliveTimer);
    _keepAliveTimer = null;
  }
};

/**
 * Chrome has a bug where speechSynthesis silently stops after ~15s.
 * We fix it by pausing + resuming every 10s to reset the internal timer.
 */
const startKeepAlive = () => {
  clearKeepAlive();
  _keepAliveTimer = setInterval(() => {
    if (
      typeof window !== "undefined" &&
      window.speechSynthesis.speaking &&
      !window.speechSynthesis.paused &&
      !_paused
    ) {
      window.speechSynthesis.pause();
      requestAnimationFrame(() => window.speechSynthesis.resume());
    }
  }, 10000);
};

export const speakFriday = (text: string, onEnd?: () => void) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Cancel any ongoing speech so they don't queue up endlessly
  window.speechSynthesis.cancel();
  clearKeepAlive();
  _paused = false;
  _isSpeaking = false;
  _onEndCallback = onEnd ?? null;

  const utterance = new SpeechSynthesisUtterance(text);

  // Store utterance globally to prevent garbage collection before onend fires
  (window as any)._currentUtterance = utterance;

  utterance.onstart = () => {
    _isSpeaking = true;
    startKeepAlive();
  };

  utterance.onend = () => {
    _isSpeaking = false;
    clearKeepAlive();
    // Only fire the callback if we weren't paused mid-utterance by the user
    if (!_paused) {
      const cb = _onEndCallback;
      _onEndCallback = null;
      cb?.();
    }
  };

  utterance.onerror = (e) => {
    _isSpeaking = false;
    clearKeepAlive();
    // "interrupted" means we intentionally stopped (cancel / pause) — don't fire onEnd
    // Other errors (synthesis-failed etc.) also should not trigger start-listening
    if ((e as any).error === "interrupted" || _paused) return;
    // For non-interruption errors, clear the callback but don't start listening
    _onEndCallback = null;
  };

  // Try to find a suitable female voice for Jenny
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      // Best Windows/Edge Network Voices
      voices.find((v) => v.name.includes("Natural") && (v.name.includes("Female") || v.name.includes("Aria") || v.name.includes("Jenny") || v.name.includes("Sonia"))) ||
      voices.find((v) => v.name.includes("Online") && v.name.includes("Female")) ||
      // High-Quality Network Voices (Chrome Android)
      voices.find((v) => v.name.includes("Google") && v.name.includes("Female") && v.localService === false) ||
      voices.find((v) => !v.localService && v.lang.startsWith("en") && v.name.includes("Female")) ||
      // Standard Google Female Voices
      voices.find((v) => v.name.includes("Google UK English Female") || v.name.includes("Google US English Female")) ||
      // Apple/macOS
      voices.find((v) => v.name.includes("Samantha")) || 
      // Windows Offline Fallback
      voices.find((v) => v.name.includes("Zira")) ||     
      // Generic Fallbacks
      voices.find((v) => v.name.includes("Female") && v.lang.startsWith("en")) ||
      voices.find((v) => v.lang.startsWith("en") && !v.localService) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 1.05;

    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }
};

/** Call when the user starts speaking — pauses Jenny mid-sentence */
export const pauseJenny = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    _paused = true;
    clearKeepAlive();
    window.speechSynthesis.pause();
  }
};

/** Call when the user has finished speaking — resumes Jenny */
export const resumeJenny = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (window.speechSynthesis.paused) {
    _paused = false;
    startKeepAlive();
    window.speechSynthesis.resume();
  }
};

export const stopFriday = () => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    _paused = false;
    _isSpeaking = false;
    clearKeepAlive();
    _onEndCallback = null;
    window.speechSynthesis.cancel();
  }
};
