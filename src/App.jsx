import React, { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- Background Component: Matrix Rain ---
const MatrixRain = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
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

// --- Main App Component ---
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
    const timer = setTimeout(async () => {
      setIsTyping(false);
      setApiCalls((prev) => prev + 1);

      try {
        const response = await model.generateContent(`
          You are a high-tech search terminal. Provide a concise, clear answer.
          Query: ${query}
        `);
        setResult(response.response.text());
      } catch (err) {
        setResult(">> CONNECTION_FAILED: Verify VITE_GEMINI_KEY in .env");
      }
    }, 800); // 800ms Debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={styles.page}>
      <MatrixRain />

      <div style={styles.uiContainer}>
        <h1 style={styles.title}>SEARCH_PROTOCOL_v2.5</h1>

        <div style={styles.statsRow}>
          <div style={styles.stat}>[ KEY_LOGS: {keystrokes} ]</div>
          <div style={styles.stat}>
            [ API_REQUESTS: <span style={{ color: "#fff" }}>{apiCalls}</span> ]
          </div>
        </div>

        <div style={styles.inputBox}>
          <span style={styles.prompt}>{">>>"}</span>
          <input
            autoFocus
            type="text"
            placeholder="ACCESSING_DATABASE..."
            onChange={(e) => {
              setQuery(e.target.value);
              setKeystrokes((prev) => prev + 1);
            }}
            style={styles.input}
          />
        </div>

        <div style={styles.resultDisplay}>
          {isTyping ? (
            <p style={styles.loadingText}>SYNCHRONIZING DATA...</p>
          ) : (
            <div style={styles.content}>
              {result || "SYSTEM_IDLE: AWAITING_ENCRYPTED_QUERY"}
            </div>
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
  uiContainer: {
    width: "90%",
    maxWidth: "700px",
    backgroundColor: "rgba(0, 10, 0, 0.85)",
    border: "1px solid #00FF41",
    boxShadow: "0 0 30px #00FF4155",
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: '"Courier New", Courier, monospace',
    color: "#00FF41",
  },
  title: {
    margin: 0,
    fontSize: "1.2rem",
    letterSpacing: "4px",
    textAlign: "center",
    borderBottom: "1px solid #00FF41",
    paddingBottom: "10px",
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
  },
  inputBox: {
    display: "flex",
    borderBottom: "1px solid #00FF41",
    padding: "10px 0",
  },
  prompt: { marginRight: "15px", fontWeight: "bold" },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#00FF41",
    outline: "none",
    fontSize: "1.1rem",
    fontFamily: "inherit",
  },
  resultDisplay: {
    flex: 1,
    minHeight: "150px",
    backgroundColor: "#000800",
    padding: "20px",
    border: "1px solid #003300",
    overflowY: "auto",
  },
  loadingText: { animation: "pulse 1s infinite", color: "#888" },
  content: { lineHeight: "1.6", whiteSpace: "pre-wrap" },
};
