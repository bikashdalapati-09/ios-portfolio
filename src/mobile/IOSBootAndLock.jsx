import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import mobileWallpaper from "../assets/mob-wall.jpeg";
import faceIdVideo from "../assets/face-id.webm";
import siriVideo from "../assets/siri1.webm";
import HomeScreenGrid from "./HomeScreenGrid";
import LockScreen from "./LockScreen";
import AppModal from "./AppModal";
import { aiService } from "../service/aiService";

const SignalBarsIcon = () => (
  <svg className="w-[17px] h-[11px] shrink-0" viewBox="0 0 17 11" fill="none">
    <rect x="0" y="7" width="2.8" height="4" rx="0.8" fill="#FFFFFF" />
    <rect x="4.2" y="4.5" width="2.8" height="6.5" rx="0.8" fill="#FFFFFF" />
    <rect x="8.4" y="2" width="2.8" height="9" rx="0.8" fill="#FFFFFF" />
    <rect x="12.6" y="0" width="2.8" height="11" rx="0.8" fill="#FFFFFF" fillOpacity="0.3" />
  </svg>
);

const BatteryPillIcon = ({ level, isCharging }) => {
  const clampedLevel = Math.min(Math.max(level, 0), 100);

  return (
    <div className="flex items-center gap-[1.5px] shrink-0 select-none">
      <div className="relative w-[27px] h-[13px] rounded-[4.5px] p-[1px] flex items-center justify-start overflow-hidden bg-white/20 backdrop-blur-md">
        <div
          className={`h-full rounded-[2.5px] transition-all duration-300 ${
            isCharging
              ? "bg-[#34C759]"
              : clampedLevel <= 20
              ? "bg-[#FF3B30]"
              : "bg-white"
          }`}
          style={{ width: `${clampedLevel}%` }}
        />

        <div className="absolute inset-0 flex items-center justify-center gap-[1px] px-0.5 pointer-events-none">
          {isCharging ? (
            <svg className="w-2.5 h-2.5 fill-white drop-shadow-sm" viewBox="0 0 24 24">
              <path d="M13 2L3 14h7v8l10-12h-7z" />
            </svg>
          ) : (
            <span className="text-[8.5px] font-bold tracking-tight leading-none text-white drop-shadow-sm">
              {clampedLevel}
            </span>
          )}
        </div>
      </div>
      <div className="w-[1.5px] h-[4px] rounded-r-[1px] bg-white/40" />
    </div>
  );
};

export default function IosBootAndLock({ onUnlock }) {
  const [screenState, setScreenState] = useState("booting");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [passcode, setPasscode] = useState([]);
  const [isFaceIdActive, setIsFaceIdActive] = useState(false);
  const [isSwipingUp, setIsSwipingUp] = useState(false);
  const [activeApp, setActiveApp] = useState(null);

  // --- SIRI & VOICE ASSISTANT STATE ---
  const [isSiriActive, setIsSiriActive] = useState(false);
  const [siriTranscript, setSiriTranscript] = useState("");
  const [streamedResponse, setStreamedResponse] = useState("");
  const [isListeningForQuery, setIsListeningForQuery] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);

  // --- REFS ---
  const videoRef = useRef(null);
  const wakeWordRef = useRef(null);
  const queryRecognitionRef = useRef(null);
  const streamIntervalRef = useRef(null);
  const isStoppingRef = useRef(false);

  const activeStateRef = useRef({ isSiriActive, isListeningForQuery });
  useEffect(() => {
    activeStateRef.current = { isSiriActive, isListeningForQuery };
  }, [isSiriActive, isListeningForQuery]);

  // Load and refresh voices dynamically
  const loadAndSetVoices = () => {
    if (!("speechSynthesis" in window)) return [];
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);
    return voices;
  };

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    loadAndSetVoices();
    window.speechSynthesis.onvoiceschanged = loadAndSetVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Dedicated helper to pick the optimal female voice
  const getBestFemaleVoice = (voicesList) => {
    const list = voicesList && voicesList.length > 0 ? voicesList : loadAndSetVoices();
    if (!list || list.length === 0) return null;

    // Direct female voice lookup (Siri, Samantha, Victoria, Zira, Karen, Google US English)
    const femaleVoice =
      list.find(
        (voice) =>
          voice.lang.startsWith("en") &&
          (voice.name.includes("Samantha") ||
            voice.name.includes("Karen") ||
            voice.name.includes("Zira") ||
            voice.name.includes("Victoria") ||
            voice.name.includes("Siri") ||
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("google us english"))
      ) ||
      list.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) ||
      list.find((v) => v.lang.startsWith("en"));

    return femaleVoice || list[0];
  };

  // --- BATTERY STATUS API SYNC ---
  useEffect(() => {
    let batteryObj = null;

    const handleBatteryUpdate = (battery) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    if ("getBattery" in navigator) {
      navigator
        .getBattery()
        .then((battery) => {
          batteryObj = battery;
          handleBatteryUpdate(battery);

          const onLevelChange = () => handleBatteryUpdate(battery);
          const onChargingChange = () => handleBatteryUpdate(battery);

          battery.addEventListener("levelchange", onLevelChange);
          battery.addEventListener("chargingchange", onChargingChange);

          batteryObj._cleanup = () => {
            battery.removeEventListener("levelchange", onLevelChange);
            battery.removeEventListener("chargingchange", onChargingChange);
          };
        })
        .catch(() => {});
    }

    return () => {
      if (batteryObj && batteryObj._cleanup) {
        batteryObj._cleanup();
      }
    };
  }, []);

  useEffect(() => {
    if (screenState !== "booting") return;
    const timer = setTimeout(() => setScreenState("lockscreen"), 1200);
    return () => clearTimeout(timer);
  }, [screenState]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- FACE ID TRIGGER ---
  useEffect(() => {
    if (!isFaceIdActive) return;

    if (videoRef.current) {
      videoRef.current.playbackRate = 1.8;
    }

    const faceIdTimer = setTimeout(() => {
      handleFaceIdEnd();
    }, 1200);

    return () => clearTimeout(faceIdTimer);
  }, [isFaceIdActive]);

  // --- BACKGROUND "HEY SIRI" WAKE-WORD LISTENER ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const wakeWordRec = new SpeechRecognition();
    wakeWordRec.continuous = true;
    wakeWordRec.interimResults = true;
    wakeWordRec.lang = "en-US";

    wakeWordRec.onstart = () => {
      isStoppingRef.current = false;
    };

    wakeWordRec.onresult = (event) => {
      if (activeStateRef.current.isSiriActive) return;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();

        if (transcript.includes("hey siri") || transcript.includes("siri")) {
          isStoppingRef.current = true;
          try {
            wakeWordRec.stop();
          } catch (e) {}
          triggerSiri();
          break;
        }
      }
    };

    wakeWordRec.onerror = (e) => {
      if (e.error === "aborted") return;
    };

    wakeWordRec.onend = () => {
      const { isSiriActive, isListeningForQuery } = activeStateRef.current;

      if (!isSiriActive && !isListeningForQuery && !isStoppingRef.current) {
        setTimeout(() => {
          try {
            wakeWordRec.start();
          } catch (e) {}
        }, 300);
      }
    };

    try {
      wakeWordRec.start();
    } catch (e) {}

    wakeWordRef.current = wakeWordRec;

    return () => {
      isStoppingRef.current = true;
      if (wakeWordRef.current) {
        try {
          wakeWordRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // --- ACTIVE SIRI QUERY LISTENER ---
  const startQueryRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      streamTextAndSpeak("Speech recognition is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (wakeWordRef.current) {
      isStoppingRef.current = true;
      try {
        wakeWordRef.current.stop();
      } catch (e) {}
    }

    if (queryRecognitionRef.current) {
      try {
        queryRecognitionRef.current.stop();
      } catch (e) {}
    }

    setTimeout(() => {
      const queryRec = new SpeechRecognition();
      queryRec.continuous = false;
      queryRec.interimResults = true;
      queryRec.lang = "en-US";

      setSiriTranscript("");
      setStreamedResponse("");

      queryRec.onstart = () => {
        setIsListeningForQuery(true);
      };

      queryRec.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece;
          } else {
            interimTranscript += piece;
          }
        }

        const liveText = finalTranscript || interimTranscript;
        setSiriTranscript(liveText);

        const latestResult = event.results[event.results.length - 1];
        if (latestResult?.isFinal) {
          setIsListeningForQuery(false);
          processAIQuery(liveText);
        }
      };

      queryRec.onerror = (e) => {
        if (e.error === "aborted") return;
        setIsListeningForQuery(false);

        if (e.error === "no-speech") {
          streamTextAndSpeak("I didn't hear anything. Try speaking again.");
        } else if (e.error === "not-allowed") {
          streamTextAndSpeak("Microphone access was denied.");
        }
      };

      queryRec.onend = () => {
        setIsListeningForQuery(false);
      };

      queryRecognitionRef.current = queryRec;

      try {
        queryRec.start();
      } catch (e) {
        setIsListeningForQuery(false);
      }
    }, 350);
  };

  const triggerSiri = () => {
    if (isFaceIdActive) return;
    setIsSiriActive(true);
    setSiriTranscript("");
    setStreamedResponse("");
    startQueryRecognition();
  };

  const closeSiri = () => {
    setIsSiriActive(false);
    setIsListeningForQuery(false);
    setSiriTranscript("");
    setStreamedResponse("");

    if (queryRecognitionRef.current) {
      try {
        queryRecognitionRef.current.stop();
      } catch (e) {}
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    isStoppingRef.current = false;
    if (wakeWordRef.current) {
      setTimeout(() => {
        try {
          wakeWordRef.current.start();
        } catch (e) {}
      }, 400);
    }
  };

  // --- AI STREAMING RESPONSE & SPEECH SYNTHESIS ---
  const processAIQuery = async (query) => {
    if (!query.trim()) return;
    try {
      const reply = await aiService(query);

      let rawText = "";
      if (typeof reply === "string") {
        rawText = reply;
      } else if (reply && typeof reply === "object") {
        rawText = reply.text || reply.response || reply.message || JSON.stringify(reply);
      } else {
        rawText = String(reply || "");
      }

      streamTextAndSpeak(rawText || "I couldn't process that response.");
    } catch (err) {
      streamTextAndSpeak("Sorry, I ran into an issue connecting.");
    }
  };

  const streamTextAndSpeak = (fullText) => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    setStreamedResponse("");
    let currentIdx = 0;

    const safeText = String(fullText || "").replace(/[ \t]+/g, " ").trim();
    const words = safeText.split(" ");

    streamIntervalRef.current = setInterval(() => {
      if (currentIdx < words.length) {
        const nextWord = words[currentIdx];
        if (nextWord !== undefined) {
          setStreamedResponse((prev) =>
            prev ? `${prev} ${nextWord}` : nextWord
          );
        }
        currentIdx++;
      } else {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
    }, 60);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      // Clean speech text by removing Markdown elements
      const cleanSpeechText = safeText
        .replace(/https?:\/\/\S+/g, "")
        .replace(/[*_#`~>]/g, "")
        .replace(/[-+*]\s+/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      const chosenVoice = getBestFemaleVoice(availableVoices);

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.pitch = 1.05; // Slightly elevated pitch for natural Siri voice
      utterance.rate = 1.0;

      utterance.onend = () => {
        if (activeStateRef.current.isSiriActive) {
          startQueryRecognition();
        }
      };

      utterance.onerror = () => {
        if (activeStateRef.current.isSiriActive) {
          startQueryRecognition();
        }
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } else {
      setTimeout(() => {
        if (activeStateRef.current.isSiriActive) {
          startQueryRecognition();
        }
      }, words.length * 200 + 1000);
    }
  };

  const hours = currentTime.getHours() % 12 || 12;
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}`;

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const triggerSwipeUpToUnlock = () => {
    if (isFaceIdActive) return;
    setIsSwipingUp(true);
    setIsFaceIdActive(true);
  };

  const handleFaceIdEnd = () => {
    setIsFaceIdActive(false);
    setIsSwipingUp(false);
    setScreenState("passcode");
  };

  const handleKeyClick = (num) => {
    if (passcode.length < 4) {
      const nextPasscode = [...passcode, num];
      setPasscode(nextPasscode);

      if (nextPasscode.length === 4) {
        setTimeout(() => {
          setScreenState("homescreen");
          if (onUnlock) onUnlock();
        }, 200);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-0 sm:p-4 overflow-hidden select-none">
      <div className="relative w-full sm:w-[390px] h-screen sm:h-[844px] sm:rounded-[48px] bg-black shadow-2xl overflow-hidden border-0 outline-none">
        <div className="relative w-full h-full sm:rounded-[46px] text-white font-sans overflow-hidden bg-black">
          {/* WALLPAPER LAYER */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out"
            style={{
              backgroundImage: `url(${mobileWallpaper})`,
              filter:
                screenState === "homescreen"
                  ? "blur(20px) brightness(0.9)"
                  : "none",
              transform: screenState === "homescreen" ? "scale(1.1)" : "scale(1)",
            }}
          />

          {/* STATUS BAR & DYNAMIC ISLAND */}
          {screenState !== "booting" && (
            <div className="absolute top-0 inset-x-0 z-50 flex justify-between items-center px-7 pt-3.5 text-white pointer-events-none">
              <span className="text-[15px] font-semibold tracking-tight text-white/95 pointer-events-auto">
                {formattedTime}
              </span>

              {/* DYNAMIC ISLAND */}
              <div
                onClick={triggerSiri}
                className={`absolute left-1/2 -translate-x-1/2 bg-black flex items-center justify-center overflow-hidden z-50 border border-white/10 shadow-lg pointer-events-auto cursor-pointer ${
                  isFaceIdActive
                    ? "top-2 w-[125px] h-[125px] rounded-[38px]"
                    : "top-2.5 w-[120px] h-[35px] rounded-full"
                }`}
              >
                {/* FACE ID CAMERA ANIMATION */}
                {isFaceIdActive && (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-[38px]">
                    <video
                      ref={videoRef}
                      src={faceIdVideo}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                <SignalBarsIcon />
                <span className="text-[12px] font-bold tracking-tight text-white/95 -ml-0.5">
                  5G
                </span>
                <BatteryPillIcon level={batteryLevel} isCharging={isCharging} />
              </div>
            </div>
          )}

          {/* SIRI FLOATING ANIMATION & GLASS RESULT CARD */}
          <AnimatePresence>
            {isSiriActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={closeSiri}
                className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex flex-col justify-end items-center pb-10 px-6 cursor-pointer"
              >
                {/* Glassmorphic Streamed Result Card */}
                {(isListeningForQuery || siriTranscript || streamedResponse) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      startQueryRecognition();
                    }}
                    className="w-full bg-black/30 backdrop-blur-md border border-white/20 rounded-3xl p-5 text-center shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] mb-6 pointer-events-auto relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

                    {/* Live Transcript Display */}
                    {siriTranscript ? (
                      <p className="text-xs font-semibold tracking-wide text-white/70 uppercase mb-2">
                        "{siriTranscript}"
                      </p>
                    ) : (
                      isListeningForQuery && (
                        <p className="text-xs text-white/80 italic mb-1 animate-pulse">
                          Listening... speak now
                        </p>
                      )
                    )}

                    {/* AI Output Display */}
                    {streamedResponse ? (
                      <p className="text-base font-medium text-white leading-relaxed tracking-tight drop-shadow-sm whitespace-pre-wrap">
                        {streamedResponse}
                      </p>
                    ) : (
                      !isListeningForQuery &&
                      siriTranscript && (
                        <div className="flex items-center justify-center gap-1 py-1">
                          <span className="w-2 h-2 rounded-full bg-white/80 animate-ping" />
                          <p className="text-xs text-white/70 font-medium">
                            Thinking...
                          </p>
                        </div>
                      )
                    )}
                  </motion.div>
                )}

                {/* Floating Siri Orb */}
                <motion.div
                  initial={{ scale: 0.2, y: 30, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.2, y: 30, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    startQueryRecognition();
                  }}
                  className="relative w-24 h-24 rounded-full overflow-hidden flex items-center justify-center pointer-events-auto drop-shadow-[0_0_35px_rgba(168,85,247,0.75)] cursor-pointer"
                >
                  <video
                    src={siriVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover pointer-events-none scale-125"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 1. APPLE BOOT SCREEN */}
          {screenState === "booting" && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6">
              <img src={logo} alt="Apple Logo" className="w-16 h-16 object-contain" />
              <div className="w-36 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          )}

          {/* 2. iOS LOCK SCREEN */}
          <AnimatePresence>
            {screenState === "lockscreen" && (
              <motion.div
                key="lockscreen"
                className="absolute inset-0 z-30 w-full h-full cursor-grab active:cursor-grabbing touch-none"
                drag={isSwipingUp ? false : "y"}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                animate={
                  isSwipingUp
                    ? { y: "-100%", opacity: 0 }
                    : { y: "0%", opacity: 1 }
                }
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -40 || info.velocity.y < -150) {
                    triggerSwipeUpToUnlock();
                  }
                }}
              >
                <LockScreen
                  formattedDate={formattedDate}
                  formattedTime={formattedTime}
                  onUnlockSwipe={triggerSwipeUpToUnlock}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. PASSCODE SCREEN */}
          {screenState === "passcode" && (
            <div className="relative z-30 h-full flex flex-col justify-between pt-20 pb-8 px-8 backdrop-blur-3xl bg-black/50">
              <div className="flex flex-col items-center mt-2">
                <h2 className="text-[20px] font-semibold text-white/95 tracking-wide mb-5">
                  Enter Passcode
                </h2>

                <div className="flex gap-4 mb-6">
                  {[0, 1, 2, 3].map((idx) => (
                    <div
                      key={idx}
                      className={`w-[13px] h-[13px] rounded-full transition-all duration-150 ${
                        passcode.length > idx
                          ? "bg-white border-2 border-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          : "border-2 border-white/80 bg-transparent"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[12px] font-semibold text-white/90 tracking-wide text-center">
                  Hint: Enter any 4 digit to unlock
                </p>
              </div>

              <div className="grid grid-cols-3 gap-y-4 gap-x-6 max-w-[250px] mx-auto my-auto">
                {[
                  { num: "1", sub: "" },
                  { num: "2", sub: "A B C" },
                  { num: "3", sub: "D E F" },
                  { num: "4", sub: "G H I" },
                  { num: "5", sub: "J K L" },
                  { num: "6", sub: "M N O" },
                  { num: "7", sub: "P Q R S" },
                  { num: "8", sub: "T U V" },
                  { num: "9", sub: "W X Y Z" },
                ].map((btn) => (
                  <button
                    key={btn.num}
                    onClick={() => handleKeyClick(btn.num)}
                    className="w-18 h-18 rounded-full bg-white/10 active:bg-white/30 border-0 backdrop-blur-xl flex flex-col items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span className="text-2xl font-light text-white leading-none">
                      {btn.num}
                    </span>
                    {btn.sub && (
                      <span className="text-[8px] font-semibold tracking-widest text-white/60 mt-0.5">
                        {btn.sub}
                      </span>
                    )}
                  </button>
                ))}

                <div className="col-start-2 flex justify-center">
                  <button
                    onClick={() => handleKeyClick("0")}
                    className="w-18 h-18 rounded-full bg-white/10 active:bg-white/30 border-0 backdrop-blur-xl flex items-center justify-center text-2xl font-light text-white shadow-md active:scale-95 cursor-pointer"
                  >
                    0
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-medium text-white/80 px-2 mb-2">
                <button
                  onClick={() => alert("Emergency Call Dialed")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Emergency
                </button>
                <button
                  onClick={() => {
                    setPasscode([]);
                    setIsSwipingUp(false);
                    setScreenState("lockscreen");
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 4. iOS HOME SCREEN */}
          {screenState === "homescreen" && (
            <motion.div
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative z-30 h-full w-full flex flex-col justify-between pt-10 pb-4 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto pt-4">
                <HomeScreenGrid setActiveApp={setActiveApp} />
              </div>

              <AnimatePresence>
                {activeApp && (
                  <AppModal
                    activeApp={activeApp}
                    onClose={() => setActiveApp(null)}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}