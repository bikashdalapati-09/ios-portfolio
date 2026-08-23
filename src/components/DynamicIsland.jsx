import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import siriWebm from "../assets/siri1.webm";
import { aiService } from "../service/aiService.js";

export default function DynamicIsland({ onSiriClick, appHandlers = {} }) {
  const [isSiriActive, setIsSiriActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputText, setInputText] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const textEndRef = useRef(null);

  // Auto-scroll text view as new words stream in
  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiAnswer]);

  const cleanSpeechText = (text) => {
    if (!text) return "";
    return text
      .replace(/\*.*?\*/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/[*_#~`]/g, "")
      .trim();
  };

  // Select natural female voice prioritizing Hindi when required
  const getFemaleVoice = (isHindi = false) => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();

    if (isHindi) {
      const hindiMatch = voices.find(
        (v) =>
          v.lang.includes("hi") ||
          v.name.includes("Hindi") ||
          v.name.includes("Swara") ||
          v.name.includes("Kalpana")
      );
      if (hindiMatch) return hindiMatch;
    }

    const preferredFemaleVoices = [
      "Samantha",
      "Karen",
      "Google US English",
      "Microsoft Zira",
      "Microsoft Ava",
      "Victoria",
    ];

    for (const name of preferredFemaleVoices) {
      const match = voices.find((v) => v.name.includes(name));
      if (match) return match;
    }

    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Female") || v.name.includes("Woman"))
      ) || null
    );
  };

  // Synchronized word streaming with SpeechSynthesis
  const speakAndStreamText = (text) => {
    if (!("speechSynthesis" in window)) {
      setAiAnswer(text);
      return;
    }

    window.speechSynthesis.cancel();
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    setAiAnswer("");
    setIsSpeaking(true);

    // Detect Devanagari Hindi characters
    const isHindi = /[\u0900-\u097F]/.test(text);

    const words = text.split(" ");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = isHindi ? 0.95 : 1.0;
    utterance.pitch = 1.1;
    utterance.lang = isHindi ? "hi-IN" : "en-US";

    const voice = getFemaleVoice(isHindi);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      let currentWordIndex = 0;
      const intervalTime = isHindi ? 310 : 280;

      streamIntervalRef.current = setInterval(() => {
        currentWordIndex++;
        if (currentWordIndex <= words.length) {
          setAiAnswer(words.slice(0, currentWordIndex).join(" "));
        } else {
          clearInterval(streamIntervalRef.current);
        }
      }, intervalTime);
    };

    utterance.onend = () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setAiAnswer(text);
      setIsSpeaking(false);
      setStatus("Idle");
      setIsSubmitting(false);
      startListening(true);
    };

    utterance.onerror = () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setAiAnswer(text);
      setIsSpeaking(false);
      setStatus("Idle");
      setIsSubmitting(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const processQueryWithAi = async (userQuery) => {
    if (!userQuery.trim()) return;

    setIsSubmitting(true);
    setStatus("Thinking...");

    try {
      const rawResponse = await aiService(userQuery);
      const cleanedResponse =
        cleanSpeechText(rawResponse) || "I couldn't process that.";

      setStatus("Responding...");
      speakAndStreamText(cleanedResponse);
    } catch (err) {
      console.error("Error in processQueryWithAi:", err);
      setStatus("Error processing request");
      setIsSubmitting(false);
    }
  };

  const stopListening = () => {
    activeRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (!recognitionRef.current) return;

    const rec = recognitionRef.current;
    recognitionRef.current = null;

    rec.onstart = null;
    rec.onresult = null;
    rec.onerror = null;
    rec.onend = null;

    try {
      rec.stop();
      rec.abort();
    } catch (error) {}
  };

  const startListening = (wakeWordMode = true) => {
    stopListening();
    activeRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Unsupported Browser");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = !wakeWordMode;
      rec.interimResults = true;
      // en-IN allows seamless listening for both English and Hindi/Hinglish
      rec.lang = "en-IN";

      rec.onstart = () => {
        setStatus(wakeWordMode ? "Listening for 'Hey Siri'..." : "Listening...");
      };

      rec.onresult = (event) => {
        let currentText = "";
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
          if (event.results[i].isFinal) isFinal = true;
        }

        const normalized = currentText.toLowerCase().trim();

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (wakeWordMode) {
          if (normalized.includes("hey siri") || normalized.includes("siri")) {
            setIsSiriActive(true);
            setTranscript("");
            setInputText("");
            setAiAnswer("");
            if (onSiriClick) onSiriClick(true);
            startListening(false);
          }
          return;
        }

        if (currentText) {
          setTranscript(currentText);

          silenceTimerRef.current = setTimeout(() => {
            if (activeRef.current && currentText.trim()) {
              stopListening();
              processQueryWithAi(currentText);
            }
          }, 2500);

          if (isFinal) {
            stopListening();
            processQueryWithAi(currentText);
          }
        }
      };

      rec.onerror = (event) => {
        if (event.error === "no-speech" || event.error === "aborted") {
          if (!wakeWordMode) {
            setStatus("Couldn't hear clearly");
          }
          return;
        }
        setStatus(`Error: ${event.error}`);
      };

      rec.onend = () => {
        if (activeRef.current && wakeWordMode) {
          setTimeout(() => {
            if (activeRef.current) startListening(true);
          }, 300);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (error) {
      setStatus("Error Starting");
    }
  };

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    startListening(true);
    return () => {
      stopListening();
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleSiriToggle = () => {
    const nextState = !isSiriActive;
    setIsSiriActive(nextState);
    setTranscript("");
    setInputText("");
    setAiAnswer("");
    setIsSubmitting(false);
    setIsSpeaking(false);

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (onSiriClick) onSiriClick(nextState);

    if (nextState) {
      startListening(false);
    } else {
      startListening(true);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    stopListening();
    setTranscript(inputText);
    const query = inputText;
    setInputText("");
    processQueryWithAi(query);
  };

  return (
    <>
      <style>{`
        .notch-curves::before, .notch-curves::after {
          content: "";
          position: absolute;
          top: 0;
          width: 16px;
          height: 16px;
          background-color: transparent;
          pointer-events: none;
        }

        .notch-curves::before {
          left: -16px;
          border-top-right-radius: 16px;
          box-shadow: 4px -4px 0 4px black;
        }

        .notch-curves::after {
          right: -16px;
          border-top-left-radius: 16px;
          box-shadow: -4px -4px 0 4px black;
        }

        @keyframes ios-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ios-siri-border::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 32px;
          padding: 1.5px;
          background: linear-gradient(
            90deg,
            rgba(168, 85, 247, 0.6),
            rgba(236, 72, 153, 0.6),
            rgba(59, 130, 246, 0.6),
            rgba(6, 182, 212, 0.6),
            rgba(168, 85, 247, 0.6)
          );
          background-size: 300% 300%;
          animation: ios-glow 4s ease infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 10;
        }

        .water-drop-card {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.22) 0%,
            rgba(255, 255, 255, 0.05) 40%,
            rgba(0, 0, 0, 0.15) 100%
          );
          backdrop-filter: blur(16px) saturate(190%);
          -webkit-backdrop-filter: blur(16px) saturate(190%);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.4),
            inset 0 2px 3px rgba(255, 255, 255, 0.6),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-90 flex justify-center">
        <AnimatePresence mode="wait">
          {!isSiriActive ? (
            <motion.div
              key="notch"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-black text-white flex items-center justify-center relative notch-curves w-[160px] md:w-[200px] h-[32px] md:h-[40px] rounded-b-[18px]"
            >
              <div className="absolute inset-0 flex w-full h-8 z-20">
                <div className="flex-[1.5] cursor-pointer" title="Music & Calendar" />

                <div
                  onClick={handleSiriToggle}
                  className="flex-1 cursor-pointer flex items-center justify-center relative group/lens"
                  title="Tap to Siri"
                >
                  <div className="w-4 h-4 rounded-full bg-[#0a0a0c] border border-neutral-800 flex items-center justify-center relative overflow-hidden">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-sky-950 via-blue-900 to-indigo-950 border border-sky-500/20 flex items-center justify-center">
                      <div className="w-0.5 h-0.5 rounded-full bg-white/50" />
                    </div>
                  </div>
                </div>

                <div className="flex-[1.5] cursor-pointer" title="File Tray" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="siri-card"
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 8 }}
              exit={{ opacity: 0, scale: 0.85, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-[360px] water-drop-card text-white rounded-[32px] p-4 ios-siri-border flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rounded-t-[32px]" />

              <div className="flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-3 pr-2 overflow-hidden w-full">
                  <div className="w-12 h-12 shrink-0 relative flex items-center justify-center overflow-hidden rounded-full border border-white/30 shadow-lg bg-black/40">
                    <video
                      src={siriWebm}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover mix-blend-screen scale-125"
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[15px] font-semibold tracking-tight text-white drop-shadow-md">
                      Siri
                    </span>

                    <span className="text-[13px] text-cyan-200 font-bold drop-shadow-sm truncate">
                      {transcript ? `"${transcript}"` : "Listening..."}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSiriToggle}
                  className="w-7 h-7 shrink-0 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center text-white border border-white/40 shadow-md backdrop-blur-md"
                  aria-label="Close Siri"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Glassmorphic Streaming AI Response Container */}
              <AnimatePresence>
                {aiAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="z-10 relative rounded-2xl bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-md border border-white/15 p-3.5 shadow-inner"
                  >
                    <div className="max-h-36 overflow-y-auto pr-1 text-[13.5px] leading-relaxed tracking-wide text-white/95 font-normal custom-scrollbar">
                      <span>{aiAnswer}</span>
                      {isSpeaking && (
                        <motion.span
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-1.5 h-3.5 ml-1 bg-cyan-400 rounded-full align-middle shadow-[0_0_8px_#22d3ee]"
                        />
                      )}
                      <div ref={textEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input Bar */}
              {!isSubmitting && (
                <form onSubmit={handleTextSubmit} className="z-10 relative flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Siri..."
                    className="w-full bg-black/30 border border-white/20 rounded-full px-3.5 py-1.5 text-[13px] text-white placeholder-white/50 focus:outline-none focus:border-cyan-400/60 focus:bg-black/40 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-7 h-7 shrink-0 rounded-full bg-cyan-500/80 disabled:opacity-30 disabled:bg-white/20 hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center text-white shadow-md"
                    aria-label="Send query"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              )}

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/25 text-[12px] text-white/80 z-10 relative font-medium">
                <span className="tracking-wide text-cyan-300 font-semibold drop-shadow-sm">
                  Status: {status}
                </span>

                <div className="flex gap-1 items-center shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === "Thinking..."
                        ? "bg-amber-400 animate-bounce"
                        : "bg-emerald-400 animate-ping"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}