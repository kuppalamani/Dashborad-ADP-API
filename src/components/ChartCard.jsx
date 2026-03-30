import React from "react";
export default function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 16, padding: "22px 24px", boxShadow: "0 1px 4px rgba(30,50,120,0.04)", ...style }}>
      {title && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2035", letterSpacing: "-0.01em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "#8292b0", marginTop: 2 }}>{subtitle}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
