import React, { useState } from "react";
import {
  FaSearch,
  FaHome,
  FaCompass,
  FaHistory,
  FaPlayCircle,
  FaThumbsUp,
  FaThumbsDown,
  FaShare,
  FaDownload,
  FaBookmark,
  FaTimes,
  FaBell,
  FaMicrophone,
  FaUserCircle,
} from "react-icons/fa";

export default function YouTubeApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likesCount, setLikesCount] = useState(12400);
  const [hasLiked, setHasLiked] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Comment state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Dev Explorer",
      time: "3 hours ago",
      text: "This is exactly what I was looking for. Super clear and straight to the point!",
    },
    {
      id: 2,
      author: "Code & Craft",
      time: "5 hours ago",
      text: "Underrated video! Thanks for taking the time to explain this so well.",
    },
    {
      id: 3,
      author: "Sam Wilson",
      time: "12 hours ago",
      text: "Subscribed! Looking forward to more uploads like this.",
    },
    {
      id: 4,
      author: "Techie Mind",
      time: "2 days ago",
      text: "Saved this to my playlist. Quality content as always!",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const categories = [
    "All",
    "React JS",
    "C++",
    "BMW M4",
    "Data Structures",
    "Gaming",
    "Podcasts",
    "Live",
  ];

  // Default feed videos
  const [videos, setVideos] = useState([
    {
      id: "fPc7UxB0BEE",
      title: " Teri Meri Kahaani - Arijit Singh & Palak Muchhal ",
      channel: "T-Series",
      views: "1.5B views",
      time: "14 years ago",
      duration: "5:41",
      thumbnail: "https://img.youtube.com/vi/fPc7UxB0BEE/hqdefault.jpg",
      description: `Song: Teri Meri Kahaani (Lyrical)
Singers: Arijit Singh & Palak Muchhal
Composer: Chirantan Bhatt
Lyricist: Manoj Yadav`,
    },
    {
      id: "34Na4j8AVgA",
      title:
        "The Weeknd - Starboy ft. Daft Punk (Official Video) ft. Daft Punk",
      channel: "The Weeknd",
      views: "40M views",
      time: "9 Years ago",
      duration: "4:20",
      thumbnail: "https://img.youtube.com/vi/34Na4j8AVgA/hqdefault.jpg",
      description: `Directed by Grant Singer
Produced by Julien LeMaitre & Nina Soriano
For Anonymous Content `,
    },
    {
      id: "xvT1jH8B9AM",
      title:
        "KALYANI (with Shreya Ghoshal) OFFICIAL MUSIC VIDEO | ARJN | KDS | FIFTY4 | RONN | SHREYA GHOSHAL",
      channel: "MONEY VERSE RECORDS and ARJN",
      views: "120M views",
      time: "2 month ago",
      duration: "4:47",
      thumbnail: "https://img.youtube.com/vi/xvT1jH8B9AM/hqdefault.jpg",
      description: `STARRING SANIYA IYAPPAN
FT SHREYA GHOSHAL
WRITTEN BY: FIFTY4, SUHAS MOIDEEN, PULKIT SINGH
ADDITIONAL COMPOSITION: KESHAV TYOHAR
ADDITIONAL PRODUCTION: KESHAV TYOHAR, JONY BEATS
MIX AND MASTERING: ASHBIN PAULSON`,
    },
    {
      id: "3PqxT1VqyNc",
      title:
        "Laapata - Full Song | Ek Tha Tiger | Salman Khan | Katrina Kaif | KK | Palak Muchhal",
      channel: "YRF",
      views: "122M views",
      time: "13 Years ago",
      duration: "4:10",
      thumbnail: "https://img.youtube.com/vi/3PqxT1VqyNc/hqdefault.jpg",
      description: `🎧 Song Credits:
Song: Laapata
Music: Sohail Sen
Lyrics: Anvita Dutt
Singers: KK, Palak Muchhal


🎬 Movie Credits:
Starring: Salman Khan, Katrina Kaif, Girish Karnad, Roshan Seth, Ranveer Shorey
Director: Kabir Khan
Producer: Aditya Chopra
Music: Sohail Sen & Sajid-Wajid
Lyrics: Kausar Munir, Neelesh Misra and Anvita Dutt
Director of Photography: Aseem Mishra
Release Date: 15 August 2012`,
    },
    {
      id: "A2mEQICRUOY",
      title:
        "Mann Mera - Official Video | Table No 21 | Rajeev Khandelwal & Tina Desai | Gajendra Verma",
      channel: "Sony Music India",
      views: "158M views",
      time: "14 Years ago",
      duration: "0:55",
      thumbnail: "https://img.youtube.com/vi/HP2zqQsrsyg/hqdefault.jpg",
      description: `Credits:
Singer / Music Composer - Gajendra Verma
Lyrics - Aseem Ahmed Abbassee`,
    },
    {
      id: "u_4BBFxp7Rs",
      title:
        "Aami Tomar Kache (আমি তোমার কাছে) | Lyrical | Yoddha | Dev | Mimi | Arijit Singh | Prasen |SVF Music",
      channel: "SVF Music",
      views: "12M views",
      time: "6 Years ago",
      duration: "4:03",
      thumbnail: "https://img.youtube.com/vi/u_4BBFxp7Rs/hqdefault.jpg",
      description: `Film         : Yoddha
Starring    : Dev, Mimi Chakraborty, Nigel, Rajatava Dutta & others.
Producer  : Shree Venkatesh Films.
Presenter : Shrikant Mohta & Mahendra Soni
Direction  : Raj Chakraborty. 
DOP: Subhankar Bhar
Music: Indraadip Dasgupta
Lyrics: Prasen
Singers : Arijit Singh.
Choreography: Baba Yadav
Edit : Rabiranjan Maitra`,
    },
    {
      id: "V1fbOsHBlZE",
      title:
        "Haan Tu Hain - Full Video | Jannat | Emraan Hashmi, Sonal Chauhan | KK | Pritam | Sayeed Quadri",
      channel: "Sony Music India",
      views: "280M views",
      time: "8 Years ago",
      duration: "4:46",
      thumbnail: "https://img.youtube.com/vi/V1fbOsHBlZE/hqdefault.jpg",
      description: `Credits:
Song Name - Haan Tu Hain
Movie - Jannat
Singer - KK
Composer - Pritam
Lyricists - Sayeed Quadri
Mixed and Mastered by Eric Pillai @ FSOB Studios
Music Label - Sony Music Entertainment India Pvt. Ltd.`,
    },
    {
      id: "VdyBtGaspss",
      title:
        "Chahun Main Ya Naa Full Video Song Aashiqui 2 | Aditya Roy Kapur, Shraddha Kapoor",
      channel: "T-Series",
      views: "570M views",
      time: "13 Years ago",
      duration: "4:00",
      thumbnail: "https://img.youtube.com/vi/VdyBtGaspss/hqdefault.jpg",
      description: `Song: Chahun Main Ya Naa
Movie: Aashiqui 2
Singer: Arijit Singh, Palak Muchhal
Music: Jeet Gangulli
Producer: Bhushan Kumar Krishan Kumar  Producer: Mukesh Bhatt  
Director: Mohit Suri
Mix & Master- Eric Pillai @ Future Sound Of Bombay
Assistant Mix Engineer - Michael Edwin Pillai
Music Label: T-Series`,
    },
    {
      id: "suk3mW0tDPA",
      title:
        "Mehabooba Video Song (Hindi) | KGF Chapter 2 | RockingStar Yash | Prashanth Neel|Ravi Basrur|Hombale",
      channel: "MRT Music",
      views: "250M views",
      time: "4 Years ago",
      duration: "4:07",
      thumbnail: "https://img.youtube.com/vi/suk3mW0tDPA/hqdefault.jpg",
      description: `Banner: Hombale Films
Written & Directed by: Prashanth Neel
Produced by: Vijay Kiragandur
Music by: Ravi Basrur


Song Name: Mehabooba
Movie: KGF Chapter 2
Singers: Ananya Bhat
Music Director: Ravi Basrur
Lyrics: Shabbir Ahmed
Music Label: MRT Music`,
    },
  ]);

  // Handle local filter search on form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSelectedVideo(null);
  };

  // Filter local music list dynamically according to searchQuery state
  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleResetHome = () => {
    setSelectedVideo(null);
    setSearchQuery("");
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      { id: Date.now(), author: "You", time: "Just now", text: newComment },
      ...comments,
    ]);
    setNewComment("");
  };

  const toggleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white flex flex-col font-sans select-none overflow-hidden">
      {/* ================= TOP NAVBAR ================= */}
      <div className="px-4 py-2.5 bg-[#0f0f0f] border-b border-zinc-800 flex items-center justify-between gap-4 z-20">
        {/* Logo */}
        <div
          onClick={handleResetHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="bg-red-600 text-white p-1.5 rounded-xl flex items-center justify-center">
            <FaPlayCircle className="text-xl" />
          </div>
          <span className="font-bold text-lg tracking-tighter hidden sm:inline">
            YouTube{" "}
            <span className="text-[10px] font-normal text-zinc-400 align-top">
              IN
            </span>
          </span>
        </div>

        {/* Search Bar Container */}
        <div className="flex-1 max-w-2xl flex items-center gap-2 justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 relative flex items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#121212] border border-zinc-700 rounded-l-full py-2 pl-4 pr-4 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition-all font-sans"
            />
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 border border-l-0 border-zinc-700 px-5 py-2.5 rounded-r-full text-zinc-300 text-xs cursor-pointer flex items-center justify-center"
              title="Search"
            >
              <FaSearch />
            </button>
          </form>

          <button className="hidden sm:flex p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-200 text-xs cursor-pointer">
            <FaMicrophone />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 text-zinc-300">
          <button className="p-2.5 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer text-sm">
            <FaBell />
          </button>
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs cursor-pointer border border-zinc-700">
            B
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT LAYOUT ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Nav */}
        <div className="w-16 sm:w-56 bg-[#0f0f0f] border-r border-zinc-800/60 p-2 flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={handleResetHome}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-xl text-xs font-semibold w-full text-left cursor-pointer transition-colors ${!selectedVideo ? "bg-zinc-800 text-white" : "hover:bg-zinc-800/50 text-zinc-400"}`}
          >
            <FaHome className="text-base text-red-500" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <button className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-xs font-semibold w-full text-left transition-colors cursor-pointer">
            <FaCompass className="text-base" />
            <span className="hidden sm:inline">Explore</span>
          </button>
          <button className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-xs font-semibold w-full text-left transition-colors cursor-pointer">
            <FaHistory className="text-base" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-zinc-800/50 text-zinc-400 hover:text-white text-xs font-semibold w-full text-left transition-colors cursor-pointer">
            <FaThumbsUp className="text-base" />
            <span className="hidden sm:inline">Liked Videos</span>
          </button>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-xs gap-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              Fetching YouTube feeds...
            </div>
          ) : selectedVideo ? (
            /* ================= ACTIVE VIDEO WATCH PAGE ================= */
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Player & Details (8 Cols on Desktop) */}
              <div className="lg:col-span-8 flex flex-col gap-3">
                {/* Embed Player */}
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&enablejsapi=1`}
                    title={selectedVideo.title}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Title */}
                <h1 className="text-base sm:text-lg font-bold text-white leading-snug mt-1">
                  {selectedVideo.title}
                </h1>

                {/* Channel Meta & Interactive Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-sm text-white">
                      {selectedVideo.channel[0]}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">
                        {selectedVideo.channel}
                      </h3>
                      <p className="text-[10px] text-zinc-400">
                        1.2M subscribers
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSubscribed(!isSubscribed)}
                      className={`ml-3 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        isSubscribed
                          ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          : "bg-white text-black hover:bg-zinc-200"
                      }`}
                    >
                      {isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 overflow-x-auto text-xs">
                    <div className="flex items-center bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                      <button
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer hover:bg-zinc-700 transition-colors ${hasLiked ? "text-blue-400" : "text-zinc-200"}`}
                      >
                        <FaThumbsUp />
                        <span>{(likesCount / 1000).toFixed(1)}K</span>
                      </button>
                      <div className="w-[1px] h-4 bg-zinc-700" />
                      <button className="px-3 py-1.5 text-zinc-200 cursor-pointer hover:bg-zinc-700 transition-colors">
                        <FaThumbsDown />
                      </button>
                    </div>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full cursor-pointer transition-colors border border-zinc-700">
                      <FaShare /> <span>Share</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full cursor-pointer transition-colors border border-zinc-700">
                      <FaDownload /> <span>Download</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-full cursor-pointer transition-colors border border-zinc-700">
                      <FaBookmark /> <span>Save</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Description Box */}
                <div
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="bg-zinc-900/90 hover:bg-zinc-800/80 p-3 rounded-xl text-xs text-zinc-300 cursor-pointer transition-colors border border-zinc-800"
                >
                  <div className="font-semibold text-white mb-1 flex gap-2">
                    <span>{selectedVideo.views}</span>
                    <span>•</span>
                    <span>{selectedVideo.time}</span>
                  </div>
                  <p
                    className={
                      showFullDesc ? "whitespace-pre-line" : "line-clamp-2"
                    }
                  >
                    {selectedVideo.description}
                  </p>
                  <span className="text-zinc-400 font-bold mt-2 inline-block">
                    {showFullDesc ? "Show Less" : "...more"}
                  </span>
                </div>

                {/* Interactive Comments Section */}
                <div className="mt-4 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white">
                    {comments.length} Comments
                  </h3>

                  {/* Comment Input */}
                  <form
                    onSubmit={handleAddComment}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      B
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-transparent border-b border-zinc-700 focus:border-white text-xs py-1 text-white focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setNewComment("")}
                          className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold rounded-full"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="flex flex-col gap-3 mt-2">
                    {comments.map((item) => (
                      <div key={item.id} className="flex gap-3 text-xs">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold flex-shrink-0">
                          {item.author[0]}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {item.author}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-zinc-300">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related / Up Next Sidebar (4 Cols on Desktop) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Up next
                </h3>
                {filteredVideos
                  .filter((v) => v.id !== selectedVideo.id)
                  .map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        setSelectedVideo(video);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex gap-2 group cursor-pointer p-1.5 rounded-xl hover:bg-zinc-900 transition-colors"
                    >
                      <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[9px] font-mono text-white">
                          {video.duration}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 truncate">
                          {video.channel}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {video.views} • {video.time}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            /* ================= GRID HOME FEED ================= */
            <div className="flex flex-col gap-4">
              {/* Category Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                      activeCategory === cat
                        ? "bg-white text-black"
                        : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group cursor-pointer flex flex-col gap-2.5 rounded-xl p-2 hover:bg-zinc-900/80 transition-all border border-transparent hover:border-zinc-800"
                  >
                    {/* Thumbnail Container */}
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-800">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                        {video.duration}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-2.5 items-start">
                      <div className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white border border-zinc-800">
                        {video.channel[0]}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h3>
                        <span className="text-[11px] text-zinc-400 mt-1 truncate">
                          {video.channel}
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-0.5">
                          {video.views} • {video.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}