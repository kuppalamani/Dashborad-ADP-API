import React, { useState } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : (n||0).toLocaleString();

export default function PivotTable({ data = {} }) {
  const { tenants=[], dates=[], matrix={}, tenantTotals={}, pctChange={} } = data;
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("total"); // "total" | "name" | "pct"
  const [sortDir, setSortDir] = useState("desc");

  const filtered = tenants
    .filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let va, vb;
      if (sortBy === "name")  { va = a; vb = b; return sortDir==="asc" ? va.localeCompare(vb) : vb.localeCompare(va); }
      if (sortBy === "pct")   { va = pctChange[a]??-999; vb = pctChange[b]??-999; }
      else                    { va = tenantTotals[a]||0; vb = tenantTotals[b]||0; }
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const sort = (key) => { if (sortBy===key) setSortDir(d=>d==="asc"?"desc":"asc"); else { setSortBy(key); setSortDir("desc"); } };

  // Column-max for heatmap colouring inside cells
  const colMax = {};
  dates.forEach((d) => {
    colMax[d] = Math.max(0, ...tenants.map((t) => matrix[`${t}||${d}`]||0));
  });
  const maxTotal = Math.max(1, ...tenants.map((t)=>tenantTotals[t]||0));

  function cellBg(val, max) {
    if (!val || !max) return "transparent";
    const t = Math.min(val/max, 1);
    return `rgba(79,110,247,${0.07 + t*0.28})`;
  }

  // Format display date: "2026-03-23" → "23/3"
  const fmtDate = (d) => { const [,m,day] = d.split("-"); return `${parseInt(day)}/${parseInt(m)}`; };

  if (!tenants.length) return (
    <div style={{ padding:32, textAlign:"center", color:"#c5cfe0", fontSize:13 }}>No data — upload a sheet first</div>
  );

  return (
    <div style={{ fontFamily:"DM Sans, sans-serif" }}>
      {/* Controls */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:11, color:"#8292b0" }}>
          <strong style={{ color:"#1a2035" }}>{filtered.length}</strong> tenants · last <strong style={{ color:"#1a2035" }}>{dates.length}</strong> days shown
        </div>
        <div style={{ position:"relative" }}>
          <Search size={12} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#c5cfe0" }} />
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Filter tenant…"
            style={{ background:"#f4f6fb", border:"1.5px solid #e8edf5", borderRadius:8, padding:"5px 10px 5px 26px", fontSize:11, color:"#1a2035", outline:"none", width:180, fontFamily:"DM Sans, sans-serif" }} />
        </div>
      </div>

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:700 }}>
          <thead>
            <tr style={{ background:"#f8faff" }}>
              <th onClick={()=>sort("name")} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color: sortBy==="name"?"#4f6ef7":"#8292b0", textTransform:"uppercase", letterSpacing:"0.07em", cursor:"pointer", position:"sticky", left:0, background:"#f8faff", borderBottom:"2px solid #e8edf5", whiteSpace:"nowrap", minWidth:160 }}>
                Tenant Name {sortBy==="name" ? (sortDir==="asc"?"↑":"↓") : ""}
              </th>
              {dates.map((d) => (
                <th key={d} style={{ padding:"10px 8px", textAlign:"right", fontSize:11, fontWeight:700, color:"#8292b0", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"2px solid #e8edf5", whiteSpace:"nowrap", minWidth:72 }}>
                  {fmtDate(d)}
                </th>
              ))}
              <th onClick={()=>sort("total")} style={{ padding:"10px 14px", textAlign:"right", fontSize:11, fontWeight:700, color: sortBy==="total"?"#4f6ef7":"#8292b0", textTransform:"uppercase", letterSpacing:"0.07em", cursor:"pointer", borderBottom:"2px solid #e8edf5", whiteSpace:"nowrap", borderLeft:"2px solid #e8edf5" }}>
                7-Day Total {sortBy==="total" ? (sortDir==="asc"?"↑":"↓") : ""}
              </th>
              <th onClick={()=>sort("pct")} style={{ padding:"10px 14px", textAlign:"right", fontSize:11, fontWeight:700, color: sortBy==="pct"?"#4f6ef7":"#8292b0", textTransform:"uppercase", letterSpacing:"0.07em", cursor:"pointer", borderBottom:"2px solid #e8edf5", whiteSpace:"nowrap" }}>
                % Change {sortBy==="pct" ? (sortDir==="asc"?"↑":"↓") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tenant, i) => {
              const total = tenantTotals[tenant]||0;
              const pct   = pctChange[tenant];
              const barW  = Math.round((total/maxTotal)*100);
              return (
                <tr key={tenant} style={{ borderBottom:"1px solid #f4f6fb" }}
                  onMouseEnter={(e)=>e.currentTarget.style.background="#f8faff"}
                  onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}>
                  {/* Tenant name — sticky */}
                  <td style={{ padding:"9px 14px", fontWeight:600, color:"#1a2035", position:"sticky", left:0, background:"inherit", whiteSpace:"nowrap", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis" }}>
                    {i < 3 && <span style={{ marginRight:5 }}>{i===0?"🥇":i===1?"🥈":"🥉"}</span>}
                    {tenant}
                  </td>
                  {/* Daily cells */}
                  {dates.map((d) => {
                    const val = matrix[`${tenant}||${d}`]||0;
                    return (
                      <td key={d} style={{ padding:"9px 8px", textAlign:"right", fontFamily:"DM Mono, monospace", fontSize:11, background:cellBg(val, colMax[d]), color: val>0 ? "#1a2035" : "#c5cfe0" }}>
                        {val > 0 ? val.toLocaleString() : "—"}
                      </td>
                    );
                  })}
                  {/* 7-day total with mini bar */}
                  <td style={{ padding:"9px 14px", textAlign:"right", borderLeft:"2px solid #f4f6fb" }}>
                    <div style={{ fontWeight:700, color:"#1a2035", fontFamily:"DM Mono, monospace" }}>{fmt(total)}</div>
                    <div style={{ width:"100%", height:3, background:"#eef1f8", borderRadius:2, marginTop:3, overflow:"hidden" }}>
                      <div style={{ width:`${barW}%`, height:"100%", background:"#4f6ef7", borderRadius:2 }} />
                    </div>
                  </td>
                  {/* % change */}
                  <td style={{ padding:"9px 14px", textAlign:"right" }}>
                    {pct === null ? (
                      <span style={{ fontSize:10, color:"#c5cfe0" }}>N/A</span>
                    ) : (
                      <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:11, fontWeight:700, color: pct>=0 ? "#10b981" : "#ef4444" }}>
                        {pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {pct >= 0 ? "+" : ""}{pct}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td colSpan={dates.length+3} style={{ padding:24, textAlign:"center", color:"#c5cfe0" }}>No tenants match</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
