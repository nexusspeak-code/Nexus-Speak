// Speech Audio Engine - Web Audio & Golang Backend Transcription

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface AudioVisualizerCallback {
  (frequencyData: Uint8Array): void;
}

export interface TranscriptionBackendResult {
  transcript: string;
  confidence?: number;
  error?: string;
}

export class SpeechAudioEngine {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private recognition: any = null;
  private animFrameId: number | null = null;
  private visualizerCallback: AudioVisualizerCallback | null = null;
  private audioChunks: Float32Array[] = [];

  public isRecording = false;
  public isPaused = false;
  public livePreviewText = '';

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      return false;
    }
  }

  async startRecording(
    langCode: string,
    onSpeechResult: (text: string, isFinal: boolean) => void,
    onVisualizer: AudioVisualizerCallback,
    onError: (errMessage: string) => void
  ): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.livePreviewText = '';

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone requires HTTPS (Secure Context) or microphone permission in your app settings.');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();

      // Ensure AudioContext is running (crucial for modern Chrome / Safari autoplay policy)
      if (this.audioContext.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (resumeErr) {
          console.warn('AudioContext resume warning:', resumeErr);
        }
      }

      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Setup AnalyserNode for live visualizer
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // Setup ScriptProcessorNode to collect actual PCM samples
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording || this.isPaused) return;
        const channelData = e.inputBuffer.getChannelData(0);
        this.audioChunks.push(new Float32Array(channelData));
      };
      source.connect(this.processor);

      // Connect through a SILENT gain node (0 volume) to keep processor alive WITHOUT speaker feedback/echo suppression
      const silenceGain = this.audioContext.createGain();
      silenceGain.gain.value = 0;
      this.processor.connect(silenceGain);
      silenceGain.connect(this.audioContext.destination);

      this.visualizerCallback = onVisualizer;
      this.isRecording = true;
      this.isPaused = false;

      // Start animation loop for visualizer
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!this.isRecording) return;
        if (!this.isPaused && this.analyser && this.visualizerCallback) {
          this.analyser.getByteFrequencyData(dataArray);
          this.visualizerCallback(dataArray);
        }
        this.animFrameId = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Setup live SpeechRecognition for Chrome, Edge, Safari, Android Chrome & PWA
      const SpeechRec = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          this.recognition = new SpeechRec();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
          this.recognition.lang = langCode;

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalTranscript += res[0].transcript + ' ';
              } else {
                interimTranscript += res[0].transcript;
              }
            }
            const fullText = (finalTranscript + interimTranscript).trim();
            if (fullText) {
              this.livePreviewText = fullText;
              onSpeechResult(this.livePreviewText, Boolean(finalTranscript));
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn('SpeechRecognition error:', event.error);
            if (event.error === 'not-allowed') {
              onError('Microphone permission blocked. Please allow microphone in your browser or device settings.');
            } else if (event.error === 'network') {
              onError('Voice recognition network error. Please check your internet connection.');
            }
          };

          this.recognition.onend = () => {
            // Auto-restart if user is still actively recording
            if (this.isRecording && !this.isPaused && this.recognition) {
              try {
                this.recognition.start();
              } catch (e) {}
            }
          };

          this.recognition.start();
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }

      return true;
    } catch (err: any) {
      this.cleanup();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        onError('Microphone access blocked. Please allow microphone access in your browser.');
      } else {
        onError('Microphone error: ' + (err.message || 'Device error'));
      }
      return false;
    }
  }

  pauseRecording() {
    this.isPaused = true;
  }

  resumeRecording(langCode: string) {
    this.isPaused = false;
  }

  // Stops recording and returns recorded 16kHz mono WAV Blob
  stopAndGetAudioBlob(): Blob | null {
    const rawChunks = [...this.audioChunks];
    const originalSampleRate = this.audioContext?.sampleRate || 44100;

    // Preserve live preview text across cleanup
    const preservedPreview = this.livePreviewText;
    this.cleanup();
    this.livePreviewText = preservedPreview;

    if (rawChunks.length === 0) return null;

    // Merge chunks
    let totalLength = 0;
    for (const chunk of rawChunks) {
      totalLength += chunk.length;
    }

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of rawChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Downsample to 16kHz
    const targetSampleRate = 16000;
    const downsampled = downsampleBuffer(merged, originalSampleRate, targetSampleRate);

    // Encode to WAV Blob
    return encodeWAV(downsampled, targetSampleRate);
  }

  // Sends audio to backend speech-to-text endpoint
  async transcribeAudioWithBackend(
    audioBlob: Blob,
    langCode: string
  ): Promise<TranscriptionBackendResult> {
    // 1. Try local Vite proxy, Vercel /api/transcribe, or configured backend URL
    try {
      const customBackend = typeof window !== 'undefined' ? localStorage.getItem('nexus_speak_backend_url') : null;
      let endpoint = `/api/transcribe?lang=${encodeURIComponent(langCode)}`;

      if (customBackend && customBackend.trim()) {
        endpoint = `${customBackend.trim().replace(/\/$/, '')}/api/transcribe?lang=${encodeURIComponent(langCode)}`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/wav' },
        body: audioBlob,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript && data.transcript.trim()) {
          return {
            transcript: data.transcript.trim(),
            confidence: data.confidence,
          };
        }
      }
    } catch (err: any) {
      console.warn('Vite / Vercel /api/transcribe error, trying alternative:', err);
    }

    // 2. Try Go backend directly if running (port 8080)
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('lang', langCode);

      const res = await fetch(`http://localhost:8080/api/transcribe?lang=${encodeURIComponent(langCode)}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript && data.transcript.trim()) {
          return {
            transcript: data.transcript.trim(),
            confidence: data.confidence,
          };
        }
      }
    } catch (backendErr) {
      // Ignored
    }

    return {
      transcript: '',
      error: 'No speech recognized',
    };
  }

  cancelRecording(): void {
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    this.isPaused = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch (e) {}
      this.processor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    this.analyser = null;
    this.visualizerCallback = null;
  }
}

// Linear downsampler
function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (outputRate === inputRate) {
    return buffer;
  }
  const sampleRateRatio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

// 16-bit Mono PCM WAV Encoder
function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

export const speechAudioEngine = new SpeechAudioEngine();
