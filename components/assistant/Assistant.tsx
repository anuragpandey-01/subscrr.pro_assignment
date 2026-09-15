"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

const suggestedQuestions = [
  "What's my next subscription?",
  "How much am I spending monthly?",
  "Which payments are coming up?",
  "Where can I save money?",
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm your Subscrr Assistant. Ask me about your subscriptions, upcoming payments, spending, or savings.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // Text-to-speech state
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);

  const recognitionRef = useRef<any>(null);

  // --------------------------------------------------
  // Chat scroll
  // --------------------------------------------------

  const messagesContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // --------------------------------------------------
  // Text to Speech
  // --------------------------------------------------

  const speak = (text: string) => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    const synthesis = window.speechSynthesis;

    // Cancel any existing speech
    synthesis.cancel();

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/[#_`]/g, "");

    const utterance = new SpeechSynthesisUtterance(
      cleanText
    );

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setSpeechPaused(false);
    };

    utterance.onpause = () => {
      setSpeechPaused(true);
    };

    utterance.onresume = () => {
      setSpeechPaused(false);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };

    synthesis.speak(utterance);
  };

  // --------------------------------------------------
  // Pause / Resume AI Speaking
  // --------------------------------------------------

  const toggleSpeech = () => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    const synthesis = window.speechSynthesis;

    if (!speaking) {
      return;
    }

    if (synthesis.paused) {
      synthesis.resume();
      setSpeechPaused(false);
    } else {
      synthesis.pause();
      setSpeechPaused(true);
    }
  };

  // --------------------------------------------------
  // Stop AI Speaking
  // --------------------------------------------------

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    setSpeaking(false);
    setSpeechPaused(false);
  };

  // --------------------------------------------------
  // Speech Recognition
  // --------------------------------------------------

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );

      return;
    }

    if (loading) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setInput("");
    };

    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript?.trim();

      if (!transcript) return;

      setInput(transcript);

      // Automatically send voice message
      setTimeout(() => {
        sendMessage(transcript, true);
      }, 100);
    };

    recognition.onerror = (event: any) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Could not start speech recognition:",
        error
      );

      setListening(false);
    }
  };

  // --------------------------------------------------
  // Cleanup
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --------------------------------------------------
  // Send Message
  // --------------------------------------------------

  const sendMessage = async (
    message?: string,
    isVoice = false
  ) => {
    const finalMessage = (message ?? input).trim();

    if (!finalMessage || loading) return;

    if (isVoice) {
      recognitionRef.current?.stop();
      setListening(false);
    }

    // Stop previous AI speech when a new question is asked
    stopSpeaking();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: finalMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/assistant/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: finalMessage,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        const loginMessage =
          "Please log in to use your personalized Subscrr Assistant.";

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: loginMessage,
          },
        ]);

        if (isVoice) {
          speak(loginMessage);
        }

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      const answer =
        data.answer ||
        "I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: answer,
        },
      ]);

      // Only voice questions receive spoken responses
      if (isVoice) {
        speak(answer);
      }
    } catch (error) {
      console.error("Assistant error:", error);

      const errorMessage =
        "Sorry, I couldn't process that request right now.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: errorMessage,
        },
      ]);

      if (isVoice) {
        speak(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Typed message submit
  // --------------------------------------------------

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    sendMessage(input, false);
  };

  return (
    <section
      id="assistant"
      className="section"
      style={{
        padding: "120px 24px",
        background: "#F4F2EC",
      }}
    >
      <style jsx>{`
        @keyframes assistantCardIn {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes messageInLeft {
          from {
            opacity: 0;
            transform: translateX(-14px) translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes messageInRight {
          from {
            opacity: 0;
            transform: translateX(14px) translateY(4px);
          }

          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }

        @keyframes thinkingDot {
          0%,
          60%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }

          30% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @keyframes micPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 37, 0, 0.45);
          }

          70% {
            box-shadow: 0 0 0 10px rgba(255, 37, 0, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(255, 37, 0, 0);
          }
        }

        @keyframes speakingPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 37, 0, 0.35);
          }

          70% {
            box-shadow: 0 0 0 8px rgba(255, 37, 0, 0);
          }

          100% {
            box-shadow: 0 0 0 0 rgba(255, 37, 0, 0);
          }
        }

        .assistant-card {
          animation: assistantCardIn 0.6s ease-out both;
        }

        .assistant-message-user {
          animation: messageInRight 0.28s ease-out both;
        }

        .assistant-message-ai {
          animation: messageInLeft 0.28s ease-out both;
        }

        .assistant-suggestion {
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .assistant-suggestion:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: #55555e !important;
          background: #202027 !important;
        }

        .assistant-send {
          transition:
            transform 180ms ease,
            opacity 180ms ease;
        }

        .assistant-send:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .assistant-send:active:not(:disabled) {
          transform: translateY(0) scale(0.97);
        }

        .assistant-mic {
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .assistant-mic:hover:not(:disabled) {
          transform: scale(1.06);
        }

        .assistant-mic-listening {
          animation: micPulse 1.5s infinite;
        }

        .assistant-speech-control {
          transition:
            transform 180ms ease,
            background 180ms ease,
            border-color 180ms ease,
            opacity 180ms ease;
        }

        .assistant-speech-control:hover {
          transform: translateY(-2px);
          background: #292930 !important;
          border-color: #55555e !important;
        }

        .assistant-speech-control:active {
          transform: translateY(0) scale(0.97);
        }

        .assistant-speech-active {
          animation: speakingPulse 1.8s infinite;
        }

        .thinking-dot {
          display: inline-block;
          margin-left: 3px;
          animation: thinkingDot 1.2s infinite ease-in-out;
        }

        .thinking-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .thinking-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @media (prefers-reduced-motion: reduce) {
          .assistant-card,
          .assistant-message-user,
          .assistant-message-ai,
          .assistant-mic-listening,
          .assistant-speech-active,
          .thinking-dot {
            animation: none !important;
          }

          .assistant-suggestion,
          .assistant-send,
          .assistant-mic,
          .assistant-speech-control {
            transition: none !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            maxWidth: "720px",
            marginBottom: "50px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#FF2500",
              marginBottom: "16px",
            }}
          >
            AI Assistant
          </p>

          <h2
            style={{
              fontSize: "clamp(42px, 6vw, 76px)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#1A1712",
              margin: 0,
            }}
          >
            Meet your
            <br />
            subscription assistant.
          </h2>

          <p
            style={{
              marginTop: "24px",
              fontSize: "18px",
              lineHeight: 1.6,
              color: "#7C766C",
              maxWidth: "600px",
            }}
          >
            Ask questions about your subscriptions,
            upcoming payments and spending. You can
            type or simply talk to Subscrr.
          </p>
        </div>

        {/* Assistant Card */}

        <div
          className="assistant-card"
          style={{
            background: "#14141A",
            borderRadius: "32px",
            padding: "28px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Messages */}

          <div
            ref={messagesContainerRef}
            style={{
              minHeight: "360px",
              maxHeight: "500px",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "10px",
              marginBottom: "20px",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              scrollbarGutter: "stable",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "assistant-message-user"
                    : "assistant-message-ai"
                }
                style={{
                  display: "flex",
                  justifyContent:
                    message.role === "user"
                      ? "flex-end"
                      : "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "14px 18px",
                    borderRadius: "18px",
                    background:
                      message.role === "user"
                        ? "#FF2500"
                        : "#24242B",
                    color: "#FFFFFF",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                className="assistant-message-ai"
                style={{
                  color: "#A8A49D",
                  padding: "12px",
                }}
              >
                Subscrr is thinking
                <span className="thinking-dot">.</span>
                <span className="thinking-dot">.</span>
                <span className="thinking-dot">.</span>
              </div>
            )}
          </div>

          {/* Speech Controls */}

          {speaking && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginBottom: "18px",
                flexWrap: "wrap",
              }}
            >
              {/* Pause / Resume */}

              <button
                type="button"
                onClick={toggleSpeech}
                className={`assistant-speech-control ${
                  !speechPaused
                    ? "assistant-speech-active"
                    : ""
                }`}
                aria-label={
                  speechPaused
                    ? "Resume AI speaking"
                    : "Pause AI speaking"
                }
                style={{
                  height: "40px",
                  borderRadius: "999px",
                  border: "1px solid #393941",
                  background: "#202027",
                  color: "#FFFFFF",
                  padding: "0 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                  }}
                >
                  {speechPaused ? "▶" : "Ⅱ"}
                </span>

                {speechPaused
                  ? "Resume Speaking"
                  : "Pause Speaking"}
              </button>

              {/* Stop */}

              <button
                type="button"
                onClick={stopSpeaking}
                className="assistant-speech-control"
                aria-label="Stop AI speaking"
                style={{
                  height: "40px",
                  borderRadius: "999px",
                  border: "1px solid #393941",
                  background: "#202027",
                  color: "#D8D5CE",
                  padding: "0 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                  }}
                >
                  ■
                </span>

                Stop
              </button>
            </div>
          )}

          {/* Suggested Questions */}

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() =>
                  sendMessage(question, false)
                }
                disabled={loading}
                className="assistant-suggestion"
                style={{
                  border: "1px solid #393941",
                  background: "transparent",
                  color: "#D8D5CE",
                  borderRadius: "999px",
                  padding: "9px 13px",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "13px",
                }}
              >
                {question}
              </button>
            ))}
          </div>

          {/* Input */}

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder={
                listening
                  ? "Listening..."
                  : "Ask Subscrr anything..."
              }
              disabled={loading || listening}
              style={{
                flex: 1,
                minWidth: 0,
                border: "1px solid #393941",
                background: "#202027",
                color: "#FFFFFF",
                borderRadius: "16px",
                padding: "15px 16px",
                outline: "none",
              }}
            />

            {/* Mic */}

            <button
              type="button"
              onClick={startListening}
              disabled={loading}
              aria-label={
                listening
                  ? "Stop listening"
                  : "Start voice input"
              }
              className={`assistant-mic ${
                listening
                  ? "assistant-mic-listening"
                  : ""
              }`}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "1px solid #393941",
                background: listening
                  ? "#FF2500"
                  : "#202027",
                color: "#FFFFFF",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                fontSize: "20px",
              }}
            >
              {listening ? "■" : "🎤"}
            </button>

            {/* Send */}

            <button
              type="submit"
              disabled={
                loading ||
                listening ||
                !input.trim()
              }
              className="assistant-send"
              style={{
                height: "48px",
                borderRadius: "14px",
                border: "none",
                padding: "0 20px",
                background: "#FF2500",
                color: "#FFFFFF",
                fontWeight: 600,
                cursor:
                  loading ||
                  listening ||
                  !input.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  loading ||
                  listening ||
                  !input.trim()
                    ? 0.55
                    : 1,
              }}
            >
              Send
            </button>
          </form>

          {/* Voice status */}

          <p
            style={{
              color: "#77747D",
              fontSize: "12px",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            {listening
              ? "Listening… your message will be sent automatically"
              : speaking
              ? speechPaused
                ? "AI speaking is paused"
                : "Subscrr is speaking…"
              : "Type a message or tap the microphone to talk"}
          </p>
        </div>
      </div>
    </section>
  );
}