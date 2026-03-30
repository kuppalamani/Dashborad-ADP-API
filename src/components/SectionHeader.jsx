import React from "react";
export default function SectionHeader({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, margin:"24px 0 14px" }}>
      <span style={{ fontSize:12, fontWeight:700, color:"#1a2035" }}>{label}</span>
      <div style={{ flex:1, height:1, background:"#e8edf5" }} />
    </div>
  );
}
