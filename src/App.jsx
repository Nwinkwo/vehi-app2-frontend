import { useState, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000/api";


const colors = {
  bg: "#1a1a1a",
  panel: "#232323",
  panelAlt: "#2b2b2b",
  border: "#3a3a3a",
  yellow: "#f4c430",
  yellowDark: "#c99e1f",
  text: "#e8e8e8",
  textMuted: "#9a9a9a",
  danger: "#e5484d",
  success: "#3ecf8e",
};

const s = {
  page: {
    minHeight: "100vh",
    background: colors.bg,
    color: colors.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: `1px solid ${colors.border}`,
    background: colors.panel,
  },
  logo: { fontSize: 20, fontWeight: 800, letterSpacing: 1, color: colors.yellow },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  navBtn: (active) => ({
    background: active ? colors.yellow : "transparent",
    color: active ? "#111" : colors.text,
    border: `1px solid ${active ? colors.yellow : colors.border}`,
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  }),
  container: { maxWidth: 960, margin: "0 auto", padding: "32px 24px" },
  authWrap: {
    maxWidth: 420,
    margin: "60px auto",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 32,
  },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 4 },
  subtitle: { color: colors.textMuted, fontSize: 13, marginBottom: 24 },
  label: { display: "block", fontSize: 12, color: colors.textMuted, marginBottom: 6, marginTop: 14 },
  input: {
    width: "100%",
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: "10px 12px",
    color: colors.text,
    fontSize: 14,
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    background: colors.panelAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: "10px 12px",
    color: colors.text,
    fontSize: 14,
  },
  primaryBtn: {
    width: "100%",
    marginTop: 22,
    background: colors.yellow,
    color: "#111",
    border: "none",
    borderRadius: 6,
    padding: "12px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: colors.yellow,
    cursor: "pointer",
    fontSize: 13,
    marginTop: 16,
    textDecoration: "underline",
  },
  error: {
    background: "rgba(229,72,77,0.12)",
    border: `1px solid ${colors.danger}`,
    color: colors.danger,
    padding: "10px 12px",
    borderRadius: 6,
    fontSize: 13,
    marginTop: 16,
  },
  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 },
  vehicleImg: {
    width: "100%",
    height: 130,
    background: colors.panelAlt,
    borderRadius: 6,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: colors.textMuted,
    fontSize: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16, color: colors.yellow },
  statRow: { display: "flex", gap: 16, marginBottom: 24 },
  statBox: {
    flex: 1,
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    padding: 18,
  },
  statLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: 800, color: colors.yellow },
  smallBtn: {
    background: "transparent",
    border: `1px solid ${colors.yellow}`,
    color: colors.yellow,
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },
};


async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Something went wrong.");
    throw new Error(message);
  }
  return data;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("rm_token") || "");
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("rm_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [view, setView] = useState(token ? "loading" : "login");
  const [error, setError] = useState("");

  
  useEffect(() => {
    if (token && !user) {
      api("/user", { token })
        .then((data) => {
          setUser(data);
          localStorage.setItem("rm_user", JSON.stringify(data));
          setView(data.role === "seller" ? "sellerDashboard" : "buyerBrowse");
        })
        .catch(() => {
          logout();
        });
    } else if (token && user) {
      setView(user.role === "seller" ? "sellerDashboard" : "buyerBrowse");
    }
  }, []); 

  function loginSuccess(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("rm_token", data.token);
    localStorage.setItem("rm_user", JSON.stringify(data.user));
    setError("");
    setView(data.user.role === "seller" ? "sellerDashboard" : "buyerBrowse");
  }

  async function logout() {
    try {
      if (token) await api("/logout", { method: "POST", token });
    } catch (_) {
      
    }
    setToken("");
    setUser(null);
    localStorage.removeItem("rm_token");
    localStorage.removeItem("rm_user");
    setView("login");
  }

  return (
    <div style={s.page}>
      {user && (
        <header style={s.header}>
          <div style={s.logo}>ROADMARK</div>
          <nav style={s.nav}>
            {user.role === "buyer" && (
              <button style={s.navBtn(view === "buyerBrowse")} onClick={() => setView("buyerBrowse")}>
                Browse Vans
              </button>
            )}
            {user.role === "seller" && (
              <button style={s.navBtn(view === "sellerDashboard")} onClick={() => setView("sellerDashboard")}>
                My Listings
              </button>
            )}
            <button style={s.navBtn(view === "wallet")} onClick={() => setView("wallet")}>
              Wallet
            </button>
            <button style={s.navBtn(false)} onClick={logout}>
              Log out
            </button>
          </nav>
        </header>
      )}

      <div style={s.container}>
        {view === "loading" && <p style={{ color: colors.textMuted }}>Loading…</p>}
        {view === "login" && (
          <LoginView onSuccess={loginSuccess} goRegister={() => setView("register")} />
        )}
        {view === "register" && (
          <RegisterView onSuccess={loginSuccess} goLogin={() => setView("login")} />
        )}
        {view === "buyerBrowse" && user && <BuyerBrowse token={token} />}
        {view === "sellerDashboard" && user && <SellerDashboard token={token} />}
        {view === "wallet" && user && <WalletView token={token} />}
      </div>
    </div>
  );
}

// Login
function LoginView({ onSuccess, goRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/login", { method: "POST", body: form });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.authWrap}>
      <div style={s.title}>Welcome back</div>
      <div style={s.subtitle}>Log in to your Roadmark account</div>
      <form onSubmit={submit}>
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button style={s.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
        {error && <div style={s.error}>{error}</div>}
      </form>
      <button style={s.linkBtn} onClick={goRegister}>
        Don't have an account? Register
      </button>
    </div>
  );
}

// Register 
function RegisterView({ onSuccess, goLogin }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    sex: "male",
    date_of_birth: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/register", { method: "POST", body: form });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.authWrap}>
      <div style={s.title}>Create your account</div>
      <div style={s.subtitle}>Buy or sell vans on Roadmark</div>
      <form onSubmit={submit}>
        <label style={s.label}>First name</label>
        <input
          style={s.input}
          required
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <label style={s.label}>Last name</label>
        <input
          style={s.input}
          required
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <label style={s.label}>Sex</label>
        <select
          style={s.select}
          value={form.sex}
          onChange={(e) => setForm({ ...form, sex: e.target.value })}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <label style={s.label}>Date of birth</label>
        <input
          style={s.input}
          type="date"
          required
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
        />
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <label style={s.label}>I am a</label>
        <select
          style={s.select}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>
        <button style={s.primaryBtn} type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
        {error && <div style={s.error}>{error}</div>}
      </form>
      <button style={s.linkBtn} onClick={goLogin}>
        Already have an account? Log in
      </button>
    </div>
  );
}

//  Buyer browsing 
function BuyerBrowse({ token }) {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/vehicles", { token })
      .then((data) => setVehicles(data.data || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <div style={s.sectionTitle}>Vans for sale</div>
      {loading && <p style={{ color: colors.textMuted }}>Loading listings…</p>}
      {error && <div style={s.error}>{error}</div>}
      {!loading && vehicles.length === 0 && (
        <p style={{ color: colors.textMuted }}>No vans listed yet.</p>
      )}
      <div style={s.grid}>
        {vehicles.map((v) => (
          <div style={s.card} key={v.id}>
            <div style={s.vehicleImg}>No photo</div>
            <div style={{ fontWeight: 700 }}>
              {v.make} {v.model} ({v.year})
            </div>
            <div style={{ color: colors.yellow, fontWeight: 700, margin: "6px 0" }}>
              ₦{Number(v.price).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>
              {v.mileage?.toLocaleString()} km · {v.location || "Location N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//  Seller dashboard 
function SellerDashboard({ token }) {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    description: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);

  function loadVehicles() {
    setLoading(true);
    api("/seller/vehicles", { token })
      .then((data) => setVehicles(data.data || data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadVehicles, [token]);

  async function submitVehicle(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api("/seller/vehicles", {
        method: "POST",
        token,
        body: {
          ...form,
          year: Number(form.year),
          price: Number(form.price),
          mileage: Number(form.mileage),
        },
      });
      setForm({ make: "", model: "", year: "", price: "", mileage: "", description: "", location: "" });
      setShowForm(false);
      loadVehicles();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeVehicle(id) {
    if (!confirm("Remove this listing?")) return;
    try {
      await api(`/seller/vehicles/${id}`, { method: "DELETE", token });
      loadVehicles();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={s.sectionTitle}>My listings</div>
        <button style={s.smallBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add van"}
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {showForm && (
        <form style={{ ...s.card, marginBottom: 24 }} onSubmit={submitVehicle}>
          <div style={s.grid}>
            <div>
              <label style={s.label}>Make</label>
              <input style={s.input} required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Model</label>
              <input style={s.input} required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Year</label>
              <input style={s.input} type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Price (₦)</label>
              <input style={s.input} type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Mileage (km)</label>
              <input style={s.input} type="number" required value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
            </div>
            <div>
              <label style={s.label}>Location</label>
              <input style={s.input} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <label style={s.label}>Description</label>
          <textarea
            style={{ ...s.input, minHeight: 70, resize: "vertical" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button style={s.primaryBtn} type="submit" disabled={saving}>
            {saving ? "Saving…" : "List this van"}
          </button>
        </form>
      )}

      {loading && <p style={{ color: colors.textMuted }}>Loading your listings…</p>}
      {!loading && vehicles.length === 0 && (
        <p style={{ color: colors.textMuted }}>You haven't listed any vans yet.</p>
      )}
      <div style={s.grid}>
        {vehicles.map((v) => (
          <div style={s.card} key={v.id}>
            <div style={s.vehicleImg}>No photo</div>
            <div style={{ fontWeight: 700 }}>
              {v.make} {v.model} ({v.year})
            </div>
            <div style={{ color: colors.yellow, fontWeight: 700, margin: "6px 0" }}>
              ₦{Number(v.price).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
              Status: {v.status || "available"}
            </div>
            <button style={s.smallBtn} onClick={() => removeVehicle(v.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

//  Wallet 
function WalletView({ token }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function loadWallet() {
    api("/wallet", { token }).then(setWallet).catch((err) => setError(err.message));
    api("/wallet/transactions", { token })
      .then((data) => setTransactions(data.data || data))
      .catch((err) => setError(err.message));
  }

  useEffect(loadWallet, [token]);

  async function deposit() {
    setError("");
    setBusy(true);
    try {
      await api("/wallet/deposit", { method: "POST", token, body: { amount: Number(amount) } });
      setAmount("");
      loadWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setError("");
    setBusy(true);
    try {
      await api("/wallet/withdraw", { method: "POST", token, body: { amount: Number(amount) } });
      setAmount("");
      loadWallet();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={s.sectionTitle}>Wallet</div>
      <div style={s.statRow}>
        <div style={s.statBox}>
          <div style={s.statLabel}>Balance</div>
          <div style={s.statValue}>
            {wallet ? `₦${Number(wallet.balance).toLocaleString()}` : "…"}
          </div>
        </div>
      </div>

      <div style={{ ...s.card, maxWidth: 360 }}>
        <label style={s.label}>Amount (₦)</label>
        <input
          style={s.input}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button style={s.primaryBtn} onClick={deposit} disabled={busy || !amount}>
            Deposit
          </button>
          <button style={{ ...s.primaryBtn, background: "transparent", color: colors.yellow, border: `1px solid ${colors.yellow}` }} onClick={withdraw} disabled={busy || !amount}>
            Withdraw
          </button>
        </div>
        {error && <div style={s.error}>{error}</div>}
      </div>

      <div style={{ ...s.sectionTitle, marginTop: 32 }}>Recent transactions</div>
      {transactions.length === 0 && <p style={{ color: colors.textMuted }}>No transactions yet.</p>}
      {transactions.map((t) => (
        <div key={t.id} style={{ ...s.card, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{t.type}</div>
            <div style={{ fontSize: 12, color: colors.textMuted }}>{t.created_at}</div>
          </div>
          <div style={{ fontWeight: 700, color: t.type === "withdrawal" ? colors.danger : colors.success }}>
            {t.type === "withdrawal" ? "-" : "+"}₦{Number(t.amount).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
