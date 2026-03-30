import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n||0);
const COLORS = ["#4f6ef7","#7c3aed","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16","#f97316","#6366f1"];
const TipStyle = { background:"#fff", border:"1px solid #e8edf5", borderRadius:10, padding:"8px 12px", fontFamily:"DM Sans, sans-serif", fontSize:12, boxShadow:"0 4px 20px rgba(79,110,247,0.1)" };

// Custom Y-axis tick that truncates long names
function TenantTick({ x, y, payload }) {
  const name = payload.value || "";
  const display = name.length > 22 ? name.substring(0, 20) + "…" : name;
  return (
    <g transform={`translate(${x},${y})`}>
      <title>{name}</title>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#1a2035" fontSize={10} fontFamily="DM Sans, sans-serif">
        {display}
      </text>
    </g>
  );
}

export default function BreakdownCharts({ tenants = [], connectors = [] }) {
  // Dynamic height: 36px per tenant + padding
  const barHeight = Math.max(280, tenants.length * 34 + 20);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:20 }}>
      {/* Top Tenants — horizontal bar, auto-height, wider label column */}
      <div style={{ background:"#fff", borderRadius:16, padding:"22px 24px", border:"1px solid #e8edf5", boxShadow:"0 1px 4px rgba(30,50,120,0.04)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#1a2035", marginBottom:4 }}>Top Tenants</div>
        <div style={{ fontSize:11, color:"#8292b0", marginBottom:16 }}>By total API call volume</div>
        {tenants.length ? (
          <ResponsiveContainer width="100%" height={barHeight}>
            <BarChart data={tenants} layout="vertical" margin={{ top:0, right:24, bottom:0, left:0 }}>
              <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize:10, fill:"#8292b0", fontFamily:"DM Mono, monospace" }}
                tickFormatter={fmt}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={<TenantTick />}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v) => [v.toLocaleString(), "Calls"]}
                contentStyle={TipStyle}
                // Show full tenant name in tooltip
                labelFormatter={(label) => label}
              />
              <Bar dataKey="calls" fill="#4f6ef7" radius={[0,5,5,0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center", color:"#c5cfe0" }}>No data</div>
        )}
      </div>

      {/* Connector Donut */}
      <div style={{ background:"#fff", borderRadius:16, padding:"22px 24px", border:"1px solid #e8edf5", boxShadow:"0 1px 4px rgba(30,50,120,0.04)" }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#1a2035", marginBottom:4 }}>Calls by Connector</div>
        <div style={{ fontSize:11, color:"#8292b0", marginBottom:16 }}>Distribution across connectors</div>
        {connectors.length ? (
          <ResponsiveContainer width="100%" height={barHeight}>
            <PieChart>
              <Pie data={connectors} dataKey="calls" nameKey="name" cx="50%" cy="45%" innerRadius={65} outerRadius={105} paddingAngle={2}>
                {connectors.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v)=>[v.toLocaleString(),"Calls"]} contentStyle={TipStyle} />
              <Legend
                iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize:10, fontFamily:"DM Sans, sans-serif" }}
                formatter={(value) => value.length > 24 ? value.substring(0,22)+"…" : value}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height:280, display:"flex", alignItems:"center", justifyContent:"center", color:"#c5cfe0" }}>No data</div>
        )}
      </div>
    </div>
  );
}
