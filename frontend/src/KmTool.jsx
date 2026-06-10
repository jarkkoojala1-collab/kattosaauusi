import { useMemo, useState } from "react";

const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  minWidth: 42,
  padding: "8px 11px",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 14,
  background: "linear-gradient(180deg, #111827 0%, #020617 100%)",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.25)",
  position: "relative",
  zIndex: 20,
  fontSize: 18,
  lineHeight: 1
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  display: "grid",
  alignItems: "end",
  justifyItems: "center",
  padding: "12px 10px calc(14px + env(safe-area-inset-bottom))",
  background: "rgba(15, 23, 42, 0.30)",
  backdropFilter: "blur(6px)"
};

const panelStyle = {
  width: "min(520px, calc(100vw - 20px))",
  maxHeight: "76dvh",
  overflow: "auto",
  padding: 16,
  borderRadius: "24px 24px 16px 16px",
  background: "#ffffff",
  color: "#111827",
  boxShadow: "0 -12px 60px rgba(15, 23, 42, 0.30)",
  WebkitOverflowScrolling: "touch"
};

const secondaryButtonStyle = {
  minHeight: 42,
  border: 0,
  borderRadius: 13,
  padding: "9px 11px",
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

  async function handleCopy(leg) {
    await navigator.clipboard.writeText(leg.copyText);
    setCopiedLeg(leg.id);
  }

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

      {open && (
        <div className="km-react-backdrop" style={backdropStyle} onClick={() => setOpen(false)}>
          <div className="km-react-panel" style={panelStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ width: 42, height: 5, borderRadius: 999, background: "#cbd5e1", margin: "0 auto 12px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 950, letterSpacing: "-0.04em" }}>KM-laskuri</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12, fontWeight: 700 }}>
                  Lähtö ja viimeisen työmaan paluu: {HALL_ADDRESS}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ width: 38, height: 38, border: 0, borderRadius: 14, background: "#f1f5f9", fontSize: 20, cursor: "pointer" }} aria-label="Sulje">
                ✕
              </button>
            </div>

            <div>
              {stops.map((stop, index) => (
                <label key={index} style={{ display: "grid", gap: 6, marginTop: 10, fontSize: 13, fontWeight: 900 }}>
                  <span>Työmaan osoite {index + 1}</span>
                  <div style={{ display: "grid", gridTemplateColumns: stops.length > 1 ? "1fr auto" : "1fr", gap: 8 }}>
                    <input
                      value={stop}
                      placeholder="Syötä osoite"
                      style={{ minHeight: 42, borderRadius: 13, border: "1px solid rgba(148, 163, 184, 0.45)", padding: "9px 11px", fontSize: 15, outline: "none" }}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <button type="button" style={secondaryButtonStyle} onClick={() => setStops([...stops, ""])}>
                ＋ Pysähdys
              </button>
              <button type="button" style={primaryButtonStyle} onClick={handleCalculate} disabled={loading}>
                {loading ? "⏳ Lasketaan" : "↗ Laske"}
              </button>
            </div>

            {error && <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontWeight: 800 }}>{error}</div>}

            {legs.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong style={{ display: "block", fontSize: 24, fontWeight: 950, letterSpacing: "-0.04em" }}>Yhteensä {totalKm} km</strong>
                {legs.map((leg) => (
                  <section key={leg.id} style={{ marginTop: 12, padding: 12, borderRadius: 16, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.35)" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{leg.title}</h3>
                    <strong>{leg.distanceKm} km</strong>
                    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: "10px 0", padding: 10, borderRadius: 12, background: "#ffffff", fontSize: 13 }}>{leg.copyText}</pre>
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
      )}
    </>
  );
}
