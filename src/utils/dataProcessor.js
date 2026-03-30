import * as XLSX from "xlsx";

function parseDateCol(colName) {
  const s = String(colName).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const day = m[1].padStart(2,"0"), month = m[2].padStart(2,"0");
  const year = m[3].length === 2 ? "20"+m[3] : m[3];
  if (parseInt(month) > 12 || parseInt(day) > 31) return null;
  return `${year}-${month}-${day}`;
}
function isDateColumn(col) { return parseDateCol(col) !== null; }

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type:"array", cellDates:false });
        const sheetName = wb.SheetNames[1] ?? wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        if (!sheet) { reject(new Error("No valid sheet found.")); return; }
        const rows = XLSX.utils.sheet_to_json(sheet, { defval:0, raw:true });
        if (!rows.length) { reject(new Error("Sheet is empty.")); return; }
        const allCols = Object.keys(rows[0]||{});
        const dateCols = allCols.filter(isDateColumn);
        if (!dateCols.length) { reject(new Error("No date columns (d/m/yy). Found: "+allCols.slice(0,8).join(", "))); return; }
        const records = [];
        rows.forEach((row) => {
          const tenantRaw = String(row["Tenant Name"]??row["TenantName"]??row["Tenant"]??"").trim();
          if (!tenantRaw || tenantRaw.toLowerCase()==="total") return;
          const connector = String(row["Connector"]??row["Connector Name"]??row["ConnectorName"]??"").trim();
          const email = String(row["Customer Email"]??row["Email"]??row["CustomerEmail"]??"").trim();
          const oid = String(row["OID"]??row["Oid"]??"").trim();
          dateCols.forEach((col) => {
            const dateIso = parseDateCol(col); if (!dateIso) return;
            const calls = Number(row[col]); if (!calls||isNaN(calls)||calls<=0) return;
            records.push({ tenantName:tenantRaw, connector, email, oid, date:dateIso, month:dateIso.substring(0,7), calls });
          });
        });
        if (!records.length) { reject(new Error("No API call data found.")); return; }
        const allDates = [...new Set(records.map((r)=>r.date))].sort();
        resolve({ data:records, sheetName, totalRows:rows.length, dateColsCount:dateCols.length, allDates });
      } catch(err) { reject(new Error("Parse failed: "+err.message)); }
    };
    reader.onerror = () => reject(new Error("File read error."));
    reader.readAsArrayBuffer(file);
  });
}

const safe = (r) => Array.isArray(r) ? r : [];

export function computeKPIs(records=[]) {
  const r = safe(records);
  if (!r.length) return { totalCalls:0, dailyAverage:0, activeTenants:0, activeConnectors:0 };
  const totalCalls = r.reduce((s,x)=>s+x.calls,0);
  const dates = new Set(r.map((x)=>x.date));
  const tenants = new Set(r.map((x)=>x.tenantName).filter(Boolean));
  const connectors = new Set(r.map((x)=>x.connector).filter(Boolean));
  return { totalCalls, dailyAverage: dates.size ? Math.round(totalCalls/dates.size):0, activeTenants:tenants.size, activeConnectors:connectors.size };
}

export function getLastDayCalls(records=[]) {
  const r = safe(records); if (!r.length) return 0;
  const last = [...new Set(r.map((x)=>x.date))].sort().pop();
  return r.filter((x)=>x.date===last).reduce((s,x)=>s+x.calls,0);
}

export function getLastNDaysCalls(records=[], n=5) {
  const r = safe(records); if (!r.length) return [];
  const dates = [...new Set(r.map((x)=>x.date))].sort().slice(-n);
  return dates.map((date) => ({ date, label:date.substring(5), calls:r.filter((x)=>x.date===date).reduce((s,x)=>s+x.calls,0) }));
}

export function getDailyTrend(records=[]) {
  const map = {};
  safe(records).forEach((r)=>{ map[r.date]=(map[r.date]||0)+r.calls; });
  return Object.keys(map).sort().map((d)=>({ date:d.substring(5), fullDate:d, calls:map[d] }));
}

export function getMonthlyTrend(records=[]) {
  const map = {};
  safe(records).forEach((r)=>{ map[r.month]=(map[r.month]||0)+r.calls; });
  return Object.keys(map).sort().map((m)=>({ month:m, calls:map[m] }));
}

export function getTopTenants(records=[], n=10) {
  const map = {};
  safe(records).forEach((r)=>{ if(r.tenantName) map[r.tenantName]=(map[r.tenantName]||0)+r.calls; });
  return Object.entries(map).map(([name,calls])=>({ name,calls })).sort((a,b)=>b.calls-a.calls).slice(0,n);
}

export function getTopConnectors(records=[], n=50) {
  const map = {};
  safe(records).forEach((r)=>{ if(r.connector) map[r.connector]=(map[r.connector]||0)+r.calls; });
  return Object.entries(map).map(([name,calls])=>({ name,calls })).sort((a,b)=>b.calls-a.calls).slice(0,n);
}

export function getUniqueTenants(records=[]) {
  return [...new Set(safe(records).map((r)=>r.tenantName).filter(Boolean))].sort();
}
export function getUniqueConnectors(records=[]) {
  return [...new Set(safe(records).map((r)=>r.connector).filter(Boolean))].sort();
}

export function getHeatmapData(records=[]) {
  const r = safe(records);
  const aggMap = {};
  r.forEach((x)=>{ const k=`${x.tenantName}||${x.date}`; aggMap[k]=(aggMap[k]||0)+x.calls; });
  const tenants = [...new Set(r.map((x)=>x.tenantName).filter(Boolean))].sort();
  const dates = [...new Set(r.map((x)=>x.date))].sort();
  return { tenants, dates, matrix:aggMap };
}

export function getTenantTable(records=[]) {
  const rowMap = {};
  safe(records).forEach((r)=>{
    const key = `${r.tenantName}||${r.connector}||${r.oid}`;
    if (!rowMap[key]) rowMap[key] = { name:r.tenantName, connector:r.connector, oid:r.oid, email:r.email, calls:0 };
    rowMap[key].calls += r.calls;
  });
  const tenantConnectors = {};
  safe(records).forEach((r)=>{
    if (!tenantConnectors[r.tenantName]) tenantConnectors[r.tenantName] = new Set();
    if (r.connector) tenantConnectors[r.tenantName].add(r.connector);
  });
  const rows = Object.values(rowMap).sort((a,b)=>b.calls-a.calls);
  rows.forEach((row)=>{ row.allConnectors = [...(tenantConnectors[row.name]||[])]; });
  return rows;
}

/* ── Last-7-days pivot: { tenants, dates, matrix, tenantTotals, pctChange } ── */
export function getLast7DaysPivot(records=[]) {
  const r = safe(records);
  if (!r.length) return { tenants:[], dates:[], matrix:{}, tenantTotals:{}, pctChange:{} };

  const allDates = [...new Set(r.map((x)=>x.date))].sort();
  const last8    = allDates.slice(-8);  // 8 so we can compute % vs day before the 7
  const last7    = last8.slice(-7);
  const prev7    = allDates.slice(-14, -7);

  // Build matrix: tenantName × date → calls
  const matrix = {};
  const tenantTotals = {};
  r.forEach((x)=>{
    if (!last8.includes(x.date)) return;
    const k = `${x.tenantName}||${x.date}`;
    matrix[k] = (matrix[k]||0) + x.calls;
    if (last7.includes(x.date)) tenantTotals[x.tenantName] = (tenantTotals[x.tenantName]||0)+x.calls;
  });

  // % change vs previous 7 days
  const prev7Map = {};
  r.forEach((x)=>{
    if (!prev7.includes(x.date)) return;
    prev7Map[x.tenantName] = (prev7Map[x.tenantName]||0)+x.calls;
  });
  const pctChange = {};
  Object.entries(tenantTotals).forEach(([tn,cur])=>{
    const prev = prev7Map[tn]||0;
    pctChange[tn] = prev ? Math.round(((cur-prev)/prev)*100) : null;
  });

  // Tenants sorted by last-7-day total
  const tenants = Object.entries(tenantTotals).sort((a,b)=>b[1]-a[1]).map(([n])=>n);

  return { tenants, dates:last7, matrix, tenantTotals, pctChange };
}

/* ── Monthly graph data — calls per month, with daily breakdown ── */
export function getMonthlyGraphData(records=[]) {
  const r = safe(records);
  // Group by month
  const monthMap = {};
  r.forEach((x)=>{
    if (!monthMap[x.month]) monthMap[x.month] = { month:x.month, calls:0, daily:{} };
    monthMap[x.month].calls += x.calls;
    monthMap[x.month].daily[x.date] = (monthMap[x.month].daily[x.date]||0)+x.calls;
  });
  // Convert daily to array for charts
  return Object.values(monthMap).sort((a,b)=>a.month.localeCompare(b.month)).map((m)=>({
    ...m,
    daily: Object.entries(m.daily).sort((a,b)=>a[0].localeCompare(b[0])).map(([date,calls])=>({ date:date.substring(5), calls }))
  }));
}

/* ── Last-7-days connector+tenant ticker ── */
export function getLast7DaysConnectors(records=[]) {
  const r = safe(records);
  const allDates = [...new Set(r.map((x)=>x.date))].sort();
  const last7 = allDates.slice(-7);
  const map = {};
  r.forEach((x)=>{
    if (!last7.includes(x.date)) return;
    const key = `${x.connector}||${x.tenantName}`;
    if (!map[key]) map[key] = { connector:x.connector, tenantName:x.tenantName, calls:0 };
    map[key].calls += x.calls;
  });
  return Object.values(map).sort((a,b)=>b.calls-a.calls);
}
