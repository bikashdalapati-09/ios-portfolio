import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Link as LinkIcon,
  Building,
  Users,
  BookOpen,
  Star,
  GitFork,
  ExternalLink,
  Loader2
} from "lucide-react";

export default function GitHubProfile() {
  const [profileInput, setProfileInput] = useState("");
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to extract clean username from plain text or URL inputs
  const extractUsername = (input) => {
    let cleaned = input.trim();
    if (!cleaned) return "";

    // Remove trailing slashes
    cleaned = cleaned.replace(/\/+$/, "");

    // If a URL was pasted (e.g. https://github.com/username)
    if (cleaned.includes("github.com/")) {
      const parts = cleaned.split("github.com/");
      const pathParts = parts[parts.length - 1].split("/");
      return pathParts[0];
    }

    // Return plain username
    return cleaned;
  };

  const fetchGitHubData = async (rawInput) => {
    const user = extractUsername(rawInput);
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch User Profile Data via GitHub API
      const userRes = await fetch(`https://api.github.com/users/${user}`);
      
      if (!userRes.ok) {
        throw new Error(
          userRes.status === 404
            ? "GitHub profile not found."
            : userRes.status === 403
            ? "GitHub API rate limit exceeded. Please try again later."
            : "Failed to load GitHub profile."
        );
      }
      const userData = await userRes.json();

      // 2. Fetch User Repositories (sorted by updated date)
      const reposRes = await fetch(
        `https://api.github.com/users/${user}/repos?sort=updated&per_page=6`
      );
      const reposData = reposRes.ok ? await reposRes.json() : [];

      setProfile(userData);
      setRepos(reposData);
    } catch (err) {
      setError(err.message || "An error occurred while fetching the profile.");
      setProfile(null);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch default profile on initial render
  useEffect(() => {
    fetchGitHubData("bikashdalapati-09");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (profileInput.trim()) {
      fetchGitHubData(profileInput);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans px-4 pb-4 pt-12 sm:p-8 select-none relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Search Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#30363d] mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-white" />
            <h1 className="text-xl font-bold text-white tracking-wide">
              GitHub Profile
            </h1>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-96">
            <input
              type="text"
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              placeholder="Paste GitHub URL or username..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#58a6ff] transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Full Loader State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#8b949e]">
            <Loader2 className="w-8 h-8 animate-spin text-[#58a6ff]" />
            <p className="text-sm font-medium animate-pulse">
              Fetching GitHub Profile...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-4 text-center my-10 text-sm">
            {error}
          </div>
        )}

        {/* Profile Content */}
        {!loading && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar / User Info */}
            <div className="lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Avatar */}
              <div className="relative group">
                <img
                  src={profile.avatar_url}
                  alt={profile.name || profile.login}
                  className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full border-2 border-[#30363d] shadow-xl object-cover mb-4"
                />
              </div>

              {/* Names */}
              <h2 className="text-2xl font-bold text-white leading-tight">
                {profile.name || profile.login}
              </h2>
              <span className="text-lg text-[#8b949e] font-light mb-4">
                @{profile.login}
              </span>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-[#c9d1d9] mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* GitHub Link */}
              <a
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-white text-sm font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors mb-6"
              >
                View on GitHub <ExternalLink className="w-4 h-4" />
              </a>

              {/* Followers / Following */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-[#8b949e] mb-6 w-full">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-white">
                    {profile.followers}
                  </span>{" "}
                  followers
                </div>
                <span>·</span>
                <div>
                  <span className="font-semibold text-white">
                    {profile.following}
                  </span>{" "}
                  following
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="w-full flex flex-col gap-2 text-sm text-[#8b949e]">
                {profile.company && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Building className="w-4 h-4 shrink-0" />
                    <span className="truncate">{profile.company}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                )}
                {profile.blog && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <LinkIcon className="w-4 h-4 shrink-0" />
                    <a
                      href={
                        profile.blog.startsWith("http")
                          ? profile.blog
                          : `https://${profile.blog}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#58a6ff] hover:underline truncate"
                    >
                      {profile.blog}
                    </a>
                  </div>
                )}
                {profile.twitter_username && (
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <svg
                      className="w-4 h-4 shrink-0 fill-current text-[#8b949e]"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <a
                      href={`https://twitter.com/${profile.twitter_username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#58a6ff] hover:underline truncate"
                    >
                      @{profile.twitter_username}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Repositories Section */}
            <div className="lg:col-span-3 mt-8 lg:mt-0">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363d] mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#8b949e]" />
                  <h3 className="text-base font-semibold text-white">
                    Popular Repositories
                  </h3>
                  <span className="bg-[#21262d] text-xs font-semibold text-[#8b949e] px-2 py-0.5 rounded-full border border-[#30363d] ml-2">
                    {profile.public_repos} total
                  </span>
                </div>
              </div>

              {/* Repos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repos.length === 0 ? (
                  <p className="text-sm text-gray-500 col-span-2">
                    No public repositories found.
                  </p>
                ) : (
                  repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="bg-[#0d1117] border border-[#30363d] rounded-md p-4 flex flex-col justify-between hover:border-[#8b949e] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#58a6ff] font-semibold text-sm hover:underline truncate"
                          >
                            {repo.name}
                          </a>
                          <span className="text-[11px] text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded-full capitalize">
                            {repo.visibility}
                          </span>
                        </div>

                        <p className="text-xs text-[#8b949e] line-clamp-2 mb-4 h-8">
                          {repo.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#3178c6]" />
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                          <Star className="w-3.5 h-3.5" />
                          <span>{repo.stargazers_count}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-[#58a6ff]">
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{repo.forks_count}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}