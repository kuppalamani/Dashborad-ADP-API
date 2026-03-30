import React, { useRef, useEffect } from "react";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n||0);
const COLORS = ["#4f6ef7","#7c3aed","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#f97316","#14b8a6"];

export default function ConnectorTicker({ connectors = [] }) {
  const trackRef = useRef(null);
  const items = connectors.length ? [...connectors, ...connectors, ...connectors] : [];

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;
    let pos = 0, raf;
    const step = () => {
      pos += 0.5;
      const sw = track.scrollWidth / 3;
      if (pos >= sw) pos = 0;
      track.style.transform = `translateX(-${pos}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  if (!connectors.length) return null;

  return (
    <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e8edf5", marginBottom:20, overflow:"hidden", boxShadow:"0 1px 4px rgba(30,50,120,0.04)" }}>
      <div style={{ padding:"10px 20px 0", display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", boxShadow:"0 0 0 3px rgba(16,185,129,0.2)", animation:"pulse 2s ease-in-out infinite" }} />
        <span style={{ fontSize:10, fontWeight:700, color:"#8292b0", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          Last 7 Days — Top Connectors &amp; Tenants
        </span>
        <span style={{ fontSize:9, color:"#c5cfe0", marginLeft:"auto" }}>Sorted by API calls</span>
      </div>

      <div style={{ padding:"10px 0 12px", overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:48, background:"linear-gradient(to right, #fff, transparent)", zIndex:2, pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:48, background:"linear-gradient(to left, #fff, transparent)", zIndex:2, pointerEvents:"none" }} />

        <div ref={trackRef} style={{ display:"flex", gap:8, willChange:"transform", paddingLeft:20 }}>
          {items.map((c, i) => {
            const baseIdx = connectors.indexOf(connectors.find((x) => x.connector===c.connector && x.tenantName===c.tenantName));
            const color = COLORS[(baseIdx < 0 ? i : baseIdx) % COLORS.length];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:0, background:"#f4f6fb", borderRadius:20, flexShrink:0, border:"1px solid #e8edf5", overflow:"hidden" }}>
                {/* Connector pill */}
                <div style={{ padding:"6px 10px 6px 10px", display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"#1a2035", whiteSpace:"nowrap" }}>{c.connector}</span>
                </div>
                {/* Separator */}
                <div style={{ width:1, height:20, background:"#e8edf5" }} />
                {/* Tenant name */}
                <div style={{ padding:"6px 8px", display:"flex", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"#8292b0", whiteSpace:"nowrap", fontStyle:"italic" }}>{c.tenantName}</span>
                </div>
                {/* Separator */}
                <div style={{ width:1, height:20, background:"#e8edf5" }} />
                {/* Calls */}
                <div style={{ padding:"6px 12px 6px 8px" }}>
                  <span style={{ fontSize:11, fontWeight:800, color, fontFamily:"DM Mono, monospace", whiteSpace:"nowrap" }}>{fmt(c.calls)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,0.2)} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0.1)} }`}</style>
    </div>
  );
}
