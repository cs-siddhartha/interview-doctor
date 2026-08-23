const VAD_POLL_INTERVAL_MS = 80;
const VAD_SILENCE_DURATION_MS = 1200;
const VAD_MIN_SPEECH_DURATION_MS = 220;
const VAD_CALIBRATION_DURATION_MS = 500;
const VAD_MIN_RMS_THRESHOLD = 0.006;
const VAD_NOISE_MULTIPLIER = 2.5;
const VAD_NOISE_SMOOTHING = 0.08;

type SilenceHandler = () => void;
type SpeechHandler = () => void;
type LevelHandler = (level: number) => void;

/** Detects a completed spoken answer from microphone energy without requiring a stop button. */
export class VoiceActivityDetector {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private sampleBuffer: Uint8Array<ArrayBuffer> | null = null;
  private timer: number | null = null;
  private onSilence: SilenceHandler | null = null;
  private onSpeech: SpeechHandler | null = null;
  private onLevel: LevelHandler | null = null;
  private candidateSpeechStartedAt = 0;
  private lastSpeechAt = 0;
  private enabledAt = 0;
  private hasSpeech = false;
  private enabled = false;
  private noiseFloor = 0;

  /** Unlocks audio analysis during the user gesture that starts the interview. */
  activate() {
    this.context ??= new AudioContext();

    return this.context.resume();
  }

  async start(
    stream: MediaStream,
    onSilence: SilenceHandler,
    onSpeech: SpeechHandler,
    onLevel: LevelHandler = () => {},
  ) {
    const context = this.context ?? new AudioContext();
    this.context = context;
    await context.resume();
    this.source = context.createMediaStreamSource(stream);
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 512;
    this.sampleBuffer = new Uint8Array(this.analyser.fftSize);
    this.source.connect(this.analyser);
    this.onSilence = onSilence;
    this.onSpeech = onSpeech;
    this.onLevel = onLevel;
    this.timer = window.setInterval(() => this.poll(), VAD_POLL_INTERVAL_MS);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;

    if (enabled) {
      this.enabledAt = performance.now();
    } else {
      this.onLevel?.(0);
      this.resetSpeechState();
    }
  }

  stop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }

    this.source?.disconnect();
    this.analyser?.disconnect();
    this.source = null;
    this.analyser = null;
    this.sampleBuffer = null;
    this.onSilence = null;
    this.onSpeech = null;
    this.onLevel?.(0);
    this.onLevel = null;
    this.resetSpeechState();

    const context = this.context;
    this.context = null;

    if (context) {
      void context.close();
    }
  }

  private poll() {
    if (!this.enabled || !this.analyser || !this.sampleBuffer) {
      return;
    }

    this.analyser.getByteTimeDomainData(this.sampleBuffer);
    const rms = getRootMeanSquare(this.sampleBuffer);
    this.onLevel?.(getVoiceLevel(rms));
    const now = performance.now();
    const speechThreshold = Math.max(
      VAD_MIN_RMS_THRESHOLD,
      this.noiseFloor * VAD_NOISE_MULTIPLIER,
    );

    if (now - this.enabledAt < VAD_CALIBRATION_DURATION_MS) {
      this.updateNoiseFloor(rms);
      return;
    }

    if (rms >= speechThreshold) {
      if (this.hasSpeech) {
        this.lastSpeechAt = now;
        return;
      }

      this.candidateSpeechStartedAt ||= now;

      if (
        now - this.candidateSpeechStartedAt >=
        VAD_MIN_SPEECH_DURATION_MS
      ) {
        this.hasSpeech = true;
        this.lastSpeechAt = now;
        this.onSpeech?.();
      }

      return;
    }

    if (!this.hasSpeech) {
      this.candidateSpeechStartedAt = 0;
      this.updateNoiseFloor(rms);
    }

    if (
      this.hasSpeech &&
      now - this.lastSpeechAt >= VAD_SILENCE_DURATION_MS
    ) {
      this.resetSpeechState();
      this.onSilence?.();
    }
  }

  private resetSpeechState() {
    this.hasSpeech = false;
    this.candidateSpeechStartedAt = 0;
    this.lastSpeechAt = 0;
    this.enabledAt = 0;
    this.noiseFloor = 0;
  }

  private updateNoiseFloor(rms: number) {
    this.noiseFloor =
      this.noiseFloor === 0
        ? rms
        : this.noiseFloor * (1 - VAD_NOISE_SMOOTHING) +
          rms * VAD_NOISE_SMOOTHING;
  }
}

// Maps microphone energy to a stable visual range while preserving quieter speech movement.
function getVoiceLevel(rms: number) {
  return Math.min(1, Math.max(0, (rms - 0.003) * 14));
}

function getRootMeanSquare(samples: Uint8Array<ArrayBuffer>) {
  let sum = 0;

  for (const sample of samples) {
    const normalized = (sample - 128) / 128;
    sum += normalized * normalized;
  }

  return Math.sqrt(sum / samples.length);
}
