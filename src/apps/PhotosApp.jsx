import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ImageIcon,
  LayoutGrid,
  Library,
  ChevronLeft,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Folder,
  Heart,
  Clock,
  Sparkles
} from "lucide-react";

// 1. Import all images directly inside src/assets/ (flat, no subfolders)
const assetModules = import.meta.glob(
  "../assets/*.{png,jpg,jpeg,svg,webp,gif}",
  { eager: true }
);

// 2. Map imported modules into a photo list
const APP_PHOTOS = Object.entries(assetModules).map(([filePath, module], index) => {
  const fileName = filePath.split("/").pop();
  const cleanName = fileName.substring(0, fileName.lastIndexOf(".")).replace(/[-_]/g, " ");

  return {
    id: `asset-${index}`,
    title: cleanName || fileName,
    fileName: fileName,
    url: module.default || module,
    path: `src/assets/${fileName}`,
    date: new Date(Date.now() - index * 86400000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  };
});

export default function PhotosApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("library"); // 'library' | 'favorites' | 'recents'
  const [gridColumns, setGridColumns] = useState(4); // Zoom controls (2 to 6 columns)
  const [showInfo, setShowInfo] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter photos based on search query & current section tab
  const filteredPhotos = useMemo(() => {
    return APP_PHOTOS.filter((photo) => {
      const matchesSearch =
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === "favorites") {
        return matchesSearch && favorites.has(photo.id);
      }
      return matchesSearch;
    });
  }, [searchQuery, activeTab, favorites]);

  const selectedPhoto = selectedIndex !== null ? filteredPhotos[selectedIndex] : null;

  // Toggle Favorite
  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Keyboard controls for macOS Lightbox feel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft" && selectedIndex > 0) {
        setSelectedIndex((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && selectedIndex < filteredPhotos.length - 1) {
        setSelectedIndex((prev) => prev + 1);
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
        setShowInfo(false);
      } else if (e.key === "i" || e.key === "I") {
        setShowInfo((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredPhotos.length]);

  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* MACOS TOOLBAR HEADER */}
      <div className="h-13 px-4 py-2 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-10">
        
        {/* Navigation & Section Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "library" ? "bg-zinc-700 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Library className="w-3.5 h-3.5" /> Library
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === "favorites" ? "bg-zinc-700 text-white shadow" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Favorites
            </button>
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Center: Search Field */}
        <div className="w-64 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800/60 border border-white/10 rounded-md pl-8 pr-7 py-1 text-xs text-white placeholder-zinc-500 outline-none focus:border-sky-500/50 focus:bg-zinc-800 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Right: Grid Size Zoom Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridColumns((prev) => Math.min(prev + 1, 6))}
            disabled={gridColumns >= 6}
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
            title="Smaller Icons"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min="2"
            max="6"
            value={gridColumns}
            onChange={(e) => setGridColumns(Number(e.target.value))}
            className="w-20 accent-sky-500 cursor-pointer h-1 bg-zinc-700 rounded-lg appearance-none"
          />
          <button
            onClick={() => setGridColumns((prev) => Math.max(prev - 1, 2))}
            disabled={gridColumns <= 2}
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 text-zinc-300"
            title="Larger Icons"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredPhotos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
            <ImageIcon className="w-12 h-12 opacity-20" />
            <span className="text-sm font-medium">No photos found</span>
          </div>
        ) : (
          <div
            className="grid gap-3 transition-all duration-200"
            style={{
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
            }}
          >
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setSelectedIndex(index)}
                className="group relative aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-white/5 hover:border-sky-500/50 cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onContextMenu={(e) => e.preventDefault()} // Disable right-click save
                />

                {/* Hover Gradient Overlay & Favorite Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => toggleFavorite(photo.id, e)}
                      className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favorites.has(photo.id) ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                      />
                    </button>
                  </div>
                  <span className="text-[11px] font-medium text-white truncate px-1">
                    {photo.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MACOS INSPECTOR / LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div className="absolute inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-150">
          
          {/* Lightbox Toolbar Header */}
          <div className="h-12 px-4 bg-zinc-900/80 border-b border-white/10 flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                setSelectedIndex(null);
                setShowInfo(false);
              }}
              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium flex items-center gap-1 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Library
            </button>

            <span className="text-xs font-semibold text-zinc-200 capitalize truncate max-w-xs">
              {selectedPhoto.title}
            </span>

            {/* Action Bar */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => toggleFavorite(selectedPhoto.id, e)}
                className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-300 transition-all"
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.has(selectedPhoto.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-1.5 rounded-md transition-all ${
                  showInfo ? "bg-sky-500/20 text-sky-400" : "hover:bg-zinc-800 text-zinc-300"
                }`}
                title="Inspector Info"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas & Inspector Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            
            {/* Left Chevron */}
            {selectedIndex > 0 && (
              <button
                onClick={() => setSelectedIndex((prev) => prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white backdrop-blur-md transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Center Viewport */}
            <div
              className="flex-1 flex items-center justify-center p-6 relative overflow-hidden"
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl pointer-events-none select-none"
              />
            </div>

            {/* Right Chevron */}
            {selectedIndex < filteredPhotos.length - 1 && (
              <button
                onClick={() => setSelectedIndex((prev) => prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white backdrop-blur-md transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* macOS Inspector Sidebar Panel */}
            {showInfo && (
              <div className="w-72 bg-zinc-900 border-l border-white/10 p-4 flex flex-col gap-4 text-xs z-10 animate-in slide-in-from-right duration-200 overflow-y-auto">
                <h3 className="font-semibold text-zinc-200 border-b border-white/10 pb-2">
                  Info
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-medium">Title</span>
                    <span className="text-zinc-200 font-mono capitalize">{selectedPhoto.title}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-medium">Filename</span>
                    <span className="text-zinc-300 font-mono break-all">{selectedPhoto.fileName}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-medium">Path</span>
                    <span className="text-zinc-400 font-mono text-[11px] break-all">{selectedPhoto.path}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block mb-0.5 font-medium">Date Added</span>
                    <span className="text-zinc-300">{selectedPhoto.date}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}