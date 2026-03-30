import React, { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(0)}K` : String(n||0);

const MONTH_COLORS = ["#4f6ef7","#7c3aed","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#f97316","#14b8a6","#84cc16","#a855f7"];

const TipStyle = { background:"#fff", border:"1px solid #e8edf5", borderRadius:10, padding:"10px 14px", fontFamily:"DM Sans, sans-serif", fontSize:12, boxShadow:"0 4px 20px rgba(79,110,247,0.12)" };

function MonthName(ym) {
  const [y, m] = ym.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m)-1]} ${y}`;
}

export default function MonthlyGraphs({ months = [] }) {
  const [idx, setIdx] = useState(months.length - 1); // start at latest month

  if (!months.length) return (
    <div style={{ padding:32, textAlign:"center", color:"#c5cfe0", fontSize:13 }}>No monthly data — upload a sheet first</div>
  );

  const cur = months[Math.min(idx, months.length-1)];
  const color = MONTH_COLORS[idx % MONTH_COLORS.length];

  return (
    <div>
      {/* Month overview bar chart */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#1a2035", marginBottom:4 }}>All Months Overview</div>
        <div style={{ fontSize:11, color:"#8292b0", marginBottom:14 }}>Total API calls per month</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={months} margin={{ top:5, right:5, bottom:0, left:0 }}
            onClick={(e) => { if (e?.activeTooltipIndex != null) setIdx(e.activeTooltipIndex); }}>
            <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickFormatter={MonthName} tick={{ fontSize:10, fill:"#8292b0", fontFamily:"DM Mono, monospace" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:10, fill:"#8292b0" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
            <Tooltip formatter={(v)=>[v.toLocaleString(),"Calls"]} labelFormatter={MonthName} contentStyle={TipStyle} />
            <Bar dataKey="calls" radius={[5,5,0,0]} barSize={28}
              fill="#e8edf5"
              // highlight selected month
              label={false}>
              {months.map((m, i) => (
                <rect key={i} fill={i===idx ? color : "#d0d8f0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize:10, color:"#c5cfe0", textAlign:"center", marginTop:4 }}>Click a bar to drill into that month</div>
      </div>

      <div style={{ height:1, background:"#e8edf5", margin:"0 0 20px" }} />

      {/* Selected month drill-down */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:16, fontWeight:800, color:"#1a2035", letterSpacing:"-0.02em" }}>
            {MonthName(cur.month)}
          </div>
          <div style={{ fontSize:11, color:"#8292b0", marginTop:2 }}>
            Total: <strong style={{ color, fontFamily:"DM Mono, monospace" }}>{cur.calls.toLocaleString()}</strong> calls · {cur.daily.length} days
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>setIdx(Math.max(0,idx-1))} disabled={idx===0}
            style={{ background:"#f4f6fb", border:"1px solid #e8edf5", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:idx===0?"not-allowed":"pointer", opacity:idx===0?0.4:1 }}>
            <ChevronLeft size={14} color="#8292b0" />
          </button>
          <button onClick={()=>setIdx(Math.min(months.length-1,idx+1))} disabled={idx===months.length-1}
            style={{ background:"#f4f6fb", border:"1px solid #e8edf5", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:idx===months.length-1?"not-allowed":"pointer", opacity:idx===months.length-1?0.4:1 }}>
            <ChevronRight size={14} color="#8292b0" />
          </button>
        </div>
      </div>

      {/* Daily area chart for selected month */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={cur.daily} margin={{ top:5, right:5, bottom:0, left:0 }}>
          <defs>
            <linearGradient id={`mg${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8edf5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize:10, fill:"#8292b0", fontFamily:"DM Mono, monospace" }} axisLine={false} tickLine={false} interval={Math.floor(cur.daily.length/8)} />
          <YAxis tick={{ fontSize:10, fill:"#8292b0" }} axisLine={false} tickLine={false} tickFormatter={fmt} width={52} />
          <Tooltip formatter={(v)=>[v.toLocaleString(),"Calls"]} contentStyle={TipStyle} />
          <Area type="monotone" dataKey="calls" stroke={color} strokeWidth={2.5} fill={`url(#mg${idx})`} dot={false} activeDot={{ r:5, fill:color }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
