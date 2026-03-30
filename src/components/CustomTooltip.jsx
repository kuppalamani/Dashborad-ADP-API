import React from "react";
export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #e8edf5", borderRadius:10, padding:"10px 14px", fontSize:12, fontFamily:"DM Sans, sans-serif", boxShadow:"0 4px 20px rgba(79,110,247,0.12)" }}>
      <div style={{ color:"#8292b0", marginBottom:6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:12, color:p.color, fontWeight:600 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily:"DM Mono, monospace" }}>{(p.value||0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
