import React, { useState } from "react";
import { Upload, Users, Plug, Calendar, Search, ChevronDown, X, AlertCircle, CheckCircle } from "lucide-react";

const T = { bg: "#f4f6fb", border: "#e8edf5", accent: "#4f6ef7", text: "#1a2035", muted: "#8292b0", subtle: "#c5cfe0" };

/* ── MultiSelect with built-in search ────────────────────────────── */
function MultiSelect({ label, options = [], value = [], onChange, Icon }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const allSel  = value.length === 0;
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ marginBottom: 12, position: "relative" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>

      {/* Trigger */}
      <div onClick={() => { setOpen(!open); setSearch(""); }}
        style={{ background: T.bg, border: `1.5px solid ${open ? T.accent : T.border}`, borderRadius: 8, padding: "8px 11px", cursor: "pointer", fontSize: 12, color: allSel ? T.muted : T.text, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", minWidth: 0 }}>
          {Icon && <Icon size={11} color={T.muted} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {allSel ? `All ${label}` : value.length === 1 ? value[0] : `${value.length} selected`}
          </span>
        </div>
        <ChevronDown size={11} color={T.muted} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
      </div>

      {open && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 200, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, marginTop: 4, boxShadow: "0 8px 24px rgba(30,50,120,0.12)", overflow: "hidden" }}>
          {/* Search inside dropdown */}
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.border}`, position: "relative" }}>
            <Search size={11} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder={`Search ${label.toLowerCase()}…`}
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px 5px 24px", fontSize: 11, color: T.text, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {/* All option */}
            <div onClick={() => { onChange([]); setOpen(false); }}
              style={{ padding: "8px 12px", fontSize: 12, color: T.muted, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}>
              All {label} ({options.length})
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: 11, color: T.subtle, textAlign: "center" }}>No results</div>
            )}

            {filtered.map((opt) => {
              const sel = value.includes(opt);
              return (
                <div key={opt} onClick={() => onChange(sel ? value.filter((v) => v !== opt) : [...value, opt])}
                  style={{ padding: "8px 12px", fontSize: 12, cursor: "pointer", color: sel ? T.accent : T.text, background: sel ? "rgba(79,110,247,0.05)" : "transparent", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 13, height: 13, borderRadius: 3, border: `1.5px solid ${sel ? T.accent : T.subtle}`, background: sel ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {sel && <span style={{ color: "#fff", fontSize: 8, fontWeight: 800 }}>✓</span>}
                  </div>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Selected count footer */}
          {value.length > 0 && (
            <div style={{ padding: "6px 12px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: T.muted }}>{value.length} selected</span>
              <span onClick={() => onChange([])} style={{ fontSize: 10, color: T.accent, cursor: "pointer", fontWeight: 600 }}>Clear</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onFileUpload, uploading, uploadError, uploadInfo, isDemo, allTenants, allConnectors, selTenants, selConnectors, emailSearch, dateRange, onTenantChange, onConnectorChange, onEmailChange, onDateChange, onClearFilters }) {
  const activeFilters = (selTenants.length > 0 ? 1 : 0) + (selConnectors.length > 0 ? 1 : 0) + (emailSearch ? 1 : 0) + (dateRange.start || dateRange.end ? 1 : 0);

  return (
    <div style={{ width: 240, flexShrink: 0, background: "#fff", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
      {/* Logo */}
      <div style={{ padding: "22px 20px 16px" }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>
          <span style={{ color: T.accent }}>API</span> Analytics
        </div>
        <div style={{ fontSize: 10, color: T.muted, marginTop: 2, fontWeight: 500 }}>Aqure · Team SRE</div>
      </div>

      <div style={{ height: 1, background: T.border, margin: "0 20px" }} />

      {/* Upload */}
      <div style={{ padding: "14px 20px" }}>
        <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1.5px dashed ${uploadError ? "#ef4444" : T.accent}`, borderRadius: 10, padding: "10px", cursor: uploading ? "wait" : "pointer", fontSize: 12, fontWeight: 600, color: uploadError ? "#ef4444" : T.accent, background: uploadError ? "rgba(239,68,68,0.05)" : "rgba(79,110,247,0.05)" }}>
          <input type="file" accept=".xlsx,.xls" onChange={onFileUpload} style={{ display: "none" }} disabled={uploading} />
          <Upload size={13} />
          {uploading ? "Parsing…" : "Upload Excel"}
        </label>

        {uploadInfo && !uploadError && (
          <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(16,185,129,0.08)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <CheckCircle size={11} color="#10b981" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981" }}>Loaded</span>
            </div>
            <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: T.text }}>{uploadInfo.name}</div>
              <div>{uploadInfo.totalRows} rows · {uploadInfo.dateColsCount} date cols</div>
              <div>Last date: <strong style={{ color: T.accent }}>{uploadInfo.lastDate}</strong></div>
            </div>
          </div>
        )}

        {uploadError && (
          <div style={{ marginTop: 8, padding: "8px 10px", background: "rgba(239,68,68,0.06)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
              <AlertCircle size={11} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#ef4444", lineHeight: 1.5 }}>{uploadError}</span>
            </div>
          </div>
        )}

        {isDemo && !uploadInfo && (
          <div style={{ marginTop: 7, fontSize: 10, color: "#f59e0b", fontWeight: 600, textAlign: "center", background: "rgba(245,158,11,0.1)", borderRadius: 6, padding: "3px 8px" }}>
            📊 Demo data active
          </div>
        )}
      </div>

      <div style={{ height: 1, background: T.border, margin: "0 20px" }} />

      {/* Filters */}
      <div style={{ padding: "14px 20px", flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Filters
          {activeFilters > 0 && <span style={{ background: T.accent, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 9 }}>{activeFilters}</span>}
        </div>

        <MultiSelect label="Tenants" options={allTenants} value={selTenants} onChange={onTenantChange} Icon={Users} />
        <MultiSelect label="Connectors" options={allConnectors} value={selConnectors} onChange={onConnectorChange} Icon={Plug} />

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={10} /> Date Range
          </div>
          {["start", "end"].map((k) => (
            <input key={k} type="date" value={dateRange[k]} onChange={(e) => onDateChange({ ...dateRange, [k]: e.target.value })}
              style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 11, color: T.text, outline: "none", marginBottom: 5, fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }} />
          ))}
        </div>

        <div style={{ position: "relative", marginBottom: 12 }}>
          <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.muted }} />
          <input type="text" value={emailSearch} onChange={(e) => onEmailChange(e.target.value)} placeholder="Search email…"
            style={{ width: "100%", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "7px 10px 7px 28px", fontSize: 11, color: T.text, outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }} />
        </div>

        {activeFilters > 0 && (
          <button onClick={onClearFilters} style={{ width: "100%", background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px", fontSize: 11, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "DM Sans, sans-serif" }}>
            <X size={10} /> Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
