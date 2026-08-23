import {
  getSupportedRecordingMimeType,
  stopMediaStream,
} from "@/lib/media/recording";
import { VoiceActivityDetector } from "@/lib/media/voice-activity-detector";

type AudioChunkHandler = (chunk: ArrayBuffer) => void;
type RecordingReadyHandler = (mimeType: string) => Promise<void>;
type SpeechHandler = () => void;
type LevelHandler = (level: number) => void;

const REALTIME_CHUNK_INTERVAL_MS = 100;

export class RealtimeMicrophone {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private pendingChunks = Promise.resolve();
  private readonly voiceActivityDetector = new VoiceActivityDetector();

  constructor(
    private readonly onChunk: AudioChunkHandler,
    private readonly onLevel: LevelHandler,
  ) {}

  // Keeps one permitted microphone stream alive while voice activity controls
  // answer boundaries across the conversation.
  async start(onSpeech: SpeechHandler) {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error("Microphone recording is unavailable");
    }

    await this.voiceActivityDetector.activate();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    await this.voiceActivityDetector.start(
      this.stream,
      () => {},
      onSpeech,
      this.onLevel,
    );
  }

  // Opens a fresh encoded stream for each answer so the realtime STT provider
  // receives the WebM container header before subsequent audio chunks.
  async startTurn(onReady: RecordingReadyHandler) {
    if (!this.stream) {
      throw new Error("Microphone has not started");
    }

    if (this.recorder) {
      return;
    }

    const mimeType = getSupportedRecordingMimeType();
    this.recorder = new MediaRecorder(
      this.stream,
      mimeType ? { mimeType } : undefined,
    );
    this.recorder.ondataavailable = (event) => {
      if (event.data.size === 0) {
        return;
      }

      this.pendingChunks = this.pendingChunks.then(async () => {
        this.onChunk(await event.data.arrayBuffer());
      });
    };

    await onReady(this.recorder.mimeType || mimeType || "audio/webm");
    this.recorder.start(REALTIME_CHUNK_INTERVAL_MS);
    this.voiceActivityDetector.setEnabled(true);
  }

  // Flushes one detected answer while retaining the permitted microphone
  // stream for the next automatically started turn.
  async stopTurn() {
    this.voiceActivityDetector.setEnabled(false);
    const recorder = this.recorder;

    if (!recorder || recorder.state === "inactive") {
      this.releaseRecorder();
      return;
    }

    await new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
      recorder.stop();
    });
    await this.pendingChunks;
    this.releaseRecorder();
  }

  async stop() {
    await this.stopTurn();
    this.voiceActivityDetector.stop();
    this.release();
  }

  // Discards live browser resources when the connection fails or the session
  // ends without committing the current answer.
  discard() {
    this.voiceActivityDetector.stop();
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.ondataavailable = null;
      this.recorder.stop();
    }

    this.releaseRecorder();
    this.release();
  }

  private releaseRecorder() {
    this.recorder = null;
    this.pendingChunks = Promise.resolve();
  }

  private release() {
    stopMediaStream(this.stream);
    this.stream = null;
  }
}
