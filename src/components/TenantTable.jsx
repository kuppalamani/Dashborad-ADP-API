import React, { useState } from "react";
import { ChevronUp, ChevronDown, Search, ChevronRight } from "lucide-react";

const fmt = (n) => n >= 1e6 ? `${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n || 0);
const CONN_COLORS = ["#4f6ef7","#7c3aed","#10b981","#f59e0b","#ef4444","#06b6d4","#ec4899","#8b5cf6","#f97316","#14b8a6"];

function ConnectorBadge({ name, idx }) {
  const color = CONN_COLORS[idx % CONN_COLORS.length];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${color}12`, color, borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 600, marginRight: 4, marginBottom: 2, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {name}
    </span>
  );
}

export default function TenantTable({ tenants = [], totalCalls = 0 }) {
  const [search,    setSearch]    = useState("");
  const [sortKey,   setSortKey]   = useState("calls");
  const [sortDir,   setSortDir]   = useState("desc");
  const [page,      setPage]      = useState(1);
  const [expanded,  setExpanded]  = useState({});
  const PAGE = 15;

  // Group rows by tenant name for expandable connector rows
  const tenantGroups = {};
  tenants.forEach((t) => {
    if (!tenantGroups[t.name]) tenantGroups[t.name] = { name: t.name, email: t.email, calls: 0, connectors: [] };
    tenantGroups[t.name].calls += t.calls;
    tenantGroups[t.name].connectors.push({ connector: t.connector, oid: t.oid, calls: t.calls });
  });

  const groups = Object.values(tenantGroups)
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || (g.email || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? 0, vb = b[sortKey] ?? 0;
      if (typeof va === "string") return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const pages   = Math.ceil(groups.length / PAGE);
  const visible = groups.slice((page - 1) * PAGE, page * PAGE);

  const sort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const toggleExpand = (name) => setExpanded((p) => ({ ...p, [name]: !p[name] }));

  const SortIcon = ({ col }) => sortKey !== col ? <ChevronDown size={10} color="#d0d8ee" /> : sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  const Th = ({ col, label, right }) => (
    <th onClick={() => sort(col)} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: sortKey === col ? "#4f6ef7" : "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em", cursor: "pointer", textAlign: right ? "right" : "left", whiteSpace: "nowrap", userSelect: "none", background: "#f8faff", borderBottom: "1px solid #e8edf5" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{label} <SortIcon col={col} /></span>
    </th>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(30,50,120,0.04)", overflow: "hidden", marginTop: 20 }}>
      <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e8edf5", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a2035" }}>All Tenant API Counts</div>
          <div style={{ fontSize: 11, color: "#8292b0", marginTop: 2 }}>
            {groups.length} tenants · {totalCalls.toLocaleString()} total calls · click a row to see connectors
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8292b0" }} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search tenant / email…"
            style={{ background: "#f4f6fb", border: "1.5px solid #e8edf5", borderRadius: 8, padding: "7px 10px 7px 28px", fontSize: 11, color: "#1a2035", outline: "none", width: 220, fontFamily: "DM Sans, sans-serif" }} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", background: "#f8faff", borderBottom: "1px solid #e8edf5", width: 36 }}>#</th>
              <Th col="name"  label="Tenant Name" />
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "left", background: "#f8faff", borderBottom: "1px solid #e8edf5" }}>Connectors</th>
              <Th col="email" label="Email" />
              <Th col="calls" label="Total Calls" right />
              <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right", background: "#f8faff", borderBottom: "1px solid #e8edf5" }}>Share %</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((g, i) => {
              const rank  = (page - 1) * PAGE + i + 1;
              const share = totalCalls ? ((g.calls / totalCalls) * 100).toFixed(2) : "0.00";
              const isExp = !!expanded[g.name];
              const isTop = rank <= 3;

              return (
                <React.Fragment key={g.name}>
                  {/* Main tenant row */}
                  <tr style={{ borderBottom: isExp ? "none" : "1px solid #f4f6fb", cursor: "pointer" }}
                    onClick={() => toggleExpand(g.name)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8faff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isExp ? "rgba(79,110,247,0.03)" : "transparent")}>
                    <td style={{ padding: "11px 14px", color: "#c5cfe0", fontWeight: 700, fontSize: 11, fontFamily: "DM Mono, monospace" }}>{rank}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 700, color: "#1a2035", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ChevronRight size={13} color="#c5cfe0" style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
                        {isTop && <span style={{ marginRight: 2 }}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>}
                        {g.name}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {g.connectors.slice(0, 3).map((c, ci) => <ConnectorBadge key={ci} name={c.connector || "—"} idx={ci} />)}
                        {g.connectors.length > 3 && <span style={{ fontSize: 10, color: "#8292b0", padding: "2px 6px" }}>+{g.connectors.length - 3} more</span>}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#8292b0", fontSize: 11, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.email || "—"}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#1a2035", fontFamily: "DM Mono, monospace" }}>{g.calls.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#8292b0" }}>{fmt(g.calls)}</div>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                        <div style={{ width: 50, height: 4, background: "#f4f6fb", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(parseFloat(share) * 5, 100)}%`, height: "100%", background: "#4f6ef7", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#4f6ef7", fontFamily: "DM Mono, monospace", minWidth: 44, textAlign: "right" }}>{share}%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded: per-connector breakdown */}
                  {isExp && (
                    <tr style={{ background: "rgba(79,110,247,0.03)", borderBottom: "1px solid #f4f6fb" }}>
                      <td colSpan={6} style={{ padding: "4px 14px 12px 52px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                          Connector breakdown — {g.connectors.length} connector{g.connectors.length > 1 ? "s" : ""}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                          {g.connectors.sort((a, b) => b.calls - a.calls).map((c, ci) => (
                            <div key={ci} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #e8edf5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CONN_COLORS[ci % CONN_COLORS.length], flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1a2035" }}>{c.connector || "—"}</div>
                                  {c.oid && <div style={{ fontSize: 9, color: "#c5cfe0", fontFamily: "DM Mono, monospace", marginTop: 1 }}>{c.oid.substring(0, 12)}…</div>}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a2035", fontFamily: "DM Mono, monospace" }}>{c.calls.toLocaleString()}</div>
                                <div style={{ fontSize: 10, color: "#8292b0" }}>{fmt(c.calls)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {!visible.length && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#c5cfe0" }}>No results</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ padding: "12px 24px", borderTop: "1px solid #e8edf5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#8292b0" }}>{((page-1)*PAGE)+1}–{Math.min(page*PAGE, groups.length)} of {groups.length} tenants</span>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "DM Sans, sans-serif", background: p === page ? "#4f6ef7" : "#f4f6fb", color: p === page ? "#fff" : "#8292b0" }}>{p}</button>
            ))}
            {pages > 10 && <span style={{ fontSize: 11, color: "#8292b0", padding: "6px 4px" }}>…{pages}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
