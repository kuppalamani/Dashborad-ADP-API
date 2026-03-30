const USERS = [
  // ── Admins ──────────────────────────────────────────────────────
  { username: "vikash",    password: "Vikash@aquera",       name: "Vikash",    role: "Admin" },
  { username: "pavan",     password: "Pavan@aquera",        name: "Pavan",     role: "Admin" },
  { username: "shiva",     password: "Shiva@aquera",        name: "Shiva",     role: "Admin" },
  { username: "sabari",    password: "Sabari@aquera",       name: "Sabari",    role: "Admin" },
  { username: "manikanta", password: "Mani@Aquera",         name: "Manikanta", role: "Admin" },
  // ── Operations Team ─────────────────────────────────────────────
  { username: "rishab",    password: "OperationsTeam@123",  name: "Rishab",    role: "Operations" },
  { username: "raghu",     password: "OperationsTeam@123",  name: "Raghu",     role: "Operations" },
  { username: "vasanth",   password: "OperationsTeam@123",  name: "Vasanth",   role: "Operations" },
  { username: "ramudu",    password: "OperationsTeam@123",  name: "Ramudu",    role: "Operations" },
  { username: "anil",      password: "OperationsTeam@123",  name: "Anil",      role: "Operations" },
  { username: "naveen",    password: "OperationsTeam@123",  name: "Naveen",    role: "Operations" },
];

const SESSION_KEY = "aqure_session";

export function login(username, password) {
  // Case-insensitive username match, case-sensitive password
  const user = USERS.find(
    (u) => u.username === username.trim().toLowerCase() && u.password === password
  );
  if (!user) return { ok: false, error: "Invalid username or password." };
  const session = { name: user.name, role: user.role, username: user.username, loginAt: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, user: session };
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
