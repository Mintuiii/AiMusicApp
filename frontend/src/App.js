import { useState, useRef } from "react";
import "./App.css";

// --- Custom Minimalist Player Component ---
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

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setTags([]);
    setRecs([]);

    try {
      const artists = input.split(",").map(a => a.trim()).filter(Boolean);
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

  return (
    <div className="app-container">
      <header className="header">
        <h1>Uncover</h1>
        <p className="subtitle">Discover obscure & underground gems based on your taste.</p>
      </header>

      <div className="search-section">
        <textarea
          rows={1}
          placeholder="List some artists..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn-main" onClick={analyze} disabled={loading}>
          {loading ? "DIGGING..." : "ANALYZE"}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {tags.length > 0 && (
        <div className="vibe-section">
          <span className="section-label">Detected Vibe</span>
          <div className="tag-cloud">
            {tags.map((t, i) => (
              <span key={i} className="tag">{t}</span>
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
                {/* Updated to use Last.fm URL */}
                <a href={r.lastFmUrl} target="_blank" rel="noreferrer" className="track-link">
                  Last.fm ↗
                </a>
              </div>
              
              {r.tags && (
                <div className="artist-tags">
                  {r.tags.map((tag, idx) => (
                    <span key={idx} className="mini-tag">{tag}</span>
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
