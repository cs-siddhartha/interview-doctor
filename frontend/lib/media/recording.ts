import { SESSION_AUDIO, SESSION_COPY } from "@/constants/session";

export function getSupportedRecordingMimeType() {
  return SESSION_AUDIO.mimeTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

export function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        reject(new Error(SESSION_COPY.turnErrorMessage));

        return;
      }

      resolve(reader.result.split(SESSION_AUDIO.base64Marker)[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}
