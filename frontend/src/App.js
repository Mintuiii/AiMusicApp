import { useState, useRef } from "react";
import "./App.css";

// --- Custom Player ---
const CustomPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="custom-player">
      <audio 
        ref={audioRef} 
        src={src} 
        onEnded={() => setIsPlaying(false)} 
        onPause={() => setIsPlaying(false)}
      />
      <button className="play-btn" onClick={togglePlay}>
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <span className="player-label">{isPlaying ? "Playing Snippet" : "Play Preview"}</span>
    </div>
  );
};

function App() {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modified analyze to accept an optional argument (for tag clicks)
  const analyze = async (searchTerm = null) => {
    // If searchTerm is passed (from tag click), use it. Otherwise use state 'input'.
    const query = typeof searchTerm === "string" ? searchTerm : input;
    
    if (!query || !query.trim()) return;

    // If it was a tag click, update the input box to show what we are searching
    if (typeof searchTerm === "string") {
      setInput(searchTerm);
    }

    setLoading(true);
    setError("");
    setTags([]);
    setRecs([]);

    try {
      const artists = query.split(",").map(a => a.trim()).filter(Boolean);
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artists }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setTags(data.tags || []);
      setRecs(data.recommendations || []);
    } catch (e) {
      setError("Could not fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle tag clicks
  const handleTagClick = (tag) => {
    analyze(tag);
  };

  // Check if we are in the "initial" state (no results, no loading)
  const isInitial = tags.length === 0 && recs.length === 0 && !loading;

  return (
    <div className="app-container">
      <header className={`header ${isInitial ? 'hero-mode' : ''}`}>
        <h1>Uncover</h1>
        <p className="subtitle">Navigate the underground.</p>
      </header>

      <div className="search-section">
        <textarea
          rows={1}
          placeholder="Enter artists, genres, or a vibe..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              analyze();
            }
          }}
        />
        <button className="btn-main" onClick={() => analyze()} disabled={loading}>
          {loading ? "SEARCHING" : "ANALYZE"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Loading Bar */}
      {loading && (
        <div className="loading-container">
          <div className="loading-bar"></div>
          <p className="loading-text">Triangulating obscure frequencies...</p>
        </div>
      )}

      {/* Landing Page Suggestions (Only show when empty) */}
      {isInitial && !error && (
        <div className="landing-suggestions">
          <p className="suggestion-label">Or start a journey with:</p>
          <div className="tag-cloud center">
            {["Japanese Jazz", "90s Memphis Rap", "Dreampop", "Darkwave", "Ethiopian Funk"].map((t) => (
              <span key={t} className="tag clickable" onClick={() => handleTagClick(t)}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {tags.length > 0 && (
        <div className="vibe-section">
          <span className="section-label">Current Coordinates</span>
          <div className="tag-cloud">
            {tags.map((t, i) => (
              <span key={i} className="tag clickable" onClick={() => handleTagClick(t)}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="artist-list">
        {recs.map((r, i) => (
          <div key={i} className="artist-item">
            <img 
              src={r.image || "https://via.placeholder.com/150/2a0a38/ffffff?text=?"} 
              alt={r.artist} 
              className="artist-img"
            />
            <div className="artist-info">
              <div className="artist-header">
                <h3 className="artist-name">{r.artist}</h3>
                <a href={r.lastFmUrl} target="_blank" rel="noreferrer" className="track-link">
                  Last.fm ↗
                </a>
              </div>
              
              {r.tags && (
                <div className="artist-tags">
                  {r.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="mini-tag clickable" 
                      onClick={() => handleTagClick(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="artist-desc">{r.explanation}</p>

              {r.sampleUrl && (
                <CustomPlayer src={r.sampleUrl} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
