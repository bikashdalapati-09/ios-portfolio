import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IosBootAndLock from "./mobile/IOSBootAndLock";
import HomeScreenGrid from "./mobile/HomeScreenGrid";
import AppModal from "./mobile/AppModal";
import mobileWallpaper from "./assets/mob-wall.jpeg";
import siriVideo from "./assets/siri1.webm";
import { aiService } from "./service/aiService";

// --- iOS SIGNAL BARS ICON ---
const SignalBarsIcon = () => (
  <svg className="w-[17px] h-[11px] shrink-0" viewBox="0 0 17 11" fill="none">
    <rect x="0" y="7" width="2.8" height="4" rx="0.8" fill="#FFFFFF" />
    <rect x="4.2" y="4.5" width="2.8" height="6.5" rx="0.8" fill="#FFFFFF" />
    <rect x="8.4" y="2" width="2.8" height="9" rx="0.8" fill="#FFFFFF" />
    <rect
      x="12.6"
      y="0"
      width="2.8"
      height="11"
      rx="0.8"
      fill="#FFFFFF"
      fillOpacity="0.3"
    />
  </svg>
);

// --- iOS BATTERY PILL ICON ---
const BatteryPillIcon = ({ level, isCharging }) => {
  const getFillColor = () => {
    if (isCharging) return "bg-[#34C759]";
    if (level <= 20) return "bg-[#FF3B30]";
    return "bg-white";
  };

  const getCapColor = () => {
    if (isCharging) return "bg-[#34C759]";
    if (level <= 20) return "bg-[#FF3B30]";
    return "bg-white/40";
  };

  return (
    <div className="flex items-center gap-[1.5px] shrink-0 select-none">
      <div className="relative w-[27px] h-[13px] rounded-[4.5px] p-[1px] flex items-center justify-between overflow-hidden transition-colors duration-300 bg-white/20 backdrop-blur-md border border-white/10">
        <div
          className={`h-full rounded-[3px] transition-all duration-300 ${getFillColor()}`}
          style={{ width: `${Math.max(level, 10)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-[0.5px] px-0.5 pointer-events-none">
          <span
            className={`text-[8.5px] font-bold tracking-tight leading-none ${
              isCharging || level <= 20
                ? "text-white drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.5)]"
                : level > 50
                  ? "text-black mix-blend-difference"
                  : "text-white"
            }`}
          >
            {level}
          </span>
          {isCharging && (
            <svg
              className="w-2 h-2.5 text-white fill-current drop-shadow-[0_0.5px_1px_rgba(0,0,0,0.5)] -ml-[0.5px]"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h7v8l10-12h-7z" />
            </svg>
          )}
        </div>
      </div>
      <div
        className={`w-[1.5px] h-[4px] rounded-r-[1px] transition-colors duration-300 ${getCapColor()}`}
      />
    </div>
  );
};

const SearchIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-white/80"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
  </svg>
);

const DOCK_APPS = [
  {
    id: "phone",
    imgSrc:
      "https://cdn.iconscout.com/icon/free/png-256/free-apple-phone-icon-svg-download-png-493154.png?f=webp",
    badge: 52,
  },
  {
    id: "messages",
    imgSrc:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/IMessage_logo.svg",
    badge: 433,
  },
  {
    id: "camera",
    imgSrc:
      "https://cdn.iconscout.com/icon/free/png-256/free-apple-camera-icon-svg-download-png-493147.png?f=webp",
  },
  {
    id: "music",
    imgSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/500px-Apple_Music_icon.svg.png",
  },
];

export default function Mobile() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeApp, setActiveApp] = useState(null);

  const [batteryLevel, setBatteryLevel] = useState(90);
  const [isCharging, setIsCharging] = useState(false);
  const [isSiriActive, setIsSiriActive] = useState(false);
  const [siriTranscript, setSiriTranscript] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isListeningForQuery, setIsListeningForQuery] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const recognitionRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const autoCloseTimeoutRef = useRef(null);

  // Synchronize available browser voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Dedicated speech handler (optimized specifically for voice output)
  const speakFemaleVoice = (text, onEndCallback) => {
    if (!("speechSynthesis" in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();

    // DIFFERENCE FOR VOICE: Strip formatting syntax so Siri speaks naturally
    const cleanSpeechText = text
      .replace(/https?:\/\/\S+/g, "") // Remove URLs
      .replace(/[*_#`~>]/g, "")       // Strip Markdown symbols
      .replace(/[-+*]\s+/g, "")       // Strip list bullets
      .replace(/\s+/g, " ")           // Normalize whitespace
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);

    const femaleVoice = availableVoices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          v.name.includes("Karen") ||
          v.name.includes("Zira") ||
          v.name.includes("Female") ||
          v.name.toLowerCase().includes("google us english"))
    );

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    utterance.pitch = 1.0;
    utterance.rate = 1.0;

    let executed = false;
    const handleEnd = () => {
      if (!executed) {
        executed = true;
        if (onEndCallback) onEndCallback();
      }
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 60);
  };

  useEffect(() => {
    let batteryObj = null;

    const updateBattery = (battery) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    const handleLevelChange = () => batteryObj && updateBattery(batteryObj);
    const handleChargingChange = () => batteryObj && updateBattery(batteryObj);

    if ("getBattery" in navigator) {
      navigator.getBattery().then((battery) => {
        batteryObj = battery;
        updateBattery(battery);

        battery.addEventListener("levelchange", handleLevelChange);
        battery.addEventListener("chargingchange", handleChargingChange);
      });
    }

    return () => {
      if (batteryObj) {
        batteryObj.removeEventListener("levelchange", handleLevelChange);
        batteryObj.removeEventListener("chargingchange", handleChargingChange);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListeningForQuery(true);
    };

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      const latestResult = event.results[event.results.length - 1];
      if (latestResult?.isFinal) {
        const cleanedQuery = text
          .trim()
          .replace(/^(hey siri|siri)\b/i, "")
          .trim();

        setSiriTranscript(cleanedQuery || text.trim());
        setIsListeningForQuery(false);
        processAIQuery(cleanedQuery || text.trim());
      }
    };

    recognition.onerror = (event) => {
      setIsListeningForQuery(false);
      const errMsg =
        event.error === "no-speech"
          ? "I didn't hear anything. Try speaking again."
          : "Voice recognition failed.";
      setStreamedResponse(errMsg);
      speakFemaleVoice(errMsg, () => {
        autoCloseTimeoutRef.current = setTimeout(closeSiri, 1500);
      });
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      window.speechSynthesis?.cancel();
    };
  }, [availableVoices]);

  // DIFFERENCE FOR TEXT DISPLAY: Stream words while keeping spaces & commas intact
  const processAIQuery = async (query) => {
    if (!query.trim()) {
      closeSiri();
      return;
    }

    setStreamedResponse("");
    try {
      const rawReply = await aiService(query);
      const fullReply = rawReply || "How can I help you today?";

      const displayText = fullReply.replace(/[ \t]+/g, " ").trim();
      const words = displayText.split(" ");

      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }

      let currentIndex = 0;
      streamIntervalRef.current = setInterval(() => {
        if (currentIndex >= words.length) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
          return;
        }

        const nextWord = words[currentIndex];
        if (nextWord !== undefined) {
          setStreamedResponse((prev) =>
            prev ? `${prev} ${nextWord}` : nextWord
          );
        }
        currentIndex += 1;
      }, 70);

      // Trigger Voice Playback separately using the cleaned speech payload
      speakFemaleVoice(displayText, () => {
        autoCloseTimeoutRef.current = setTimeout(() => {
          closeSiri();
        }, 1200);
      });
    } catch {
      const errorReply = "Sorry, I ran into an issue connecting.";
      setStreamedResponse(errorReply);
      speakFemaleVoice(errorReply, () => {
        autoCloseTimeoutRef.current = setTimeout(closeSiri, 1500);
      });
    }
  };

  const closeSiri = () => {
    setIsSiriActive(false);
    setIsListeningForQuery(false);
    setSiriTranscript("");
    setStreamedResponse("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
      autoCloseTimeoutRef.current = null;
    }
  };

  const triggerSiri = () => {
    if (isSiriActive) {
      closeSiri();
      return;
    }

    if ("speechSynthesis" in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    setIsSiriActive(true);
    setSiriTranscript("");
    setStreamedResponse("");

    try {
      recognitionRef.current?.start();
    } catch {
      setIsListeningForQuery(false);
    }
  };

  const hours = currentTime.getHours() % 12 || 12;
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none">
      {!isUnlocked ? (
        <IosBootAndLock onUnlock={() => setIsUnlocked(true)} />
      ) : (
        <div className="relative w-full sm:w-[390px] h-screen sm:h-[844px] sm:rounded-[50px] bg-black shadow-2xl overflow-hidden border-0 outline-none flex flex-col justify-start">
          {/* iOS Blurred Background */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${mobileWallpaper})`,
              filter: "blur(25px) brightness(0.92)",
            }}
          />

          {/* MAIN HOME GRID CONTENT */}
          <div className="mt-12 flex-1 overflow-y-auto">
            <HomeScreenGrid setActiveApp={setActiveApp} />
          </div>

          {/* BOTTOM SEARCH PILL & DOCK */}
          <div className="relative z-30 pb-2 px-5 flex flex-col items-center mt-auto">
            <div className="bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10 cursor-pointer active:scale-95 transition-transform mb-3">
              <SearchIcon />
              <span className="text-[12px] font-medium text-white/90 tracking-tight">
                Search
              </span>
            </div>

            <div className="w-full bg-white/20 backdrop-blur-3xl rounded-[38px] p-3.5 flex justify-between items-center border border-white/20 shadow-2xl px-5">
              {DOCK_APPS.map((dockApp) => (
                <div
                  key={dockApp.id}
                  className="relative cursor-pointer active:scale-90 transition-transform duration-150"
                  onClick={() => setActiveApp(dockApp.id)}
                >
                  <div className="relative w-[62px] h-[62px] [clip-path:inset(0_round_22.5%)] flex items-center justify-center overflow-hidden">
                    {dockApp.imgSrc ? (
                      <img
                        src={dockApp.imgSrc}
                        alt={dockApp.id}
                        className="w-full h-full object-cover scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-700/80 flex items-center justify-center">
                        <span className="text-[12px] text-white/80 font-semibold uppercase tracking-wider">
                          {dockApp.id.substring(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {dockApp.badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF3B30] text-white text-[11px] font-bold px-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center border-2 border-white/20 shadow-md z-10">
                      {dockApp.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="w-36 h-1 bg-white/90 rounded-full mt-3 mb-1" />
          </div>

          {/* APP OVERLAY MODAL */}
          <AnimatePresence>
            {activeApp && (
              <AppModal
                activeApp={activeApp}
                onClose={() => setActiveApp(null)}
              />
            )}
          </AnimatePresence>

          {/* TOP STATUS BAR & DYNAMIC ISLAND */}
          <div className="absolute top-0 inset-x-0 z-50 flex justify-between items-center px-7 pt-3.5 pb-1 text-white pointer-events-none">
            <span className="text-[15px] font-semibold tracking-tight text-white/95 pointer-events-auto">
              {formattedTime}
            </span>

            <button
              onClick={triggerSiri}
              title="Activate Siri"
              type="button"
              className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[120px] h-[35px] bg-black rounded-full z-50 cursor-pointer active:scale-95 transition-transform pointer-events-auto shadow-md"
            >
              <span className="absolute right-[38px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] bg-[#FF9500] rounded-full shadow-[0_0_4px_rgba(255,149,0,0.6)]" />
            </button>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <SignalBarsIcon />
              <span className="text-[12px] font-semibold tracking-tight text-white/95">
                5G
              </span>
              <BatteryPillIcon level={batteryLevel} isCharging={isCharging} />
            </div>
          </div>

          {/* SIRI OVERLAY */}
          <AnimatePresence>
            {isSiriActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSiri}
                className="absolute inset-0 z-50 bg-black/20 flex flex-col justify-end items-center px-4 pb-8 cursor-pointer pointer-events-auto"
              >
                {/* Floating Response Card */}
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[350px] bg-white/20 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl mb-3 pointer-events-auto select-none max-h-[220px] overflow-y-auto"
                >
                  {Boolean(siriTranscript) && (
                    <p className="text-[13px] font-medium tracking-tight text-white/70 mb-1 line-clamp-1">
                      "{siriTranscript}"
                    </p>
                  )}

                  <p className="text-[15px] font-bold text-white leading-snug whitespace-pre-wrap">
                    {isListeningForQuery
                      ? "Listening..."
                      : streamedResponse || "Thinking..."}
                  </p>
                </motion.div>

                {/* Siri Glowing Orb */}
                <motion.div
                  initial={{ scale: 0.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.2, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-24 h-24 rounded-full overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.75)] shrink-0"
                >
                  <video
                    src={siriVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-125"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}