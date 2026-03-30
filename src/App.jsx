import React, { useState, useMemo, useCallback } from "react";
import LoginPage      from "./components/LoginPage";
import WelcomePage    from "./components/WelcomePage";
import GreetingModal  from "./components/GreetingModal";
import Sidebar        from "./components/Sidebar";
import KPICards       from "./components/KPICards";
import ChartCard      from "./components/ChartCard";
import Heatmap        from "./components/Heatmap";
import TrendChart     from "./components/TrendChart";
import BreakdownCharts from "./components/BreakdownCharts";
import Last5Days      from "./components/Last5Days";
import TenantTable    from "./components/TenantTable";
import ConnectorTicker from "./components/ConnectorTicker";
import PivotTable     from "./components/PivotTable";
import MonthlyGraphs  from "./components/MonthlyGraphs";
import { LogOut, User, LayoutDashboard, Table2, BarChart2 } from "lucide-react";
import {
  parseExcelFile, computeKPIs, getLastDayCalls, getLastNDaysCalls,
  getDailyTrend, getMonthlyTrend, getTopTenants, getTopConnectors,
  getHeatmapData, getUniqueTenants, getUniqueConnectors, getTenantTable,
  getLast7DaysPivot, getMonthlyGraphData, getLast7DaysConnectors,
} from "./utils/dataProcessor";
import { getSession, logout } from "./utils/auth";

/* ─── Root ───────────────────────────────────────────────────────── */
export default function App() {
  const [session,      setSession]      = useState(() => getSession());
  const [showGreeting, setShowGreeting] = useState(false);

  if (!session) {
    return <LoginPage onLogin={(user) => { setSession(user); setShowGreeting(true); }} />;
  }

  return (
    <>
      {showGreeting && <GreetingModal session={session} onClose={() => setShowGreeting(false)} />}
      <MainApp session={session} onLogout={() => { logout(); setSession(null); }} />
    </>
  );
}

/* ─── Main app (after login) ─────────────────────────────────────── */
function MainApp({ session, onLogout }) {
  const [rawData,     setRawData]     = useState(null);
  const [uploadInfo,  setUploadInfo]  = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploading,   setUploading]   = useState(false);

  const [selTenants,    setSelTenants]    = useState([]);
  const [selConnectors, setSelConnectors] = useState([]);
  const [emailSearch,   setEmailSearch]   = useState("");
  const [dateRange,     setDateRange]     = useState({ start:"", end:"" });

  const handleUpload = useCallback(async (e) => {
    const file = e.target?.files?.[0] ?? e?.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError(null);
    try {
      const result = await parseExcelFile(file);
      setRawData(result.data);
      setUploadInfo({ name:file.name, totalRows:result.totalRows, dateColsCount:result.dateColsCount, sheet:result.sheetName, lastDate:result.allDates?.[result.allDates.length-1]??"—" });
      setSelTenants([]); setSelConnectors([]); setEmailSearch(""); setDateRange({ start:"", end:"" });
    } catch(err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  if (!rawData) {
    return (
      <div style={{ position:"relative" }}>
        <UserBadge session={session} onLogout={onLogout} />
        <WelcomePage onFileUpload={handleUpload} uploading={uploading} uploadError={uploadError} />
      </div>
    );
  }

  return (
    <DashboardView
      rawData={rawData} uploadInfo={uploadInfo} uploading={uploading}
      uploadError={uploadError} onFileUpload={handleUpload}
      session={session} onLogout={onLogout}
      selTenants={selTenants}       setSelTenants={setSelTenants}
      selConnectors={selConnectors} setSelConnectors={setSelConnectors}
      emailSearch={emailSearch}     setEmailSearch={setEmailSearch}
      dateRange={dateRange}         setDateRange={setDateRange}
    />
  );
}

/* ─── Small badge on welcome page ───────────────────────────────── */
function UserBadge({ session, onLogout }) {
  return (
    <div style={{ position:"fixed", top:16, right:20, zIndex:1000, display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff", borderRadius:24, padding:"6px 14px 6px 8px", boxShadow:"0 2px 12px rgba(30,50,120,0.1)", border:"1px solid #e8edf5" }}>
        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <User size={13} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:"#1a2035", lineHeight:1.2 }}>{session.name}</div>
          <div style={{ fontSize:10, color:"#8292b0", lineHeight:1.2 }}>{session.role}</div>
        </div>
      </div>
      <button onClick={onLogout} style={{ background:"#fff", border:"1px solid #e8edf5", borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 2px 12px rgba(30,50,120,0.08)" }}>
        <LogOut size={14} color="#8292b0" />
      </button>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────── */
function DashboardView({ rawData, uploadInfo, uploading, uploadError, onFileUpload, session, onLogout, selTenants, setSelTenants, selConnectors, setSelConnectors, emailSearch, setEmailSearch, dateRange, setDateRange }) {
  const [page, setPage] = useState("dashboard"); // "dashboard" | "pivot" | "monthly"

  const allTenants    = useMemo(() => getUniqueTenants(rawData),    [rawData]);
  const allConnectors = useMemo(() => getUniqueConnectors(rawData), [rawData]);

  const filtered = useMemo(() => rawData.filter((r) => {
    if (selTenants.length    && !selTenants.includes(r.tenantName))   return false;
    if (selConnectors.length && !selConnectors.includes(r.connector)) return false;
    if (emailSearch && !r.email?.toLowerCase().includes(emailSearch.toLowerCase())) return false;
    if (dateRange.start && r.date < dateRange.start) return false;
    if (dateRange.end   && r.date > dateRange.end)   return false;
    return true;
  }), [rawData, selTenants, selConnectors, emailSearch, dateRange]);

  const metrics       = useMemo(() => computeKPIs(filtered),              [filtered]);
  const lastDayCalls  = useMemo(() => getLastDayCalls(filtered),           [filtered]);
  const last5Days     = useMemo(() => getLastNDaysCalls(filtered, 5),      [filtered]);
  const dailyTrend    = useMemo(() => getDailyTrend(filtered),             [filtered]);
  const monthlyTrend  = useMemo(() => getMonthlyTrend(filtered),           [filtered]);
  const topTenants    = useMemo(() => getTopTenants(filtered, 10),         [filtered]);
  const topConnectors = useMemo(() => getTopConnectors(filtered, 10),      [filtered]);
  const heatmap       = useMemo(() => getHeatmapData(filtered),            [filtered]);
  const tenantTable   = useMemo(() => getTenantTable(filtered),            [filtered]);
  const pivotData     = useMemo(() => getLast7DaysPivot(filtered),         [filtered]);
  const monthlyGraphs = useMemo(() => getMonthlyGraphData(filtered),       [filtered]);
  const tickerItems   = useMemo(() => getLast7DaysConnectors(filtered),    [filtered]);

  const clearFilters = () => { setSelTenants([]); setSelConnectors([]); setEmailSearch(""); setDateRange({ start:"", end:"" }); };

  const NAV = [
    { key:"dashboard", label:"Dashboard",    Icon:LayoutDashboard },
    { key:"pivot",     label:"7-Day Pivot",  Icon:Table2          },
    { key:"monthly",   label:"Monthly Graphs", Icon:BarChart2     },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'DM Sans', sans-serif", background:"#f4f6fb" }}>
      <Sidebar
        onFileUpload={onFileUpload} uploading={uploading} uploadError={uploadError} uploadInfo={uploadInfo}
        allTenants={allTenants} allConnectors={allConnectors}
        selTenants={selTenants} selConnectors={selConnectors}
        emailSearch={emailSearch} dateRange={dateRange}
        onTenantChange={setSelTenants} onConnectorChange={setSelConnectors}
        onEmailChange={setEmailSearch} onDateChange={setDateRange}
        onClearFilters={clearFilters}
      />

      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* ── Top navbar ── */}
        <div style={{ background:"#fff", borderBottom:"1px solid #e8edf5", padding:"0 32px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, height:56 }}>
          {/* Nav tabs */}
          <div style={{ display:"flex", gap:4, height:"100%" }}>
            {NAV.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setPage(key)}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"0 16px", height:"100%", background:"none", border:"none", borderBottom: page===key ? "2px solid #4f6ef7" : "2px solid transparent", fontSize:13, fontWeight: page===key ? 700 : 500, color: page===key ? "#4f6ef7" : "#8292b0", cursor:"pointer", fontFamily:"DM Sans, sans-serif", transition:"color 0.15s", whiteSpace:"nowrap" }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {/* User info */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#1a2035" }}>{session.name}</div>
              <div style={{ fontSize:10, color:"#8292b0" }}>{session.role}</div>
            </div>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#4f6ef7,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff" }}>
              {session.name[0].toUpperCase()}
            </div>
            <button onClick={onLogout} title="Sign out" style={{ background:"#f4f6fb", border:"1px solid #e8edf5", borderRadius:8, width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <LogOut size={13} color="#8292b0" />
            </button>
          </div>
        </div>

        {/* ── Page content ── */}
        <main style={{ flex:1, padding:"24px 32px", overflowY:"auto" }}>
          {/* Subtitle */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#8292b0" }}>
              {filtered.length.toLocaleString()} records
              {uploadInfo && ` · ${uploadInfo.name} · last date: `}
              {uploadInfo && <strong style={{ color:"#4f6ef7" }}>{uploadInfo.lastDate}</strong>}
            </div>
          </div>

          {/* ── DASHBOARD PAGE ── */}
          {page === "dashboard" && (
            <>
              <ConnectorTicker connectors={tickerItems} />
              <Last5Days days={last5Days} />
              <ChartCard title="Last Day API Calls" style={{ marginBottom:16 }}>
                <div style={{ fontSize:42, fontWeight:800, letterSpacing:"-0.04em", color:"#1a2035", fontFamily:"'DM Mono', monospace" }}>{lastDayCalls.toLocaleString()}</div>
                {uploadInfo?.lastDate && <div style={{ fontSize:12, color:"#8292b0", marginTop:6 }}>Date: {uploadInfo.lastDate}</div>}
              </ChartCard>
              <KPICards metrics={{ ...metrics, lastDayCalls }} />
              <TrendChart daily={dailyTrend} monthly={monthlyTrend} />
              <div style={{ marginTop:20 }}>
                <BreakdownCharts tenants={topTenants} connectors={topConnectors} />
              </div>
              <ChartCard title="Activity Heatmap" subtitle="Total API calls per tenant per day — hover for details" style={{ marginTop:20 }}>
                <Heatmap data={heatmap} />
              </ChartCard>
              <TenantTable tenants={tenantTable} totalCalls={metrics.totalCalls} />
            </>
          )}

          {/* ── PIVOT PAGE ── */}
          {page === "pivot" && (
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf5", boxShadow:"0 1px 4px rgba(30,50,120,0.04)", overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #e8edf5" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1a2035", letterSpacing:"-0.02em" }}>Last 7 Days — Tenant Pivot Table</div>
                <div style={{ fontSize:11, color:"#8292b0", marginTop:3 }}>
                  Daily API calls per tenant · colour intensity = relative volume · click headers to sort
                </div>
              </div>
              <div style={{ padding:"16px 24px 24px" }}>
                <PivotTable data={pivotData} />
              </div>
            </div>
          )}

          {/* ── MONTHLY PAGE ── */}
          {page === "monthly" && (
            <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e8edf5", boxShadow:"0 1px 4px rgba(30,50,120,0.04)", overflow:"hidden" }}>
              <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid #e8edf5" }}>
                <div style={{ fontSize:16, fontWeight:800, color:"#1a2035", letterSpacing:"-0.02em" }}>Monthly API Consumption Graphs</div>
                <div style={{ fontSize:11, color:"#8292b0", marginTop:3 }}>
                  Click any month bar to drill into daily breakdown · use arrows to navigate
                </div>
              </div>
              <div style={{ padding:"20px 24px 28px" }}>
                <MonthlyGraphs months={monthlyGraphs} />
              </div>
            </div>
          )}

          <div style={{ marginTop:20, fontSize:10, color:"#c5cfe0", textAlign:"center" }}>
            Aqure API Analytics · Team SRE
          </div>
        </main>
      </div>
    </div>
  );
}
