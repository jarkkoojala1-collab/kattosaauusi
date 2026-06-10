import { useMemo, useState } from "react";

const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  minWidth: 48,
  padding: "8px 13px",
  border: 0,
  borderRadius: 14,
  background: "#111827",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 8px 22px rgba(15, 23, 42, 0.22)",
  position: "relative",
  zIndex: 20
};

const backdropStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  display: "grid",
  placeItems: "center",
  padding: 16,
  background: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(8px)"
};

const panelStyle = {
  width: "min(520px, calc(100vw - 28px))",
  maxHeight: "calc(100vh - 28px)",
  overflow: "auto",
  padding: 18,
  borderRadius: 22,
  background: "#ffffff",
  color: "#111827",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.35)"
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
        KM
      </button>

      {open && (
        <div className="km-react-backdrop" style={backdropStyle} onClick={() => setOpen(false)}>
          <div className="km-react-panel" style={panelStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950 }}>KM-laskuri</h2>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13, fontWeight: 700 }}>Lähtö ja viimeisen työmaan paluu: {HALL_ADDRESS}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ width: 38, height: 38, border: 0, borderRadius: 12, background: "#f3f4f6", fontSize: 22 }}>×</button>
            </div>

            <div>
              {stops.map((stop, index) => (
                <label key={index} style={{ display: "grid", gap: 7, marginTop: 12, fontSize: 13, fontWeight: 900 }}>
                  <span>Työmaan osoite {index + 1}</span>
                  <div style={{ display: "grid", gridTemplateColumns: stops.length > 1 ? "1fr auto" : "1fr", gap: 8 }}>
                    <input
                      value={stop}
                      placeholder="Syötä osoite"
                      style={{ minHeight: 44, borderRadius: 12, border: "1px solid rgba(148, 163, 184, 0.45)", padding: "10px 12px", fontSize: 15 }}
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
                        style={{ border: 0, borderRadius: 12, padding: "0 12px", background: "#fee2e2", color: "#991b1b", fontWeight: 900 }}
                        onClick={() => {
                          setStops(stops.filter((_, itemIndex) => itemIndex !== index));
                          setLegs([]);
                        }}
                      >
                        Poista
                      </button>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <button type="button" style={{ minHeight: 44, border: 0, borderRadius: 12, fontWeight: 900 }} onClick={() => setStops([...stops, ""])}>Lisää pysähdys</button>
              <button type="button" style={{ minHeight: 44, border: 0, borderRadius: 12, fontWeight: 900, background: "#111827", color: "#ffffff" }} onClick={handleCalculate} disabled={loading}>
                {loading ? "Lasketaan..." : "Laske kilometrit"}
              </button>
            </div>

            {error && <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "#fee2e2", color: "#991b1b", fontWeight: 800 }}>{error}</div>}

            {legs.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <strong style={{ display: "block", fontSize: 28, fontWeight: 950 }}>Yhteensä {totalKm} km</strong>
                {legs.map((leg) => (
                  <section key={leg.id} style={{ marginTop: 14, padding: 12, borderRadius: 14, background: "#f8fafc", border: "1px solid rgba(148, 163, 184, 0.35)" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>{leg.title}</h3>
                    <strong>{leg.distanceKm} km</strong>
                    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: "10px 0", padding: 10, borderRadius: 10, background: "#ffffff" }}>{leg.copyText}</pre>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <button type="button" style={{ minHeight: 40, border: 0, borderRadius: 12, background: "#111827", color: "#ffffff", fontWeight: 900 }} onClick={() => handleCopy(leg)}>
                        {copiedLeg === leg.id ? "Kopioitu" : "Kopioi tämä työmaa"}
                      </button>
                      <a href={leg.mapsUrl} target="_blank" rel="noreferrer" style={{ minHeight: 40, borderRadius: 12, background: "#e5e7eb", color: "#111827", fontWeight: 900, textDecoration: "none", display: "grid", placeItems: "center" }}>Avaa Mapsissa</a>
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
