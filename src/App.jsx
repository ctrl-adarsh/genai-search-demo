import React, { useState, useEffect, useRef } from "react";

// Matrix Rain Canvas Component
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = "10"; // Classic binary look or full character set
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };
    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }}
    />
  );
};

export default function App() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiCalls, setApiCalls] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setResult("");
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    // inside your useEffect in App.jsx
    const timer = setTimeout(async () => {
      setIsTyping(false);
      setApiCalls((p) => p + 1);

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        // Even if the server has a 500 error, we handle the JSON response
        const data = await res.json();
        setResult(data.text || data.error || ">> NO_DATA_RETURNED");
      } catch (err) {
        setResult(">> NETWORK_TIMEOUT: CHECK_UPLINK_STATUS");
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={styles.page}>
      <MatrixRain />
      <div style={styles.container}>
        <h1 style={styles.title}>TERMINAL_SEARCH_v2</h1>
        <div style={styles.stats}>
          <span>[ KEYS: {keystrokes} ]</span>
          <span>
            [ API_HITS: <span style={{ color: "#FFF" }}>{apiCalls}</span> ]
          </span>
        </div>
        <div style={styles.inputBar}>
          {/* THE FIX: Wrap >>> in braces as a string */}
          <span style={{ color: "#0F0", marginRight: "10px" }}>{">>>"}</span>
          <input
            autoFocus
            type="text"
            placeholder="INPUT_QUERY..."
            onChange={(e) => {
              setQuery(e.target.value);
              setKeystrokes((k) => k + 1);
            }}
            style={styles.input}
          />
        </div>
        <div style={styles.output}>
          {isTyping ? (
            <p style={styles.blink}>DECRYPTING...</p>
          ) : (
            <p>{result || "> AWAITING_CMD"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: "650px",
    backgroundColor: "rgba(0, 15, 0, 0.95)",
    border: "1px solid #0F0",
    padding: "30px",
    color: "#0F0",
    fontFamily: "monospace",
  },
  title: {
    textAlign: "center",
    fontSize: "1.2rem",
    letterSpacing: "3px",
    borderBottom: "1px solid #0F0",
    paddingBottom: "10px",
  },
  stats: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.7rem",
    margin: "10px 0",
  },
  inputBar: {
    display: "flex",
    borderBottom: "1px solid #040",
    padding: "10px 0",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#0F0",
    outline: "none",
    fontFamily: "monospace",
  },
  output: {
    marginTop: "20px",
    minHeight: "120px",
    backgroundColor: "#000",
    padding: "15px",
    border: "1px solid #020",
    overflowY: "auto",
  },
  blink: { animation: "pulse 1s infinite" },
};
