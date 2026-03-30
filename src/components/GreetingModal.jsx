import React, { useState, useEffect } from "react";

const QUOTES = [
  "Great teams don't happen by accident — they happen because of people like you.",
  "Reliability is not a feature, it's a foundation. Thanks for building it every day.",
  "Every system you keep running is a promise kept to thousands of users.",
  "The best SREs aren't just problem-solvers — they're problem-preventers.",
  "Behind every great product is a great SRE team. That's you.",
  "Uptime is a team sport. Glad you're on this team.",
  "Your work may be invisible when it's working — that's how you know it's excellent.",
  "Keep calm and monitor on. You've got this.",
  "Excellence is not an act, but a habit. Welcome back.",
  "Great things happen when great people show up. Welcome.",
];

function getGreetingTime() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTodayQuote() {
  const day = new Date().getDay(); // 0–6, consistent for the day
  return QUOTES[day % QUOTES.length];
}

export default function GreetingModal({ session, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    const t = setTimeout(() => setVisible(true), 50);
    // Auto-close after 5 seconds
    const t2 = setTimeout(() => handleClose(), 5000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const greeting = getGreetingTime();
  const quote    = getTodayQuote();
  const initials = session.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      onClick={handleClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,15,40,0.45)", backdropFilter: "blur(4px)", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 24, padding: "40px 44px", maxWidth: 440, width: "90%", textAlign: "center", boxShadow: "0 24px 80px rgba(30,50,120,0.18)", transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(16px)", transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease", opacity: visible ? 1 : 0, position: "relative" }}>

        {/* Avatar */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(79,110,247,0.3)", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
          {initials}
        </div>

        {/* Greeting */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "#8292b0", marginBottom: 6, letterSpacing: "0.04em" }}>
          {greeting},
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: "#1a2035", letterSpacing: "-0.03em", margin: "0 0 4px" }}>
          {session.name}! 👋
        </h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: session.role === "Admin" ? "rgba(79,110,247,0.08)" : "rgba(16,185,129,0.08)", borderRadius: 20, padding: "4px 12px", marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: session.role === "Admin" ? "#4f6ef7" : "#10b981" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: session.role === "Admin" ? "#4f6ef7" : "#10b981" }}>{session.role}</span>
        </div>

        {/* Quote */}
        <div style={{ background: "linear-gradient(135deg, #f0f4ff, #f4f0ff)", borderRadius: 14, padding: "18px 20px", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#8292b0", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Today's thought</div>
          <p style={{ fontSize: 13, color: "#1a2035", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>
            "{quote}"
          </p>
        </div>

        {/* CTA */}
        <button onClick={handleClose} style={{ background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", border: "none", borderRadius: 12, padding: "12px 32px", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.02em" }}>
          Let's get to work →
        </button>

        <div style={{ marginTop: 12, fontSize: 10, color: "#c5cfe0" }}>
          This will close automatically in a few seconds · click anywhere to dismiss
        </div>
      </div>
    </div>
  );
}
