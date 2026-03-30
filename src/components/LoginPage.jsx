import React, { useState } from "react";
import { BarChart2, Eye, EyeOff, Lock, User } from "lucide-react";
import { login } from "../utils/auth";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) { setError("Please enter both username and password."); return; }
    setLoading(true); setError("");
    // Simulate a small delay so it feels like a real auth check
    await new Promise((r) => setTimeout(r, 600));
    const result = login(username, password);
    setLoading(false);
    if (result.ok) onLogin(result.user);
    else setError(result.error);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f4f0ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: "linear-gradient(135deg, #4f6ef7, #7c3aed)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(79,110,247,0.28)" }}>
            <BarChart2 size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4f6ef7", letterSpacing: "0.18em", textTransform: "uppercase" }}>Aqure</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1a2035", letterSpacing: "-0.03em", margin: "6px 0 4px" }}>Team SRE Portal</h1>
          <p style={{ fontSize: 13, color: "#8292b0" }}>Sign in to access the API Analytics Dashboard</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 8px 40px rgba(30,50,120,0.1)", border: "1px solid #e8edf5" }}>
          {/* Error */}
          {error && (
            <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={13} color="#dc2626" /> {error}
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Username</label>
            <div style={{ position: "relative" }}>
              <User size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c5cfe0" }} />
              <input
                value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={handleKey}
                placeholder="Enter username"
                style={{ width: "100%", background: "#f4f6fb", border: "1.5px solid #e8edf5", borderRadius: 10, padding: "11px 12px 11px 36px", fontSize: 14, color: "#1a2035", outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box", transition: "border-color 0.15s" }}
                onFocus={(e) => e.target.style.borderColor = "#4f6ef7"}
                onBlur={(e) => e.target.style.borderColor = "#e8edf5"}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c5cfe0" }} />
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKey}
                placeholder="Enter password"
                style={{ width: "100%", background: "#f4f6fb", border: "1.5px solid #e8edf5", borderRadius: 10, padding: "11px 40px 11px 36px", fontSize: 14, color: "#1a2035", outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box", transition: "border-color 0.15s" }}
                onFocus={(e) => e.target.style.borderColor = "#4f6ef7"}
                onBlur={(e) => e.target.style.borderColor = "#e8edf5"}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#c5cfe0", padding: 0, display: "flex" }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", background: loading ? "#a5b4fc" : "linear-gradient(135deg, #4f6ef7, #7c3aed)", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading ? "wait" : "pointer", fontFamily: "DM Sans, sans-serif", transition: "opacity 0.15s", letterSpacing: "0.02em" }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#c5cfe0" }}>
          Aqure API Analytics · Secure Access
        </div>
      </div>
    </div>
  );
}
