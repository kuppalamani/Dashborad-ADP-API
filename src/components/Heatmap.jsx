import React, { useState, useMemo } from "react";

const CELL = 14;   // cell size px
const GAP  = 2;    // gap between cells
const LABEL_W = 130; // tenant label column width

// Blue-purple gradient: light → dark
function cellColor(val, max) {
  if (!max || val === 0) return "#eef1f8";
  const t = Math.min(val / max, 1);
  // 5-stop: very light blue → mid blue → deep indigo
  if (t < 0.2)  return `hsl(${220 + t*5*10},${60+t*5*20}%,${92-t*5*12}%)`;
  if (t < 0.4)  return `hsl(${225+(t-0.2)*5*5},${70+(t-0.2)*5*10}%,${80-(t-0.2)*5*15}%)`;
  if (t < 0.6)  return `hsl(${228+(t-0.4)*5*5},${78+(t-0.4)*5*5}%,${65-(t-0.4)*5*12}%)`;
  if (t < 0.8)  return `hsl(${232+(t-0.6)*5*3},${82+(t-0.6)*5*3}%,${53-(t-0.6)*5*8}%)`;
  return         `hsl(${235+(t-0.8)*5*3},${86+(t-0.8)*5*2}%,${37-(t-0.8)*5*4}%)`;
}

// Group dates by month for month header separators
function groupByMonth(dates) {
  const groups = [];
  let cur = null;
  dates.forEach((d, i) => {
    const m = d.substring(0, 7);
    if (!cur || cur.month !== m) { cur = { month: m, label: d.substring(5,7)+"/"+d.substring(2,4), start: i, count: 0 }; groups.push(cur); }
    cur.count++;
  });
  return groups;
}

export default function Heatmap({ data = {} }) {
  const tenants = data?.tenants || [];
  const dates   = data?.dates   || [];
  const matrix  = data?.matrix  || {};
  const [tip, setTip] = useState(null);
  const [search, setSearch] = useState("");

  const filteredTenants = useMemo(() =>
    tenants.filter(t => t.toLowerCase().includes(search.toLowerCase())),
    [tenants, search]
  );

  if (!tenants.length || !dates.length) {
    return <div style={{ padding: 24, color: "#c5cfe0", fontSize: 13, textAlign: "center" }}>No data to display</div>;
  }

  const maxVal = Math.max(0, ...tenants.flatMap((t) => dates.map((d) => matrix[`${t}||${d}`] || 0)));
  const monthGroups = groupByMonth(dates);
  const totalW = dates.length * (CELL + GAP);

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif" }}>
      {/* Tenant search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <div style={{ fontSize: 11, color: "#8292b0" }}>
          <strong style={{ color: "#1a2035" }}>{filteredTenants.length}</strong> tenants · <strong style={{ color: "#1a2035" }}>{dates.length}</strong> days
        </div>
        <div style={{ position: "relative" }}>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter tenants…"
            style={{ background: "#f4f6fb", border: "1.5px solid #e8edf5", borderRadius: 8, padding: "5px 10px 5px 28px", fontSize: 11, color: "#1a2035", outline: "none", width: 160, fontFamily: "DM Sans, sans-serif" }}
          />
          <svg width="12" height="12" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} viewBox="0 0 24 24" fill="none" stroke="#c5cfe0" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 520, position: "relative" }}>
        <div style={{ display: "flex", minWidth: LABEL_W + totalW + 20 }}>

          {/* Left column: tenant labels — sticky */}
          <div style={{ width: LABEL_W, flexShrink: 0, marginTop: 36 /* month header height */ }}>
            {filteredTenants.map((t) => (
              <div key={t} style={{ height: CELL + GAP, display: "flex", alignItems: "center", fontSize: 10, color: "#8292b0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8, width: LABEL_W, cursor: "default" }}
                title={t}>{t}</div>
            ))}
          </div>

          {/* Right: month headers + grid */}
          <div style={{ flex: 1, minWidth: totalW }}>
            {/* Month headers */}
            <div style={{ display: "flex", height: 36, alignItems: "flex-end", marginBottom: 2 }}>
              {monthGroups.map((g) => (
                <div key={g.month} style={{ width: g.count * (CELL + GAP) - GAP, flexShrink: 0, fontSize: 9, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: 4, borderLeft: "1px solid #e8edf5", paddingLeft: 4, overflow: "hidden", whiteSpace: "nowrap" }}>
                  {g.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filteredTenants.map((tenant) => (
              <div key={tenant} style={{ display: "flex", height: CELL + GAP }}>
                {dates.map((date) => {
                  const val = matrix[`${tenant}||${date}`] || 0;
                  return (
                    <div key={date}
                      style={{ width: CELL, height: CELL, borderRadius: 2, background: cellColor(val, maxVal), marginRight: GAP, flexShrink: 0, cursor: val > 0 ? "pointer" : "default", transition: "transform 0.1s", boxSizing: "content-box" }}
                      onMouseEnter={(e) => val > 0 && setTip({ tenant, date, val, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tip && (
        <div style={{ position: "fixed", left: tip.x + 14, top: tip.y - 14, zIndex: 9999, background: "#1a2035", borderRadius: 10, padding: "10px 14px", fontSize: 11, pointerEvents: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", minWidth: 160 }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 2 }}>{tip.tenant}</div>
          <div style={{ color: "#8292b0", marginBottom: 6, fontSize: 10 }}>{tip.date}</div>
          <div style={{ fontWeight: 700, color: "#4f6ef7", fontFamily: "DM Mono, monospace", fontSize: 14 }}>{Number(tip.val).toLocaleString()}</div>
          <div style={{ color: "#8292b0", fontSize: 10 }}>API calls</div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
        <span style={{ fontSize: 10, color: "#c5cfe0", fontWeight: 600 }}>Less</span>
        {[0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((t) => (
          <div key={t} style={{ width: 14, height: 14, borderRadius: 3, background: cellColor(t * maxVal, maxVal), border: t === 0 ? "1px solid #e8edf5" : "none" }} />
        ))}
        <span style={{ fontSize: 10, color: "#c5cfe0", fontWeight: 600 }}>More</span>
        <span style={{ fontSize: 10, color: "#c5cfe0", marginLeft: 12 }}>Hover a cell for details</span>
      </div>
    </div>
  );
}
