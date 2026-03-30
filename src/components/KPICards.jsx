import React from "react";
import { Activity, TrendingUp, Calendar, Users, Plug } from "lucide-react";

const fmt = (n) => n >= 1e9 ? `${(n/1e9).toFixed(1)}B` : n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n || 0);

const CARDS = [
  { key: "totalCalls",       label: "Total API Calls",  Icon: Activity,   color: "#4f6ef7" },
  { key: "lastDayCalls",     label: "Last Day Calls",   Icon: TrendingUp, color: "#7c3aed" },
  { key: "dailyAverage",     label: "Daily Average",    Icon: Calendar,   color: "#10b981" },
  { key: "activeTenants",    label: "Active Tenants",   Icon: Users,      color: "#f59e0b" },
  { key: "activeConnectors", label: "Connectors",       Icon: Plug,       color: "#ef4444" },
];

export default function KPICards({ metrics = {} }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
      {CARDS.map(({ key, label, Icon, color }) => (
        <div key={key} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(30,50,120,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#8292b0", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
            <div style={{ background: `${color}18`, borderRadius: 8, padding: 7 }}>
              <Icon size={13} color={color} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1a2035", letterSpacing: "-0.02em", fontFamily: "'DM Mono', monospace" }}>
            {fmt(metrics[key])}
          </div>
        </div>
      ))}
    </div>
  );
}
