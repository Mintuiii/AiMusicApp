import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [tags, setTags] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
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
      if (!res.ok) throw new Error(`Backend ${res.status}`);
      const data = await res.json();
      setTags(data.tags || []);
      setRecs(data.recommendations || []);
    } catch (e) {
      setError("Network/Server error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>🎧 AI Music Discovery</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Enter artists you like (comma-separated), then I’ll tag the vibe and surface underrated artists—with images and 30s samples.
      </p>

      <textarea
        rows={3}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
        placeholder="Lamp, Nujabes, Tomppabeats"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={analyze}
        disabled={loading}
        style={{
          marginTop: 12, padding: "10px 16px", borderRadius: 12, border: "none",
          background: "#111", color: "white", cursor: "pointer"
        }}
      >
        {loading ? "Analyzing..." : "Discover Music"}
      </button>

      {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

      {tags.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Tags</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tags.map((t, i) => (
              <span key={i} style={{ background: "#eee", padding: "6px 12px", borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </>
      )}

      {recs.length > 0 && (
        <>
          <h2 style={{ marginTop: 24 }}>Recommended Artists</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {recs.map((r, i) => (
              <div key={i} style={{
                border: "1px solid #eee", borderRadius: 14, padding: 14,
                display: "flex", flexDirection: "column", gap: 10
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img
                    src={r.image || "https://via.placeholder.com/400?text=No+Image"}
                    alt={r.artist}
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.artist}</div>
                    {r.sampleTrack && (
                      <a href={r.samplePage} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#555" }}>
                        {r.sampleTrack}
                      </a>
                    )}
                  </div>
                </div>

                <p style={{ margin: 0, color: "#444" }}>{r.explanation}</p>

                {r.sampleUrl ? (
                  <audio controls src={r.sampleUrl} style={{ width: "100%" }} />
                ) : (
                  <div style={{ fontSize: 12, color: "#777" }}>No preview available</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
