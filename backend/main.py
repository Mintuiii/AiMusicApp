from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os, json, requests
from dotenv import load_dotenv
from typing import List, Dict, Any

load_dotenv()

# --- Configure Gemini ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
GEMINI_MODEL = "models/gemini-2.5-flash"  # use one from your list

# --- Optional Last.fm ---
LASTFM_KEY = os.getenv("LASTFM_API_KEY")  # optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # during local dev
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArtistInput(BaseModel):
    artists: List[str]

@app.get("/health")
def health():
    return {"ok": True}

# ---------- Helpers ----------
def ai_recommend(artists: List[str]) -> Dict[str, Any]:
    artist_list = ", ".join(artists)
    prompt = f"""
    The user listens to these artists: {artist_list}.
    1) Return 5–8 descriptive tags (genres, moods, themes, style).
    2) Recommend 5 lesser-known artists (avoid mainstream).
    3) For each, give one-sentence why it fits.

    Respond as strict JSON:
    {{
      "tags": ["tag1", "..."],
      "recommendations": [
        {{"artist": "Name", "explanation": "one sentence"}}
      ]
    }}
    """
    model = genai.GenerativeModel(GEMINI_MODEL)
    resp = model.generate_content(prompt)

    try:
        return json.loads(resp.text)
    except Exception:
        # Try to coerce basic JSON if model added extra text
        txt = resp.text.strip()
        start = txt.find("{")
        end = txt.rfind("}")
        if start != -1 and end != -1:
            return json.loads(txt[start:end+1])
        return {"tags": [], "recommendations": []}

def enrich_with_itunes(artist_name: str) -> Dict[str, Any]:
    """
    Get a sample preview + artwork using iTunes Search (no auth).
    """
    try:
        # First: try to get a top track with preview
        r = requests.get(
            "https://itunes.apple.com/search",
            params={
                "term": artist_name,
                "entity": "musicTrack",
                "limit": 1,
            },
            timeout=8,
        )
        data = r.json()
        if data.get("resultCount", 0) > 0:
            item = data["results"][0]
            return {
                "sampleUrl": item.get("previewUrl"),
                "sampleTrack": item.get("trackName"),
                "samplePage": item.get("trackViewUrl"),
                "image": item.get("artworkUrl100", "").replace("100x100bb.jpg", "400x400bb.jpg"),
            }
    except Exception:
        pass
    return {"sampleUrl": None, "sampleTrack": None, "samplePage": None, "image": None}

def fallback_lastfm_image(artist_name: str) -> str | None:
    """
    Optional: fetch a bigger artist image from Last.fm if available.
    """
    if not LASTFM_KEY:
        return None
    try:
        r = requests.get(
            "http://ws.audioscrobbler.com/2.0/",
            params={
                "method": "artist.getinfo",
                "artist": artist_name,
                "api_key": LASTFM_KEY,
                "format": "json",
            },
            timeout=8,
        )
        j = r.json()
        images = j.get("artist", {}).get("image", [])
        # pick the largest image entry if present
        if images:
            # last item is typically the largest (mega)
            return images[-1].get("#text") or None
    except Exception:
        pass
    return None

def enrich_recommendations(recs: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    enriched = []
    for r in recs:
        name = r.get("artist", "")
        meta = enrich_with_itunes(name)
        # If no artwork from iTunes, try Last.fm
        if not meta.get("image"):
            lf_img = fallback_lastfm_image(name)
            if lf_img:
                meta["image"] = lf_img
        enriched.append({
            "artist": name,
            "explanation": r.get("explanation", ""),
            "image": meta.get("image"),
            "sampleUrl": meta.get("sampleUrl"),
            "sampleTrack": meta.get("sampleTrack"),
            "samplePage": meta.get("samplePage"),
        })
    return enriched

# ---------- Routes ----------
@app.post("/analyze")
def analyze_artists(data: ArtistInput):
    base = ai_recommend(data.artists or [])
    tags = base.get("tags", [])
    recs = base.get("recommendations", [])[:5]  # keep it snappy
    enriched = enrich_recommendations(recs)
    return {"tags": tags, "recommendations": enriched}
