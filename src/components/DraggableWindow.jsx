import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Rnd } from "react-rnd";

export default function DraggableWindow({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  title,
  children,
  defaultWidth = 600,
  defaultHeight = 400,
  defaultX = 0,
  defaultY = 0,
  zIndex,
  onBringToFront,
  headerColor = "bg-zinc-950/90",
  borderColor = "border-white/15",
  bgColor = "bg-black",
}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [animationState, setAnimationState] = useState("opening"); // "opening" | "idle" | "closing" | "minimizing"

  // Reset to opening state whenever window opens or un-minimizes
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setAnimationState("opening");
      const timer = setTimeout(() => setAnimationState("idle"), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  if (!isOpen || isMinimized) return null;

  const handleToggleFullScreen = (e) => {
    e.stopPropagation();
    onBringToFront?.();
    setIsFullScreen((prev) => !prev);
  };

  // Close with Scale-Down & Fade Out Animation
  const handleClose = (e) => {
    e.stopPropagation();
    setAnimationState("closing");
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  // Minimize with macOS Dock-Drop Animation
  const handleMinimize = (e) => {
    e.stopPropagation();
    setAnimationState("minimizing");
    setTimeout(() => {
      onMinimize?.();
    }, 250);
  };

  // Framer Motion animation variants
  const windowVariants = {
    opening: {
      scale: 0.85,
      opacity: 0,
      y: 30,
      filter: "blur(4px)",
    },
    idle: {
      scale: 1,
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 340,
        damping: 26,
        mass: 0.8,
      },
    },
    closing: {
      scale: 0.92,
      opacity: 0,
      filter: "blur(2px)",
      transition: { duration: 0.18, ease: "easeOut" },
    },
    minimizing: {
      scale: 0.3,
      opacity: 0,
      y: 250,
      filter: "blur(6px)",
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <AnimatePresence>
      <Rnd
        size={
          isFullScreen
            ? { width: "100vw", height: "100vh" }
            : { width: size.width, height: size.height }
        }
        position={
          isFullScreen
            ? { x: 0, y: 0 }
            : { x: position.x, y: position.y }
        }
        disableDragging={isFullScreen}
        enableResizing={
          isFullScreen
            ? false
            : {
                bottom: true,
                bottomLeft: true,
                bottomRight: true,
                left: true,
                right: true,
                top: true,
                topLeft: true,
                topRight: true,
              }
        }
        minWidth={isFullScreen ? undefined : 500}
        minHeight={isFullScreen ? undefined : 350}
        onDragStop={(e, d) => {
          if (!isFullScreen) {
            setPosition({ x: d.x, y: d.y });
          }
          onBringToFront?.();
        }}
        onResizeStop={(e, direction, ref, delta, newPosition) => {
          if (!isFullScreen) {
            setSize({
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
            });
            setPosition(newPosition);
          }
          onBringToFront?.();
        }}
        onMouseDown={() => onBringToFront?.()}
        dragHandleClassName="drag-handle"
        resizeHandleComponent={
          isFullScreen
            ? {}
            : {
                bottomRight: (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      bottom: 0,
                      width: "20px",
                      height: "20px",
                      cursor: "se-resize",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                      borderRadius: "0 0 16px 0",
                    }}
                  />
                ),
              }
        }
        style={{
          position: isFullScreen ? "fixed" : "absolute",
          top: isFullScreen ? 0 : undefined,
          left: isFullScreen ? 0 : undefined,
          zIndex: isFullScreen ? 99999 : zIndex,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          // Enables smooth CSS transition on width/height/position changes for Rnd wrapper
          transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="overflow-visible"
      >
        <motion.div
          layout // Enables Framer Motion smooth layout morphing
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
          }}
          initial="opening"
          animate={animationState}
          variants={windowVariants}
          style={{
            transform: animationState === "idle" ? "none" : undefined,
          }}
          className={`w-full h-full flex flex-col overflow-hidden origin-center ${
            isFullScreen ? "rounded-none" : "rounded-2xl"
          } shadow-2xl border ${borderColor} ${bgColor}`}
        >
          {/* Window Header */}
          <div
            className={`drag-handle h-10 px-4 flex items-center justify-between ${headerColor} backdrop-blur-md border-b border-white/10 select-none ${
              isFullScreen ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            } shrink-0 z-20`}
          >
            {/* Left: Control Buttons */}
            <div className="flex items-center gap-2 w-20">
              {/* Close (Red) */}
              <button
                type="button"
                onClick={handleClose}
                title="Close"
                className="w-3 h-3 rounded-full bg-[#FF5F56] hover:brightness-110 active:scale-90 transition-all cursor-pointer shrink-0 border-0 p-0"
              />
              {/* Minimize (Yellow) */}
              <button
                type="button"
                onClick={handleMinimize}
                title="Minimize"
                className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-110 active:scale-90 transition-all cursor-pointer shrink-0 border-0 p-0"
              />
              {/* Fullscreen / Restore (Green) */}
              <button
                type="button"
                onClick={handleToggleFullScreen}
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                className="w-3 h-3 rounded-full bg-[#27C93F] hover:brightness-110 active:scale-90 transition-all cursor-pointer shrink-0 border-0 p-0"
              />
            </div>

            {/* Center: Title */}
            <span className="text-xs font-medium text-zinc-400 tracking-wide text-center flex-1 truncate">
              {title}
            </span>

            {/* Right: Balance Spacer */}
            <div className="w-20" />
          </div>

          {/* Window Content Container */}
          <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col relative">
            {children}
          </div>
        </motion.div>
      </Rnd>
    </AnimatePresence>
  );
}