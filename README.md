# 🎧 Uncover

An AI-powered music discovery tool designed to dig deep and find **underground, obscure, and niche** artists based on your personal taste. 

Built with a sleek, minimalist purple interface, this app uses Google Gemini AI to analyze your vibe and Last.fm/iTunes to let you preview the music instantly.

## ✨ Features

* **Deep Cuts Only:** The AI is specifically prompted to recommend "VERY small, niche, or underground artists," helping you break out of the mainstream algorithm bubble.
* **Vibe Analysis:** Generates descriptive tags (e.g., "lo-fi jazz", "dream pop", "melancholy") to describe your specific taste profile.
* **Custom Audio Player:** A clean, custom-built minimalist player to preview 30-second clips of recommended artists.
* **Last.fm Integration:** Direct links to artist pages on Last.fm for deep diving into discographies.
* **Minimalist Purple UI:** A dark, immersive design focused on the content without clutter.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Custom CSS (Purple Dark Mode)

**Backend:**
* Python (FastAPI)
* Google Gemini AI (Text Generation)
* iTunes Search API (Audio Previews & Artwork)
* Last.fm API (Additional Metadata)

## 🚀 Getting Started

### 1. Backend Setup

1.  Navigate to the backend:
    ```bash
    cd backend
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file in the `backend/` folder:
    ```env
    GEMINI_API_KEY="your_google_ai_key"
    LASTFM_API_KEY="your_lastfm_key"
    ```
4.  Start the server:
    ```bash
    uvicorn main:app --reload
    ```

### 2. Frontend Setup

1.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  Install Node dependencies:
    ```bash
    npm install
    ```
3.  Start the React app:
    ```bash
    npm start
    ```

## 🎮 How It Works

1.  **Type Artists:** Enter a few artists you like (e.g., "Nujabes, MF DOOM").
2.  **Analyze:** The backend sends this list to Google Gemini with a prompt specifically requesting **obscure** recommendations.
3.  **Discover:** The app displays:
    * Global "Vibe Tags".
    * 5 Underground Artist Cards.
    * Each card contains artwork, specific tags, a Play button for a snippet, and a link to Last.fm.

## 📄 License

Open Source.
