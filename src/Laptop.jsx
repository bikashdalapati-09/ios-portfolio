import React, { useState, useEffect, useCallback, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import photo from "./assets/wallpaper.jpg";
import helloSvg from "./assets/hello.svg";

import Topbar from "./components/Topbar";
import DesktopIcons from "./components/DesktopIcons";
import Dock from "./components/Dock";

import BootScreen from "./components/BootScreen";
import DesktopWidgets from "./components/DesktopWidgets";
import WindowManager from "./components/WindowManager";
import LockScreen from "./components/LockScreen";

function windowReducer(state, action) {
  switch (action.type) {
    case "OPEN":
      return {
        ...state,
        [action.id]: { isOpen: true, isMinimized: false }
      };
    case "CLOSE":
      return {
        ...state,
        [action.id]: { ...state[action.id], isOpen: false }
      };
    case "MINIMIZE":
      return {
        ...state,
        [action.id]: { ...state[action.id], isMinimized: true }
      };
    default:
      return state;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const TopbarVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 220, damping: 24 } 
  },
};

const widgetVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 15 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 180, damping: 22 } 
  },
};

const iconVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  },
};

const dockVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 180, damping: 20, delay: 0.1 } 
  },
};

const profile = {
  name: "Bikash Dalapati",
  title: "Full-Stack MERN Developer & DSA Problem Solver",
  bio: "Building high-performance web applications and solving complex algorithmic challenges with clean, modern code.",
};

const Laptop = () => {
  const [booting, setBooting] = useState(true);
  const [showHello, setShowHello] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  
  const [windows, dispatch] = useReducer(windowReducer, {});
  const [windowZIndices, setWindowZIndices] = useState({});
  const [nextZIndex, setNextZIndex] = useState(100);

  const [isWifiActive, setIsWifiActive] = useState(true);
  const [isBluetooth, setIsBluetooth] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [finderCategory, setFinderCategory] = useState("recents");

  const hasRequestedFullscreen = useRef(false);

  const triggerFullscreen = () => {
    if (!hasRequestedFullscreen.current && !document.fullscreenElement) {
      hasRequestedFullscreen.current = true;
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => console.log("Fullscreen blocked:", err));
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    }
  };

  const handleUserInteraction = () => {
    triggerFullscreen();
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Optimized Sequence Flow: Booting -> Hello -> LockScreen
  useEffect(() => {
    const bootTimer = setTimeout(() => {
      setBooting(false);
      setShowHello(true);
    }, 1800);

    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (showHello) {
      const helloTimer = setTimeout(() => {
        setShowHello(false);
      }, 4200);

      return () => clearTimeout(helloTimer);
    }
  }, [showHello]);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const bringWindowToFront = useCallback((windowId) => {
    setWindowZIndices((prev) => ({ ...prev, [windowId]: nextZIndex }));
    setNextZIndex((prev) => prev + 1);
  }, [nextZIndex]);

  const getWindowZIndex = useCallback((windowId) => {
    return windowZIndices[windowId] || 40;
  }, [windowZIndices]);

  const openApp = useCallback((appId) => {
    dispatch({ type: "OPEN", id: appId });
    bringWindowToFront(appId);
  }, [bringWindowToFront]);

  const closeApp = useCallback((appId) => {
    dispatch({ type: "CLOSE", id: appId });
  }, []);

  const minimizeApp = useCallback((appId) => {
    dispatch({ type: "MINIMIZE", id: appId });
  }, []);

  const handleOpenFinderCategory = useCallback((category) => {
    setFinderCategory(category);
    openApp("finder");
  }, [openApp]);

  const getCenterPosition = useCallback((width, height) => ({
    defaultX: Math.max(20, (window.innerWidth - width) / 2),
    defaultY: Math.max(40, (window.innerHeight - height) / 2),
  }), []);

  return (
    <div 
      onClick={handleUserInteraction}
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-700 ${
        isDarkMode ? "bg-black dark" : "bg-zinc-200"
      }`}
    >
      {/* Background Wallpaper */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
          isDarkMode ? "brightness-90 contrast-105" : "brightness-105"
        }`}
        style={{ backgroundImage: `url(${photo})` }}
      />

      {/* 1. Boot Screen Transition */}
      <AnimatePresence mode="wait">
        {booting && (
          <motion.div 
            key="boot"
            onClick={triggerFullscreen} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-[9999]"
          >
            <BootScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Fluid Hello Animation Overlay */}
      <AnimatePresence mode="wait">
        {!booting && showHello && (
          <motion.div
            key="hello-screen"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ 
              opacity: 1, 
              backdropFilter: "blur(24px)",
              transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
            }}
            exit={{ 
              opacity: 0, 
              backdropFilter: "blur(0px)",
              transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="absolute inset-0 z-[9998] flex items-center justify-center bg-white/10 dark:bg-black/25 backdrop-saturate-150 border border-white/20 shadow-2xl"
          >
            <motion.img 
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 0.95, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -10 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              src={helloSvg} 
              alt="Hello" 
              className="w-[32rem] max-w-[85vw] h-auto drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)] select-none pointer-events-none" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Lock Screen Transition */}
      <AnimatePresence mode="wait">
        {!booting && !showHello && isLocked && (
          <motion.div
            key="lock"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-40"
          >
            <LockScreen profile={profile} onUnlock={handleUnlock} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Desktop Environment */}
      {!booting && !showHello && !isLocked && (
        <motion.div
          key="desktop-environment"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full h-full"
        >
          {/* Workspace Container */}
          <div className="absolute inset-0 pb-24 overflow-hidden">
            <WindowManager
              windows={windows}
              onClose={closeApp}
              onMinimize={minimizeApp}
              bringWindowToFront={bringWindowToFront}
              getWindowZIndex={getWindowZIndex}
              getCenterPosition={getCenterPosition}
              isWifiActive={isWifiActive}
              setIsWifiActive={setIsWifiActive}
              isBluetooth={isBluetooth}
              setIsBluetooth={setIsBluetooth}
              isDarkMode={isDarkMode}
              finderCategory={finderCategory}
            />

            <DesktopWidgets
              profile={profile}
              isDarkMode={isDarkMode}
              onOpenWeather={() => openApp("weather")}
              onOpenCalender={() => openApp("calendar")}
              onOpenNotes={() => openApp("notes")}
              widgetVariants={widgetVariants}
            />

            <motion.div variants={iconVariants}>
              <DesktopIcons
                isDarkMode={isDarkMode}
                onOpenResume={() => openApp("resume")}
                onOpenLeetCode={() => openApp("leetcode")}
                onOpenCodechef={() => openApp("codechef")}
                onOpenProject={() => openApp("projectfolder")}
                onOpenDoc={() => handleOpenFinderCategory("documents")}
              />
            </motion.div>
          </div>

          {/* Top Bar & Dynamic Island */}
          <div className="absolute top-0 inset-x-0 z-[9999] pointer-events-none">
            <motion.div variants={TopbarVariants} className="pointer-events-auto">
              <Topbar
                onOpenCalculator={() => openApp("calculator")}
                isWifiActive={isWifiActive}
                setIsWifiActive={setIsWifiActive}
                isBluetooth={isBluetooth}
                setIsBluetooth={setIsBluetooth}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                isOpenFinder={() => handleOpenFinderCategory("recents")}
              />
            </motion.div>
          </div>

          {/* Dock */}
          <motion.div 
            variants={dockVariants}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Dock
              isDarkMode={isDarkMode}
              onOpenCalculator={() => openApp("calculator")}
              onOpenTerminal={() => openApp("terminal")}
              onOpenLinkedIn={() => openApp("linkedin")}
              onOpenCalendar={() => openApp("calendar")}
              onOpenSafari={() => openApp("safari")}
              onOpenYouTube={() => openApp("youtube")}
              onOpenWeather={() => openApp("weather")}
              onOpenGithub={() => openApp("github")}
              onOpenVscode={() => openApp("vscode")}
              onOpenMap={() => openApp("map")}
              onOpenPhoto={() => openApp("photos")}
              onOpenNetflix={() => openApp("netflix")}
              onOpenNodepad={() => openApp("notes")}
              onOpenSpotify={() => openApp("spotify")}
              onOpenSetting={() => openApp("setting")}
              onOpenImessage={() => openApp("imessage")}
              onOpenFinder={() => handleOpenFinderCategory("recents")}
              onOpenBin={() => handleOpenFinderCategory("bin")}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Laptop;