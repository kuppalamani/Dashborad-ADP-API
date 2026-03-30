// Generates realistic demo data when no Excel file is uploaded
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDemoData() {
  const tenants    = ["Acme Corp","Globex Inc","Initech","Umbrella Ltd","Massive Dyn","Soylent Co","Buy N Large","Vault-Tec","Cyberdyne","Weyland-Yutani"];
  const connectors = ["Salesforce CRM","HubSpot","Stripe Payments","SendGrid Email","Twilio SMS","Slack Notify","Jira Tickets","AWS S3","Google Analytics"];
  const emails     = tenants.map((t) => `admin@${t.toLowerCase().replace(/\s+/g,"").replace(/\./g,"")}.com`);

  const end   = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 89);

  const dates = [];
  const cur   = new Date(start);
  while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate() + 1); }

  const data   = [];
  const seeded = mulberry32(42);

  tenants.forEach((tenant, i) => {
    const nConns  = 2 + Math.floor(seeded() * 3);
    const chosen  = [...connectors].sort(() => seeded() - 0.5).slice(0, nConns);
    chosen.forEach((connector) => {
      const base  = 50 + Math.floor(seeded() * 450);
      const trend = (seeded() - 0.3) * 1.5;
      dates.forEach((dateIso, j) => {
        const dow      = new Date(dateIso).getDay();
        const weekend  = dow === 0 || dow === 6;
        const seasonal = base * (1 + (trend * j) / 100);
        const noise    = (seeded() - 0.5) * base * 0.25;
        const spike    = seeded() < 0.02 ? base * (2 + seeded() * 3) : 0;
        const calls    = Math.max(0, Math.round(seasonal * (weekend ? 0.25 : 1) + noise + spike));
        if (calls <= 0) return;
        data.push({ tenantName: tenant, connector, email: emails[i], oid: `OID${10000 + i}`, date: dateIso, month: dateIso.substring(0, 7), calls });
      });
    });
  });

  return data;
}
