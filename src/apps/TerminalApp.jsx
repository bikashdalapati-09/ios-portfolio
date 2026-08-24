import React, { useState, useRef, useEffect } from "react";

export default function TerminalApp() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    {
      type: "output",
      text: "Last login: " + new Date().toDateString() + " on ttys001",
    },
    { type: "output", text: "Type 'help' to see available commands." },
  ]);

  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Focus input WITHOUT triggering browser page scrolling
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // 2. Keep terminal scrolled to bottom internally when history updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [
      ...history,
      { type: "input", text: `bikash@macbook-pro ~ % ${input}` },
    ];

    switch (cmd) {
      case "help":
        newHistory.push({
          type: "output",
          text: "Available commands:\n  about         - Learn about Bikash\n  education     - View degree & college info\n  skills        - View languages, tools & tech stack\n  projects      - View featured software projects\n  achievements  - View competitive programming & LeetCode stats\n  contact       - View email, phone & social profiles\n  clear         - Clear terminal screen\n  date          - Show current date & time",
        });
        break;

      case "about":
        newHistory.push({
          type: "output",
          text: "BIKASH DALAPATI\nLocation: Uluberia, West Bengal, India\nSummary: Computer Science Engineering student specializing in MERN stack web development + AI integration and DSA problem solving.",
        });
        break;

      case "education":
        newHistory.push({
          type: "output",
          text: "Degree: B.Tech in Computer Science and Engineering\nCollege: OmDayal Group of Institutions Engineering and Architecture College, Howrah\nCGPA: 8.00 (till 6th semester)\nRelevant Coursework: Data Structures, Operating Systems, OOPS, DBMS, Computer Networks",
        });
        break;

      case "skills":
        newHistory.push({
          type: "output",
          text: "Languages: C, C++, JavaScript, Python, SQL, HTML, CSS, Java (OOP fundamentals)\nFrontend: React.js, Redux, Tailwind CSS, Framer Motion, react-rnd, Glassmorphism UI\nBackend: Node.js, Express.js, REST APIs, JWT, Socket.IO, ZOD\nDatabases: MongoDB, MySQL, Pinecone\nGenerative AI: LLM, Agentic AI, Langchain, RAG\nTools & Platforms: Git, GitHub, vs code, Firebase, Razorpay, Postman, Vercel, Render\nCore CS: Data Structures & Algorithms, Operating Systems, OOPS, DBMS, Computer Networks",
        });
        break;

      case "projects":
        newHistory.push({
          type: "output",
          text: "1. Interactive macOS & iOS Web Ecosystem Portfolio: React 18, Framer Motion, react-rnd, Tailwind CSS, Web Battery API - Adaptive dual-environment portfolio with macOS window management, iOS hardware simulation, and glassmorphic widgets.\n\n2. Smart AI Restaurant Assistant (Kolkata Kitchen): Monorepo (React, Express.js, @google/genai SDK, Tailwind CSS) - AI dining assistant for Bengali cuisine featuring meal-time context detection and Bento UI.\n\n3. InterviewX | AI-Powered Mock Interview Platform: MERN Stack, Firebase, Razorpay, OpenRouter API (GPT-4o Mini) - AI mock interview platform with resume analysis, automated report generation, and Razorpay payments.\n\n4. Real-Time Chat Application: MERN Stack, Socket.IO, JWT - Low-latency multi-user messaging system with real-time presence tracking and secure JWT auth.\n\n5. Full-Stack Expense Tracker: MERN Stack, Tailwind CSS, REST APIs - Full-stack financial dashboard with categorized expense tracking, CRUD operations, and monthly analytics."
        });
        break;

      case "achievements":
        newHistory.push({
          type: "output",
          text: "🏆 Solved 1000+ DSA problems on LeetCode\n🏆 Achieved LeetCode contest rating of 1608 with a 550+ daily POTD streak\n🏆 Achieved CodeChef 2-star rating (1550+)",
        });
        break;

      case "contact":
        newHistory.push({
          type: "output",
          text: "Phone: +91-8927182293\nEmail: bikashdalapati09@gmail.com\nLinkedIn: linkedin.com/in/bikashdalapati09\nGitHub: github.com/bikashdalapati-09",
        });
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "date":
        newHistory.push({ type: "output", text: new Date().toString() });
        break;

      default:
        newHistory.push({
          type: "output",
          text: `zsh: command not found: ${input}. Type 'help' for available commands.`,
        });
    }

    setHistory(newHistory);
    setInput("");
  };

  return (
    <div
      ref={scrollContainerRef}
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      className="w-full h-full min-h-0 flex flex-col p-4 bg-black/85 backdrop-blur-xl font-mono text-xs text-emerald-400 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent cursor-text"
    >
      <div className="flex flex-col gap-2">
        {history.map((item, index) => (
          <div
            key={index}
            className={
              item.type === "input"
                ? "text-white font-semibold"
                : "text-zinc-300 whitespace-pre-line"
            }
          >
            {item.text}
          </div>
        ))}

        {/* Active Command Prompt Line */}
        <form
          onSubmit={handleCommand}
          className="flex items-center gap-2 mt-1 shrink-0"
        >
          <span className="text-emerald-500 font-bold shrink-0">
            bikash@macbook ~ %
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-white outline-none font-mono text-xs caret-emerald-400"
          />
        </form>
      </div>
    </div>
  );
}
