import React from "react";
import { AnimatePresence } from "framer-motion";
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
  if (!isOpen || isMinimized) return null;

  return (
    <AnimatePresence>
      <Rnd
        default={{
          x: defaultX,
          y: defaultY,
          width: defaultWidth,
          height: defaultHeight,
        }}
        minWidth={500}
        minHeight={350}
        onDragStop={() => onBringToFront()}
        onResizeStop={() => onBringToFront()}
        onMouseDown={() => onBringToFront()}
        dragHandleClassName="drag-handle"
        enableResizing={{
          bottom: true,
          bottomLeft: true,
          bottomRight: true,
          left: true,
          right: true,
          top: true,
          topLeft: true,
          topRight: true,
        }}
        resizeHandleComponent={{
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
        }}
        style={{
          zIndex: zIndex,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
        }}
        className={`rounded-2xl overflow-hidden shadow-2xl border ${borderColor} ${bgColor}`}
      >
        {/* Window Header */}
        <div
          className={`drag-handle h-10 px-4 flex items-center justify-between ${headerColor} backdrop-blur-md border-b border-white/10 select-none cursor-grab active:cursor-grabbing shrink-0 z-20`}
        >
          {/* Left: Control Buttons */}
          <div className="flex items-center gap-2 w-20 h-full my-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:opacity-80 active:scale-95 transition-all cursor-pointer shrink-0 block p-0 border-0 leading-none"
            />
            <button
              type="button"
              onClick={onMinimize}
              className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:opacity-80 active:scale-95 transition-all cursor-pointer shrink-0 block p-0 border-0 leading-none"
            />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] opacity-80 shrink-0 block leading-none" />
          </div>

          {/* Center: Title */}
          <span className="text-xs font-medium text-zinc-400 tracking-wide text-center flex-1 truncate leading-none my-auto">
            {title}
          </span>

          {/* Right: Balance Spacer */}
          <div className="w-20" />
        </div>

        {/* Window Content Container */}
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col relative">
          {children}
        </div>
      </Rnd>
    </AnimatePresence>
  );
}