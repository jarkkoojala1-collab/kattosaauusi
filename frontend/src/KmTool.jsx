import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 52,
  minWidth: 52,
  padding: "8px 11px",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 16,
  background: "linear-gradient(180deg, #111827 0%, #020617 100%)",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.25)",
  position: "relative",
  zIndex: 20,
  fontSize: 22,
  lineHeight: 1
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: "0 8px calc(22px + env(safe-area-inset-bottom))",
  background: "rgba(15, 23, 42, 0.12)",
  pointerEvents: "auto"
};

const panelStyle = {
  width: "min(520px, calc(100vw - 16px))",
  maxHeight: "72dvh",
  overflow: "auto",
  padding: "12px 14px 14px",
  borderRadius: "22px",
  background: "#ffffff",
  color: "#111827",
  boxShadow: "0 14px 45px rgba(15, 23, 42, 0.28)",
  WebkitOverflowScrolling: "touch"
};

const secondaryButtonStyle = {
  minHeight: 40,
  border: 0,
  borderRadius: 13,
  padding: "8px 10px",
  background: "#f1f5f9",
  color: "#111827",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontSize: 14
};

const primaryButtonStyle = {
  ...secondaryButtonStyle,
  background: "#111827",
  color: "#ffffff"
};

const clearButtonStyle = {
  ...secondaryButtonStyle,
  background: "#e2e8f0",
  color: "#0f172a"
};

const dangerButtonStyle = {
  ...secondaryButtonStyle,
  background: "#fee2e2",
  color: "#991b1b"
};

function makeCopyText(addresses) {
  return addresses
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
}

function makeMapsUrl(addresses) {
  return `https://www.google.com/maps/dir/${addresses.map(encodeURIComponent).join("/")}`;
}

async function geocode(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`, {
    headers: { Accept: "application/json" }
  });
  const data = await response.json();
  if (!data?.[0]) throw new Error(`Osoitetta ei löytynyt: ${address}`);
  return [Number(data[0].lon), Number(data[0].lat)];
}

async function calculateLegKm(addresses) {
  const coords = [];
  for (const address of addresses) {
    coords.push(await geocode(address));
  }

  const coordText = coords.map((coord) => coord.join(",")).join(";");
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordText}?overview=false`);
  const data = await response.json();
  if (!data?.routes?.[0]) throw new Error("Reittiä ei voitu laskea.");
  return Math.round(data.routes[0].distance / 1000);
}

function makeWorksiteLegs(stops) {
  return stops.map((stop, index) => {
    const isFirst = index === 0;
    const isLast = index === stops.length - 1;
    const previousAddress = isFirst ? HALL_ADDRESS : stops[index - 1];
    const addresses = isLast ? [previousAddress, stop, HALL_ADDRESS] : [previousAddress, stop];

    return {
      id: `${index}-${stop}`,
      title: `Työmaa ${index + 1}`,
      worksite: stop,
      addresses,
      copyText: makeCopyText(addresses),
      mapsUrl: makeMapsUrl(addresses),
      distanceKm: null
    };
  });
}

export default function KmTool({ selectedArea }) {
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState([""]);
  const [legs, setLegs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedLeg, setCopiedLeg] = useState(null);

  const cleanStops = useMemo(() => stops.map((stop) => stop.trim()).filter(Boolean), [stops]);
  const visible = selectedArea === "uusimaa";
  const totalKm = legs.reduce((sum, leg) => sum + (Number(leg.distanceKm) || 0), 0);

  if (!visible) return null;

  async function handleCalculate() {
    setError("");
    setCopiedLeg(null);

    if (!cleanStops.length) {
      setError("Lisää vähintään yksi työmaan osoite.");
      return;
    }

    try {
      setLoading(true);
      const nextLegs = makeWorksiteLegs(cleanStops);
      const calculatedLegs = [];

      for (const leg of nextLegs) {
        const distanceKm = await calculateLegKm(leg.addresses);
        calculatedLegs.push({ ...leg, distanceKm });
      }

      setLegs(calculatedLegs);
    } catch (err) {
      setError(err?.message || "Kilometrien laskenta epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setStops([""]);
    setLegs([]);
    setError("");
    setCopiedLeg(null);
    setLoading(false);
  }

  async function handleCopy(leg) {
    await navigator.clipboard.writeText(leg.copyText);
    setCopiedLeg(leg.id);
  }

  const modal = open ? (
    <div className="km-react-backdrop" style={backdropStyle} onClick={() => setOpen(false)}>
      <div className="km-react-panel" style={panelStyle} onClick={(event) => event.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "#cbd5e1", margin: "0 auto 8px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 950, letterSpacing: "-0.04em" }}>KM-laskuri</h2>
            <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: 11, fontWeight: 700, lineHeight: 1.25 }}>
              Halli: {HALL_ADDRESS}
            </p>
          </div>
          <button type="button" onClick={() => setOpen(false)} style={{ width: 34, height: 34, border: 0, borderRadius: 12, background: "#f1f5f9", fontSize: 18, cursor: "pointer", flex: "0 0 auto" }} aria-label="Sulje">
            ✕
          </button>
        </div>

        <div>
          {stops.map((stop, index) => (
            <label key={index} style={{ display: "grid", gap: 5, marginTop: 8, fontSize: 12, fontWeight: 900 }}>
              <span>Työmaan osoite {index + 1}</span>
              <div style={{ display: "grid", gridTemplateColumns: stops.length > 1 ? "1fr 42px" : "1fr", gap: 8 }}>
                <input
                  value={stop}
                  placeholder="Syötä osoite"
                  style={{ minHeight: 40, borderRadius: 13, border: "1px solid rgba(148, 163, 184, 0.45)", padding: "8px 11px", fontSize: 15, outline: "none" }}
                  onChange={(event) => {
                    const next = [...stops];
                    next[index] = event.target.value;
                    setStops(next);
                    setLegs([]);
                  }}
                />
                {stops.length > 1 && (
                  <button
                    type="button"
                    style={dangerButtonStyle}
                    onClick={() => {
                      setStops(stops.filter((_, itemIndex) => itemIndex !== index));
                      setLegs([]);
                    }}
                    aria-label="Poista pysähdys"
                    title="Poista"
                  >
                    🗑
                  </button>
                )}
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          <button type="button" style={secondaryButtonStyle} onClick={() => setStops([...stops, ""])}>
            + Pysähdys
          </button>
          <button type="button" style={primaryButtonStyle} onClick={handleCalculate} disabled={loading}>
            {loading ? "⏳ Lasketaan" : "↗ Laske"}
          </button>
        </div>

        <button type="button" style={{ ...clearButtonStyle, width: "100%", marginTop: 10 }} onClick={handleClear} disabled={loading}>
          Tyhjennä
        </button>

        {error && <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontWeight: 800 }}>{error}</div>}

        {legs.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <strong style={{ display: "block", fontSize: 22, fontWeight: 950, letterSpacing: "-0.04em" }}>Yhteensä {totalKm} km</strong>
            {legs.map((leg) => (
              <section key={leg.id} style={{ marginTop: 10, padding: 10, borderRadius: 16, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.35)" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: 15 }}>{leg.title}</h3>
                <strong>{leg.distanceKm} km</strong>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: "8px 0", padding: 9, borderRadius: 12, background: "#ffffff", fontSize: 13 }}>{leg.copyText}</pre>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <button type="button" style={primaryButtonStyle} onClick={() => handleCopy(leg)}>
                    {copiedLeg === leg.id ? "✓ Kopioitu" : "⧉ Kopioi"}
                  </button>
                  <a href={leg.mapsUrl} target="_blank" rel="noreferrer" style={secondaryButtonStyle}>⌖ Maps</a>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        className="km-react-button"
        style={buttonStyle}
        onClick={() => setOpen(true)}
        aria-label="KM-laskuri"
        title="KM-laskuri"
      >
        ⛟
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
