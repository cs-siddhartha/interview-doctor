export class PcmStreamPlayer {
  private context: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private idleWaiters = new Set<() => void>();

  // Creates the audio context from a user gesture so browsers permit streamed
  // interviewer playback without triggering autoplay restrictions.
  async start() {
    this.context ??= new AudioContext();

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.nextStartTime = Math.max(
      this.nextStartTime,
      this.context.currentTime + 0.04,
    );
  }

  // Schedules raw 16-bit mono PCM chunks on one continuous browser timeline
  // so provider boundaries do not create audible gaps between buffers.
  enqueue(chunk: ArrayBuffer, sampleRate: number) {
    if (!this.context) {
      return;
    }

    const sampleCount = Math.floor(chunk.byteLength / 2);

    if (sampleCount === 0) {
      return;
    }

    const view = new DataView(chunk);
    const audioBuffer = this.context.createBuffer(1, sampleCount, sampleRate);
    const channel = audioBuffer.getChannelData(0);

    for (let index = 0; index < sampleCount; index += 1) {
      channel[index] = view.getInt16(index * 2, true) / 32768;
    }

    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.context.destination);
    source.onended = () => {
      this.sources.delete(source);

      if (this.sources.size === 0) {
        this.resolveIdleWaiters();
      }
    };
    if (
      this.sources.size === 0 ||
      this.nextStartTime < this.context.currentTime
    ) {
      this.nextStartTime = this.context.currentTime + 0.04;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.sources.add(source);
  }

  // Waits until all PCM already queued for the interviewer has finished
  // playing before the microphone is allowed to listen for an answer.
  async waitForIdle() {
    if (this.sources.size === 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      const remainingPlaybackMs = this.context
        ? Math.max(0, this.nextStartTime - this.context.currentTime) * 1000
        : 0;
      const timeout = window.setTimeout(
        () => this.stopSources(),
        remainingPlaybackMs + 750,
      );
      const complete = () => {
        window.clearTimeout(timeout);
        this.idleWaiters.delete(complete);
        resolve();
      };

      this.idleWaiters.add(complete);
    });
  }

  // Stops queued audio immediately when a session ends or the component leaves
  // the page, preventing stale questions from continuing to play.
  async close() {
    this.stopSources();

    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    this.nextStartTime = 0;
  }

  // Interrupts queued audio while retaining the user-unlocked audio context.
  stop() {
    this.stopSources();
  }

  private stopSources() {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        this.sources.delete(source);
      }
    }

    this.sources.clear();
    this.nextStartTime = 0;
    this.resolveIdleWaiters();
  }

  private resolveIdleWaiters() {
    for (const resolve of this.idleWaiters) {
      resolve();
    }

    this.idleWaiters.clear();
  }
}
