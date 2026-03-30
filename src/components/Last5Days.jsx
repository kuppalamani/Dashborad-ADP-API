import React from "react";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n || 0);

export default function Last5Days({ days = [] }) {
  if (!days.length) return null;

  const max = Math.max(...days.map((d) => d.calls));

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(30,50,120,0.04)", marginBottom: 20 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2035" }}>Last 5 Days — API Calls</div>
        <div style={{ fontSize: 11, color: "#8292b0", marginTop: 2 }}>Daily totals across all tenants &amp; connectors</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 12 }}>
        {days.map((day, i) => {
          const isLast  = i === days.length - 1;
          const pct     = max ? (day.calls / max) * 100 : 0;
          const [y,m,d] = day.date.split("-");
          const label   = `${d}/${m}/${y.slice(2)}`; // back to d/m/yy for display

          return (
            <div key={day.date} style={{
              background:   isLast ? "linear-gradient(135deg,#4f6ef7,#7c3aed)" : "#f4f6fb",
              borderRadius: 14,
              padding:      "18px 16px",
              border:       `1px solid ${isLast ? "transparent" : "#e8edf5"}`,
              position:     "relative",
              overflow:     "hidden",
            }}>
              {/* Bar fill background */}
              {!isLast && (
                <div style={{ position: "absolute", bottom: 0, left: 0, width: `${pct}%`, height: 4, background: "#4f6ef7", borderRadius: "0 4px 0 0", opacity: 0.5 }} />
              )}

              <div style={{ fontSize: 11, fontWeight: 700, color: isLast ? "rgba(255,255,255,0.7)" : "#8292b0", marginBottom: 8, letterSpacing: "0.04em" }}>
                {label}
                {isLast && <span style={{ marginLeft: 6, fontSize: 9, background: "rgba(255,255,255,0.2)", borderRadius: 4, padding: "1px 5px" }}>LATEST</span>}
              </div>

              <div style={{ fontSize: 26, fontWeight: 800, color: isLast ? "#fff" : "#1a2035", letterSpacing: "-0.03em", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                {fmt(day.calls)}
              </div>

              <div style={{ fontSize: 10, color: isLast ? "rgba(255,255,255,0.6)" : "#c5cfe0", marginTop: 4 }}>
                {day.calls.toLocaleString()} calls
              </div>

              {/* delta vs previous */}
              {i > 0 && (() => {
                const prev  = days[i - 1].calls;
                const delta = day.calls - prev;
                const pctD  = prev ? ((delta / prev) * 100).toFixed(1) : "0";
                const up    = delta >= 0;
                return (
                  <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: isLast ? "rgba(255,255,255,0.8)" : (up ? "#10b981" : "#ef4444") }}>
                    {up ? "↑" : "↓"} {Math.abs(pctD)}% vs prev day
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
