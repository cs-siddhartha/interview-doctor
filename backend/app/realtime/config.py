from app.schemas.session import LLMProvider, ProviderSelection, STTProvider, TTSProvider


class UnsupportedRealtimeStackError(ValueError):
    """Report provider combinations that do not have realtime adapters yet."""


# Keeps realtime availability explicit while batch providers continue to use the
# broader registry without inheriting unfinished streaming capabilities.
def validate_realtime_stack(selection: ProviderSelection) -> None:
    """Require the provider combination implemented by the realtime pipeline."""
    supported = (
        selection.stt.provider == STTProvider.DEEPGRAM
        and selection.llm.provider == LLMProvider.OPENAI
        and selection.tts.provider
        in {TTSProvider.ELEVENLABS, TTSProvider.OPENAI}
    )

    if not supported:
        raise UnsupportedRealtimeStackError(
            "Realtime currently requires Deepgram STT, OpenAI LLM, and "
            "ElevenLabs or OpenAI TTS"
        )
