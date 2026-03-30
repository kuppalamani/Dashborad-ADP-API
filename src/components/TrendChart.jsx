import React, { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n||0);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(79,110,247,0.12)", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ fontSize: 11, color: "#8292b0", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#4f6ef7" }}>{Number(payload[0]?.value || 0).toLocaleString()} <span style={{ fontWeight: 400, color: "#8292b0", fontSize: 11 }}>calls</span></div>
    </div>
  );
};

export default function TrendChart({ daily = [], monthly = [] }) {
  const [view, setView] = useState("daily");
  const data = view === "daily" ? daily : monthly;
  const key  = view === "daily" ? "date" : "month";

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(30,50,120,0.04)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2035" }}>API Call Trends</div>
          <div style={{ fontSize: 11, color: "#8292b0", marginTop: 2 }}>
            {daily.length} days of data
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["daily","monthly"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "5px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none", background: view===v ? "#4f6ef7" : "rgba(79,110,247,0.1)", color: view===v ? "#fff" : "#4f6ef7", transition: "all 0.15s", fontFamily: "DM Sans, sans-serif" }}>
              {v.charAt(0).toUpperCase()+v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f6ef7" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#4f6ef7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={key} tick={{ fontSize: 10, fill: "#8292b0", fontFamily: "DM Mono, monospace" }} axisLine={false} tickLine={false} interval={view==="daily" ? Math.floor(data.length/10) : 0} />
          <YAxis tick={{ fontSize: 10, fill: "#8292b0", fontFamily: "DM Mono, monospace" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="calls" stroke="#4f6ef7" strokeWidth={2.5} fill="url(#grad1)" dot={false} activeDot={{ r: 5, fill: "#4f6ef7" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
