/**
 * Web Speech API utilities for pronunciation and dictation
 */

export interface SpeechOptions {
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  language?: string; // e.g., 'en-US', 'zh-CN'
}

/**
 * Speak text using Web Speech API
 */
export function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Ensure rate is within valid range (0.1 to 10, default 1)
    const rate = Math.max(0.1, Math.min(10, options.rate || 1));
    utterance.rate = rate;
    utterance.pitch = Math.max(0, Math.min(2, options.pitch || 1));
    utterance.volume = Math.max(0, Math.min(1, options.volume || 1));
    utterance.lang = options.language || 'en-US';

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech error: ${event.error}`));

    synth.speak(utterance);
  });
}

/**
 * Stop ongoing speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

/**
 * Check if speech synthesis is available
 */
export function isSpeechSynthesisAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Get available voices
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

/**
 * Start speech recognition (dictation)
 */
export function startDictation(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  language: string = 'en-US'
): () => void {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech Recognition not supported in this browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.language = language;

  recognition.onstart = () => {
    // Recognition started
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event: any) => {
    onError(`Dictation error: ${event.error}`);
  };

  recognition.onend = () => {
    // Recognition ended
  };

  recognition.start();

  // Return function to stop recognition
  return () => {
    recognition.stop();
  };
}

/**
 * Check if speech recognition is available
 */
export function isSpeechRecognitionAvailable(): boolean {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

/**
 * Play audio from URL
 */
export function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Failed to play audio'));
    
    audio.play().catch(reject);
  });
}

/**
 * Generate speech and return audio blob
 */
export async function generateSpeechBlob(text: string, options: SpeechOptions = {}): Promise<Blob> {
  const synth = window.speechSynthesis;
  
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.language || 'en-US';

    // Note: Web Speech API doesn't directly provide blob output
    // This is a limitation - we'll use the speak function instead
    // For actual audio recording, we'd need MediaRecorder API
    reject(new Error('Direct blob generation not supported. Use speak() function instead.'));
  });
}

/**
 * Record audio using MediaRecorder API
 */
export async function recordAudio(duration: number = 5000): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        resolve(blob);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), duration);
    } catch (error) {
      reject(new Error(`Failed to record audio: ${error}`));
    }
  });
}
