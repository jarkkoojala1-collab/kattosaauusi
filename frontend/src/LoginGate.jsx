import { useMemo, useState } from "react";

const AUTH_VERSION = "2026-05-31-password-pinnoitus2026-v1";
const AUTH_STORAGE_KEY = "kattosaa-auth-session";

// Kevyt sivuston lukitus. Vaihda nämä arvot tarvittaessa.
// Huom: frontend-toteutus ei ole pankkitason suojaus, mutta sopii huolto-/asiakaskäytön rajaamiseen.
const VALID_USERS = [
  { username: "kattosaa", password: "Pinnoitus2026" }
];

function readStoredSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isSessionValid(session) {
  return Boolean(session && session.version === AUTH_VERSION && session.loggedIn === true);
}

export default function LoginGate({ children }) {
  const initialSession = useMemo(() => {
    if (typeof window === "undefined") return null;
    return readStoredSession();
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(() => isSessionValid(initialSession));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function login(event) {
    event.preventDefault();

    const ok = VALID_USERS.some(
      (user) => user.username === username.trim() && user.password === password
    );

    if (!ok) {
      setError("Väärä käyttäjätunnus tai salasana.");
      setPassword("");
      return;
    }

    const session = {
      version: AUTH_VERSION,
      loggedIn: true,
      username: username.trim(),
      loggedInAt: new Date().toISOString()
    };

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setIsLoggedIn(true);
  }

  if (isLoggedIn) return children;

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={login}>
        <div className="login-logo">Kattosää</div>
        <h1>Kirjaudu sisään</h1>
        <p>Sivusto on rajattu kirjautuneille käyttäjille.</p>

        <label>
          Käyttäjätunnus
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label>
          Salasana
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit">Kirjaudu</button>
      </form>
    </div>
  );
}
