import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  GraduationCap, 
  Loader2, 
  ExternalLink,
  Flame,
  MessageSquare,
  Eye,
  CheckSquare,
  Globe,
  RefreshCw,
  Code2,
  Trophy,
  ChevronRight,
  Sparkles
} from "lucide-react";

import userAvatar from "../assets/profile-photo.jpeg"; 

export default function LeetCodeApp() {
  const username = "bikash_09";
  const leetCodeUrl = `https://leetcode.com/u/${username}/`;

  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recent");
  const [streak, setStreak] = useState(600);

  useEffect(() => {
    const baseStreak = 515;
    const anchorDate = new Date("2026-07-28T00:00:00Z");
    const now = new Date();
    
    const diffInDays = Math.floor((now.getTime() - anchorDate.getTime()) / (1000 * 3600 * 24));
    if (diffInDays > 0) {
      setStreak(baseStreak + diffInDays);
    }
  }, []);

  const fetchLeetCodeData = async () => {
    setLoading(true);
    const endpoints = [
      `https://alfa-leetcode-api.onrender.com/userProfile/${username}`,
      `https://alfa-leetcode-api.onrender.com/${username}/solved`,
      `https://leetcode-stats-api.herokuapp.com/${username}`
    ];

    let fetchedData = null;

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.totalSolved !== undefined || data.easySolved !== undefined)) {
            fetchedData = {
              easySolved: data.easySolved ?? data.easySolvedCount ?? 428,
              mediumSolved: data.mediumSolved ?? data.mediumSolvedCount ?? 429,
              hardSolved: data.hardSolved ?? data.hardSolvedCount ?? 126,
              totalSolved: data.totalSolved ?? data.solvedProblem ?? 983,
              ranking: data.ranking ?? data.rankingPosition ?? "34,364"
            };
            break;
          }
        }
      } catch (err) {
        console.warn(`Failed endpoint ${url}`);
      }
    }

    try {
      const subRes = await fetch(`https://alfa-leetcode-api.onrender.com/acSubmission?username=${username}&limit=6`);
      if (subRes.ok) {
        const subData = await subRes.json();
        if (Array.isArray(subData.submission)) {
          setRecentSubmissions(subData.submission);
        }
      }
    } catch (err) {
      console.warn("Submissions fetch failed");
    }

    setStats(fetchedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeetCodeData();
  }, [username]);

  const easySolved = stats?.easySolved ?? 428;
  const mediumSolved = stats?.mediumSolved ?? 429;
  const hardSolved = stats?.hardSolved ?? 126;
  const totalSolved = stats?.totalSolved ?? (easySolved + mediumSolved + hardSolved);
  const ranking = stats?.ranking ?? "34,364";

  const easyTotal = 824;
  const mediumTotal = 1735;
  const hardTotal = 752;
  const totalQuestions = 3311;

  const languages = [
    { name: "C++", solved: 1022, color: "bg-blue-500" },
    { name: "JavaScript", solved: 10, color: "bg-yellow-400" },
    { name: "Python3", solved: 6, color: "bg-emerald-400" },
    { name: "SQL", solved: 29, color: "bg-purple-400" }
  ];

  const skillCategories = [
    { title: "Advanced", skills: [{ name: "Dynamic Programming", count: 184 }, { name: "Graph Algorithms", count: 96 }, { name: "Segment Tree", count: 24 }] },
    { title: "Intermediate", skills: [{ name: "Trees & Binary Trees", count: 210 }, { name: "Two Pointers", count: 142 }, { name: "Sliding Window", count: 88 }, { name: "Binary Search", count: 115 }] },
    { title: "Fundamental", skills: [{ name: "Arrays & Strings", count: 350 }, { name: "Hash Table", count: 280 }, { name: "Math & Bit Manipulation", count: 165 }] }
  ];

  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const getActiveGreenShade = (i) => ["bg-[#004d25]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"][i % 4];

  return (
    <div className="min-h-screen w-full bg-[#1a1a1a] text-[#eff1f6]/75 font-sans text-xs flex flex-col selection:bg-[#ffa116]/30 selection:text-[#ffa116]">
      
      {/* ================= TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-30 bg-[#282828] border-b border-[#3e3e3e] px-4 sm:px-8 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href={leetCodeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 font-bold text-lg">
            <span className="text-[#ffa116]">LeetCode</span>
          </a>
          
          <nav className="hidden md:flex items-center gap-6 text-[#eff1f6]/60 font-medium text-xs">
            <span className="hover:text-white cursor-pointer transition-colors">Explore</span>
            <span className="hover:text-white cursor-pointer transition-colors">Problems</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contest</span>
            <span className="hover:text-white cursor-pointer transition-colors">Discuss</span>
            <span className="text-[#ffa116] font-semibold cursor-pointer">Store</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={fetchLeetCodeData}
            title="Refresh Live Stats" 
            className="p-1.5 rounded-full hover:bg-[#3e3e3e] text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ffa116]' : ''}`} />
          </button>

          <div className="flex items-center gap-1.5 bg-[#3e3e3e]/60 px-3 py-1 rounded-full text-[#ffa116] text-xs font-semibold">
            <Flame className="w-4 h-4 fill-[#ffa116] text-[#ffa116]" />
            <span>{streak}</span>
          </div>

          <div className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden border border-zinc-600 cursor-pointer">
            <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* ================= SCROLLABLE CONTAINER ================= */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-53px)] scrollbar-thin scrollbar-thumb-zinc-700">
        <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
          
          {loading ? (
            <div className="min-h-[500px] flex flex-col items-center justify-center gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffa116]" />
              <p className="text-xs font-medium">Fetching profile details for {username}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              
              {/* ================= LEFT SIDEBAR ================= */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Profile Card */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-4 border border-[#3e3e3e]/40">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                      <img src={userAvatar} alt="Bikash Dalapati" className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                      <h1 className="text-lg font-bold text-white leading-snug truncate">Bikash Dalapati</h1>
                      <p className="text-zinc-400 text-xs truncate">{username}</p>
                      <div className="mt-1.5 inline-flex items-center text-zinc-400 text-[11px]">
                        Rank <span className="text-white font-semibold ml-1">#{typeof ranking === 'number' ? ranking.toLocaleString() : ranking}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-xs italic bg-[#1f1f1f]/50 p-2.5 rounded border border-[#3e3e3e]">
                    "Be the GameChanger !!!..."
                  </p>

                  <div className="flex flex-col gap-2.5 text-zinc-400 text-xs pt-1 border-t border-[#3e3e3e]">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300">India</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300 truncate">OmDayal Group of Institutions</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-zinc-400 text-xs border-t border-[#3e3e3e] pt-3">
                    <a href="https://github.com/bikashdalapati-09" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-white transition-colors">
                      <Globe className="w-4 h-4 text-zinc-500" />
                      <span className="truncate">github.com/bikashdalapati-09</span>
                    </a>
                  </div>
                </div>

                {/* Languages Breakdown */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-3 border border-[#3e3e3e]/40">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-[#ffa116]" /> Languages
                    </h3>
                    <span className="text-[10px] text-zinc-500">Problems Solved</span>
                  </div>
                  
                  <div className="flex flex-col gap-2.5 pt-1">
                    {languages.map((lang) => (
                      <div key={lang.name} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300 font-medium">{lang.name}</span>
                          <span className="text-white font-bold">{lang.solved} <span className="text-zinc-500 text-[10px]">problems</span></span>
                        </div>
                        <div className="w-full h-1 bg-[#3e3e3e] rounded-full overflow-hidden">
                          <div className={`h-full ${lang.color}`} style={{ width: `${(lang.solved / totalSolved) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Stats */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-3 border border-[#3e3e3e]/40">
                  <h3 className="font-semibold text-white text-xs">Community Stats</h3>
                  <div className="flex flex-col gap-3 text-zinc-400 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-zinc-500" /> Views</span>
                      <span className="text-white font-medium">1,240</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-zinc-500" /> Solution</span>
                      <span className="text-white font-medium">14</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-zinc-500" /> Discuss</span>
                      <span className="text-white font-medium">8</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* ================= RIGHT MAIN AREA ================= */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Contest & Badges Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  
                  {/* Contest Rating Widget */}
                  <div className="sm:col-span-7 bg-[#282828] rounded-lg p-4 flex flex-col justify-between border border-[#3e3e3e]/40">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-[#ffa116]" /> Contest Rating
                          </p>
                          <p className="text-2xl font-bold text-white mt-0.5">1,532</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-400 uppercase font-semibold">Global Ranking</p>
                          <p className="text-xs font-semibold text-white mt-1">314,988 <span className="text-zinc-500 font-normal">/876,708</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-16 mt-4 relative flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M 0 35 Q 25 30, 50 15 T 100 5" fill="none" stroke="#ffa116" strokeWidth="2" />
                        <path d="M 0 35 Q 25 30, 50 15 T 100 5 L 100 40 L 0 40 Z" fill="url(#gradient)" opacity="0.2" />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffa116" />
                            <stop offset="100%" stopColor="#ffa116" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                      <span>2024</span>
                      <span>2026</span>
                    </div>
                  </div>

                  {/* Badges Widget */}
                  <div className="sm:col-span-5 bg-[#282828] rounded-lg p-4 flex flex-col justify-between border border-[#3e3e3e]/40">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-zinc-400 uppercase font-semibold">Badges</p>
                      <span className="text-base font-bold text-white">27</span>
                    </div>

                    <div className="flex items-center justify-around my-2">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#ffa116] to-yellow-200 p-0.5 flex items-center justify-center text-[10px] font-black text-black shadow-md">
                        500d
                      </div>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-200 p-0.5 flex items-center justify-center text-[10px] font-black text-black shadow-md">
                        100d
                      </div>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-300 p-0.5 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                        2026
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 text-[10px]">Most Recent</span>
                      <span className="text-white font-medium text-[11px]">500 Days Badge</span>
                    </div>
                  </div>

                </div>

                {/* Solved Problems Breakdown */}
                <div className="bg-[#282828] rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#3e3e3e]/40">
                  <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-[#3e3e3e]" strokeWidth="2.8" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#00b8a3]" strokeDasharray={`${(easySolved / totalQuestions) * 100}, 100`} strokeWidth="2.8" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-bold text-white leading-none">{totalSolved}</span>
                      <span className="text-[10px] text-zinc-400 font-medium mt-1">Solved</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#00b8a3]">Easy</span>
                        <span className="text-white">{easySolved}<span className="text-zinc-500 text-[10px]">/{easyTotal}</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-[#3e3e3e] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00b8a3] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (easySolved / easyTotal) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#ffc01e]">Medium</span>
                        <span className="text-white">{mediumSolved}<span className="text-zinc-500 text-[10px]">/{mediumTotal}</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-[#3e3e3e] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ffc01e] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mediumSolved / mediumTotal) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#ff375f]">Hard</span>
                        <span className="text-white">{hardSolved}<span className="text-zinc-500 text-[10px]">/{hardTotal}</span></span>
                      </div>
                      <div className="w-full h-1.5 bg-[#3e3e3e] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff375f] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (hardSolved / hardTotal) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submissions Heatmap */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-3 border border-[#3e3e3e]/40">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base font-bold text-white">1.2k</span>
                      <span className="text-zinc-400">submissions in the past year</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
                      <span>Total active days: <strong className="text-white">365</strong></span>
                      <span>Max streak: <strong className="text-white">365</strong></span>
                    </div>
                  </div>

                  <div className="w-full overflow-x-auto pt-2">
                    <div className="flex flex-col gap-2 min-w-[700px]">
                      <div className="grid grid-cols-53 gap-1">
                        {Array.from({ length: 364 }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${getActiveGreenShade(i)} transition-transform hover:scale-125`} />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-500 px-1">
                        {months.map((m) => <span key={m}>{m}</span>)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Matrix Categorized List */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-4 border border-[#3e3e3e]/40">
                  <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#ffa116]" /> Skills & Topic Matrix
                  </h3>

                  <div className="flex flex-col gap-3">
                    {skillCategories.map((cat) => (
                      <div key={cat.title} className="flex flex-col gap-2">
                        <span className="text-[11px] font-semibold text-zinc-400">{cat.title}</span>
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((s) => (
                            <div key={s.name} className="flex items-center gap-1.5 bg-[#1f1f1f] hover:bg-[#3e3e3e]/50 px-2.5 py-1 rounded border border-[#3e3e3e]/60 transition-colors cursor-pointer">
                              <span className="text-zinc-200 text-xs">{s.name}</span>
                              <span className="bg-[#3e3e3e] text-zinc-400 text-[10px] px-1.5 py-0.2 rounded-full font-mono">x{s.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-[#282828] rounded-lg p-4 flex flex-col gap-3 border border-[#3e3e3e]/40">
                  <div className="flex items-center justify-between border-b border-[#3e3e3e] pb-2.5">
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <button 
                        onClick={() => setActiveTab("recent")}
                        className={`pb-1 transition-colors ${activeTab === 'recent' ? 'text-white border-b-2 border-[#ffa116]' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Recent AC
                      </button>
                      <button 
                        onClick={() => setActiveTab("solutions")}
                        className={`pb-1 transition-colors ${activeTab === 'solutions' ? 'text-white border-b-2 border-[#ffa116]' : 'text-zinc-400 hover:text-white'}`}
                      >
                        Solutions
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {recentSubmissions.length > 0 ? (
                      recentSubmissions.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[#3e3e3e]/40 last:border-0 hover:bg-[#3e3e3e]/20 px-2 rounded transition-colors">
                          <span className="text-white font-medium">{item.title}</span>
                          <span className="text-zinc-400 text-[11px]">
                            {new Date(parseInt(item.timestamp) * 1000).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      [
                        { title: "Two Sum", time: "1 day ago" },
                        { title: "Add Two Numbers", time: "2 days ago" },
                        { title: "Median of Two Sorted Arrays", time: "3 days ago" },
                        { title: "Longest Palindromic Substring", time: "4 days ago" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[#3e3e3e]/40 last:border-0 hover:bg-[#3e3e3e]/20 px-2 rounded transition-colors">
                          <span className="text-white font-medium">{item.title}</span>
                          <span className="text-zinc-400 text-[11px]">{item.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}
        </main>

        {/* ================= OFFICIAL LEETCODE FOOTER ================= */}
        <footer className="mt-12 bg-[#282828] border-t border-[#3e3e3e] text-zinc-500 text-xs py-8 px-4 sm:px-8">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-zinc-400">
              <span className="text-zinc-500">Copyright © 2026 LeetCode</span>
              <span className="hover:text-white cursor-pointer">Help Center</span>
              <span className="hover:text-white cursor-pointer">Jobs</span>
              <span className="hover:text-white cursor-pointer">Bug Bounty</span>
              <span className="hover:text-white cursor-pointer">Terms</span>
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs">All Systems Operational</span>
              </div>
              <a href={leetCodeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#ffa116] font-semibold hover:underline">
                LeetCode Profile <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Redirect Button */}
      <a
        href={leetCodeUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#ffa116] hover:bg-[#ffb84d] text-black font-bold px-4 py-2.5 rounded-full shadow-lg transition-all text-xs"
      >
        <span>View Live Profile</span>
        <ExternalLink className="w-4 h-4" />
      </a>

    </div>
  );
}