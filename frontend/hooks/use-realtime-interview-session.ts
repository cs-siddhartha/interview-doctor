import { useEffect, useRef, useState } from "react";

import { endInterviewSession } from "@/app/actions/end-session";
import { type RecorderState } from "@/components/interview/session/session-types";
import { SESSION_COPY } from "@/constants/session";
import { PcmStreamPlayer } from "@/lib/media/pcm-player";
import { RealtimeMicrophone } from "@/lib/media/realtime-microphone";
import { getRealtimeSessionUrl } from "@/lib/realtime/session-socket";
import {
  realtimeServerEventSchema,
  type RealtimeServerEvent,
} from "@/lib/schemas/realtime";
import { type TranscriptTurn } from "@/lib/schemas/session";

type RealtimeInterviewOptions = {
  sessionId: string;
  initialState: string;
  initialTranscript: TranscriptTurn[];
};

// Finds the question used for immediate rendering while completed transcript
// entries remain the durable source of interview history.
function findLatestQuestion(transcript: TranscriptTurn[]) {
  return [...transcript]
    .reverse()
    .find((turn) => turn.speaker === "ai_interviewer")?.text;
}

// Owns the realtime socket and browser media lifecycle while exposing the same
// view contract as the existing turn-based interview hook.
export function useRealtimeInterviewSession({
  sessionId,
  initialState,
  initialTranscript,
}: RealtimeInterviewOptions) {
  const [transcript, setTranscript] = useState(initialTranscript);
  const [currentQuestion, setCurrentQuestion] = useState(
    findLatestQuestion(initialTranscript),
  );
  const [turnState, setTurnState] = useState<string>(
    SESSION_COPY.metrics.state.value,
  );
  const [recorderState, setRecorderState] =
    useState<RecorderState>("idle");
  const [hasStarted, setHasStarted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isEnded, setIsEnded] = useState(initialState === "session_end");
  const [error, setError] = useState<string | null>(null);
  const [playbackNotice, setPlaybackNotice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnswerActive, setIsAnswerActive] = useState(false);
  const audioLevelRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const socketPromiseRef = useRef<Promise<WebSocket> | null>(null);
  const socketMessageQueueRef = useRef(Promise.resolve());
  const microphoneRef = useRef<RealtimeMicrophone | null>(null);
  const microphoneStartPromiseRef = useRef<Promise<void> | null>(null);
  const playerRef = useRef(new PcmStreamPlayer());
  const sampleRateRef = useRef(24000);
  const questionRef = useRef(currentQuestion);
  const endedRef = useRef(isEnded);
  const hasStartedRef = useRef(hasStarted);
  const turnActiveRef = useRef(false);
  const commitInFlightRef = useRef(false);
  const browserFallbackActiveRef = useRef(false);
  const audioReceivedRef = useRef(false);

  useEffect(() => {
    // Fast Refresh can preserve refs, so resync the lifecycle flag when this
    // media owner mounts.
    endedRef.current = initialState === "session_end";
    const player = playerRef.current;

    return () => {
      console.info("[frontend.realtime] releasing browser resources", {
        sessionId,
      });
      microphoneRef.current?.discard();
      socketRef.current?.close();
      window.speechSynthesis?.cancel();
      void player.close();
    };
  }, [initialState, sessionId]);

  function sendSocketEvent(socket: WebSocket, event: object) {
    if (socket.readyState !== WebSocket.OPEN) {
      throw new Error(SESSION_COPY.realtimeConnectionError);
    }

    const eventType = "type" in event ? event.type : "unknown";
    console.info("[frontend.realtime] sending event", {
      sessionId,
      type: eventType,
    });
    socket.send(JSON.stringify(event));
  }

  async function ensureMicrophone() {
    if (microphoneStartPromiseRef.current) {
      await microphoneStartPromiseRef.current;
      return;
    }

    if (microphoneRef.current) {
      return;
    }

    const microphone = new RealtimeMicrophone(
      (chunk) => {
        const socket = socketRef.current;

        if (
          turnActiveRef.current &&
          socket?.readyState === WebSocket.OPEN
        ) {
          socket.send(chunk);

          if (!audioReceivedRef.current) {
            audioReceivedRef.current = true;
            setTurnState(SESSION_COPY.realtimeReceivingAudioStateLabel);
          }
        }
      },
      (level) => {
        audioLevelRef.current?.style.setProperty(
          "--voice-level",
          level.toFixed(3),
        );
      },
    );
    microphoneRef.current = microphone;

    const startPromise = microphone.start(() => {
      console.info("[frontend.realtime] speech detected", { sessionId });
      setTurnState(SESSION_COPY.realtimeHearingStateLabel);
    });
    microphoneStartPromiseRef.current = startPromise;

    try {
      await startPromise;
      console.info("[frontend.realtime] microphone ready", { sessionId });
    } catch (error) {
      console.error("[frontend.realtime] microphone start failed", {
        sessionId,
        error,
      });
      microphone.discard();
      microphoneRef.current = null;
      throw error;
    } finally {
      if (microphoneStartPromiseRef.current === startPromise) {
        microphoneStartPromiseRef.current = null;
      }
    }
  }

  async function startListeningTurn() {
    if (endedRef.current) {
      return false;
    }

    if (turnActiveRef.current) {
      setIsAnswerActive(true);
      setRecorderState("recording");
      return true;
    }

    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("[frontend.realtime] cannot record: socket unavailable", {
        sessionId,
      });
      setError(SESSION_COPY.realtimeConnectionError);
      return false;
    }

    try {
      if (microphoneStartPromiseRef.current) {
        await microphoneStartPromiseRef.current;
      }

      const microphone = microphoneRef.current;

      if (!microphone || endedRef.current) {
        setError(SESSION_COPY.microphonePermissionMessage);
        return false;
      }

      setError(null);
      turnActiveRef.current = true;
      audioReceivedRef.current = false;
      setIsAnswerActive(true);
      await microphone.startTurn(async (mimeType) => {
        sendSocketEvent(socket, { type: "turn.start", mimeType });
      });
      console.info("[frontend.realtime] recording requested", { sessionId });
      setTurnState(SESSION_COPY.realtimeConnectingMessage);
      return true;
    } catch (error) {
      console.error("[frontend.realtime] recording start failed", {
        sessionId,
        error,
      });
      turnActiveRef.current = false;
      setIsAnswerActive(false);
      setRecorderState("idle");
      setError(SESSION_COPY.microphonePermissionMessage);
      return false;
    }
  }

  async function commitCurrentTurn() {
    if (
      !turnActiveRef.current ||
      commitInFlightRef.current ||
      endedRef.current
    ) {
      return;
    }

    const microphone = microphoneRef.current;
    const socket = socketRef.current;
    commitInFlightRef.current = true;
    setIsAnswerActive(false);
    setRecorderState("processing");
    setTurnState(SESSION_COPY.processingStateLabel);

    try {
      await microphone?.stopTurn();
      turnActiveRef.current = false;
      setIsAnswerActive(false);
      if (socket && socket.readyState === WebSocket.OPEN) {
        sendSocketEvent(socket, { type: "turn.commit" });
        console.info("[frontend.realtime] turn committed", { sessionId });
      }
    } catch (error) {
      console.error("[frontend.realtime] turn commit failed", {
        sessionId,
        error,
      });
      turnActiveRef.current = false;
      setIsAnswerActive(false);
      commitInFlightRef.current = false;
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);
      setError(SESSION_COPY.turnErrorMessage);
    }
  }

  async function handleAnswerAction() {
    if (turnActiveRef.current) {
      await commitCurrentTurn();
      return;
    }

    setError(null);
    setIsAnswerActive(true);
    setRecorderState("recording");
    setTurnState(SESSION_COPY.realtimeConnectingMessage);
    try {
      const microphoneStart = ensureMicrophone();
      const socketConnection = connect();
      await Promise.all([microphoneStart, socketConnection]);
      const didStart = await startListeningTurn();

      if (!didStart) {
        setIsAnswerActive(false);
        setRecorderState("idle");
      }
    } catch (error) {
      console.error("[frontend.realtime] answer action failed", {
        sessionId,
        error,
      });
      setIsAnswerActive(false);
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);
      setError(
        error instanceof Error
          ? error.message
          : SESSION_COPY.realtimeConnectionError,
      );
    }
  }

  function handleServerEvent(event: RealtimeServerEvent) {
    if (event.type !== "stt.partial") {
      console.info("[frontend.realtime] server event", {
        sessionId,
        type: event.type,
      });
    }

    if (event.type === "turn.started") {
      setRecorderState("recording");
      setTurnState(SESSION_COPY.recordingStateLabel);
    } else if (event.type === "stt.partial") {
      setTurnState(SESSION_COPY.realtimeTranscribingStateLabel);
    } else if (event.type === "stt.final") {
      setRecorderState("processing");
      setTurnState(SESSION_COPY.processingStateLabel);
    } else if (event.type === "stt.speech_end") {
      void commitCurrentTurn();
    } else if (event.type === "interviewer.text") {
      questionRef.current = event.text;
      setCurrentQuestion(event.text);
    } else if (event.type === "interviewer.audio.start") {
      sampleRateRef.current = event.sampleRate;
      setIsPlaying(true);
      setPlaybackNotice(null);
    } else if (event.type === "interviewer.audio.end") {
      void startListeningAfterPlayback();
    } else if (event.type === "interviewer.audio.error") {
      console.warn("[frontend.realtime] provider audio failed; using browser fallback", {
        sessionId,
        message: event.message,
      });
      void playBrowserFallback(questionRef.current);
    } else if (event.type === "turn.completed") {
      setTranscript((current) => [
        ...current,
        event.candidateTurn,
        event.aiTurn,
      ]);
      commitInFlightRef.current = false;

      if (!turnActiveRef.current) {
        setRecorderState("idle");
        setTurnState(event.state);
      }
    } else if (event.type === "turn.empty") {
      turnActiveRef.current = false;
      commitInFlightRef.current = false;
      setIsAnswerActive(false);
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);
      void startListeningTurn();
    } else if (event.type === "session.ended") {
      endedRef.current = true;
      setIsEnding(false);
      setIsEnded(true);
    } else if (event.type === "error") {
      console.error("[frontend.realtime] server reported error", {
        sessionId,
        message: event.message,
      });
      turnActiveRef.current = false;
      setIsAnswerActive(false);
      commitInFlightRef.current = false;
      void microphoneRef.current?.stopTurn();
      setError(event.message);
      setRecorderState("idle");
      setTurnState(SESSION_COPY.metrics.state.value);
    }
  }

  async function handleSocketMessage(
    event: MessageEvent<string | ArrayBuffer | Blob>,
  ) {
    const data =
      event.data instanceof Blob ? await event.data.arrayBuffer() : event.data;

    if (data instanceof ArrayBuffer) {
      playerRef.current.enqueue(data, sampleRateRef.current);
      return;
    }

    try {
      const payload = realtimeServerEventSchema.parse(JSON.parse(data));
      handleServerEvent(payload);
    } catch (error) {
      console.error("[frontend.realtime] invalid server message", {
        sessionId,
        error,
        payloadType: typeof data,
        payloadSize: typeof data === "string" ? data.length : 0,
      });
      setError(SESSION_COPY.realtimeConnectionError);
    }
  }

  function connect() {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return Promise.resolve(socketRef.current);
    }

    if (socketPromiseRef.current) {
      return socketPromiseRef.current;
    }

    socketPromiseRef.current = new Promise<WebSocket>((resolve, reject) => {
      const socketUrl = getRealtimeSessionUrl(sessionId);
      console.info("[frontend.realtime] connecting socket", {
        sessionId,
        url: socketUrl,
      });
      const socket = new WebSocket(socketUrl);
      socket.binaryType = "arraybuffer";
      socket.onmessage = (event) => {
        socketMessageQueueRef.current = socketMessageQueueRef.current.then(() =>
          handleSocketMessage(event),
        );
      };
      socket.onopen = () => {
        socketRef.current = socket;
        console.info("[frontend.realtime] socket connected", { sessionId });
        resolve(socket);
      };
      socket.onerror = (error) => {
        console.error("[frontend.realtime] socket error", { sessionId, error });
        reject(new Error(SESSION_COPY.realtimeConnectionError));
      };
      socket.onclose = (event) => {
        console.info("[frontend.realtime] socket closed", {
          sessionId,
          code: event.code,
          reason: event.reason,
          clean: event.wasClean,
        });
        socketRef.current = null;
        socketPromiseRef.current = null;
        turnActiveRef.current = false;
        setIsAnswerActive(false);
        commitInFlightRef.current = false;
        microphoneRef.current?.discard();
        microphoneRef.current = null;

        if (!endedRef.current) {
          setError(SESSION_COPY.realtimeDisconnectedMessage);
        }
      };
    });

    return socketPromiseRef.current;
  }

  async function playCurrentQuestion() {
    setError(null);
    setPlaybackNotice(null);

    try {
      setIsPlaying(true);
      const playbackStart = playerRef.current.start();
      const microphoneStart = ensureMicrophone();
      const socketConnection = connect();

      await Promise.all([playbackStart, microphoneStart]);
      const socket = await socketConnection;
      const isFirstQuestion = !hasStartedRef.current;

      hasStartedRef.current = true;
      setHasStarted(true);

      sendSocketEvent(socket, {
        type: isFirstQuestion ? "session.start" : "interviewer.replay",
      });
    } catch (error) {
      console.error("[frontend.realtime] playback start failed", {
        sessionId,
        error,
      });
      setIsPlaying(false);
      setError(
        error instanceof Error
          ? error.message
          : SESSION_COPY.realtimeConnectionError,
      );
    }
  }

  async function endSession() {
    console.info("[frontend.realtime] end requested", { sessionId });
    setIsEnding(true);
    setError(null);
    endedRef.current = true;
    turnActiveRef.current = false;
    setIsAnswerActive(false);
    commitInFlightRef.current = false;
    microphoneRef.current?.discard();
    microphoneRef.current = null;
    window.speechSynthesis?.cancel();
    await playerRef.current.close();
    const result = await endInterviewSession(sessionId);

    if (!result.data) {
      console.error("[frontend.realtime] end failed", {
        sessionId,
        error: result.error,
      });
      endedRef.current = false;
      setError(result.error);
      setIsEnding(false);
      return;
    }

    socketRef.current?.close();
    setTranscript(result.data.transcript);
    setTurnState(result.data.state);
    setIsEnding(false);
    setIsEnded(true);
    console.info("[frontend.realtime] ended", {
      sessionId,
      transcriptTurns: result.data.transcript.length,
    });
  }

  async function startListeningAfterPlayback() {
    if (
      browserFallbackActiveRef.current ||
      endedRef.current
    ) {
      return;
    }

    await playerRef.current.waitForIdle();
    await startListeningTurn();
    setIsPlaying(false);
  }

  async function playBrowserFallback(question?: string) {
    if (!question || !window.speechSynthesis) {
      console.error("[frontend.realtime] browser speech fallback unavailable", {
        sessionId,
      });
      browserFallbackActiveRef.current = false;
      setPlaybackNotice(SESSION_COPY.audioPlaybackErrorMessage);
      await startListeningAfterPlayback();
      return;
    }

    window.speechSynthesis.cancel();
    browserFallbackActiveRef.current = true;
    await playerRef.current.waitForIdle();

    if (endedRef.current) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(question);
    const resumeListening = () => {
      browserFallbackActiveRef.current = false;
      void startListeningAfterPlayback();
    };
    utterance.onend = resumeListening;
    utterance.onerror = resumeListening;
    window.speechSynthesis.speak(utterance);
    console.info("[frontend.realtime] browser speech fallback started", {
      sessionId,
    });
    setPlaybackNotice(SESSION_COPY.browserVoiceFallbackMessage);
  }

  return {
    transcript,
    currentQuestion,
    turnState,
    recorderState,
    hasStarted,
    isBusy: recorderState === "processing" || isPlaying,
    isAnswerActive,
    isEnding,
    isEnded,
    error,
    playbackNotice,
    audioLevelRef,
    playCurrentQuestion,
    finishAnswer: handleAnswerAction,
    endSession,
  };
}
