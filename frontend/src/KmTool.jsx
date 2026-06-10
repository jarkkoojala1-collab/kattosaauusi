import { useMemo, useState } from "react";

const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";

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
        className="ghost-location-button km-react-button"
        onClick={() => setOpen(true)}
        aria-label="KM-laskuri"
        title="KM-laskuri"
      >
        <span className="desktop-label">KM</span>
        <span className="mobile-label">🚗</span>
      </button>

      {open && (
        <div className="km-react-backdrop" onClick={() => setOpen(false)}>
          <div className="km-react-panel" onClick={(event) => event.stopPropagation()}>
            <div className="km-react-head">
              <div>
                <h2>KM-laskuri</h2>
                <p>Lähtö ja viimeisen työmaan paluu: {HALL_ADDRESS}</p>
              </div>
              <button type="button" className="km-react-close" onClick={() => setOpen(false)}>×</button>
            </div>

            <div className="km-react-stops">
              {stops.map((stop, index) => (
                <label key={index} className="km-react-stop">
                  <span>Työmaan osoite {index + 1}</span>
                  <div>
                    <input
                      value={stop}
                      placeholder="Syötä osoite"
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

            <div className="km-react-actions">
              <button type="button" onClick={() => setStops([...stops, ""])}>Lisää pysähdys</button>
              <button type="button" className="primary" onClick={handleCalculate} disabled={loading}>
                {loading ? "Lasketaan..." : "Laske kilometrit"}
              </button>
            </div>

            {error && <div className="km-react-error">{error}</div>}

            {legs.length > 0 && (
              <div className="km-react-result">
                <strong>Yhteensä {totalKm} km</strong>
                {legs.map((leg) => (
                  <section key={leg.id} className="km-react-leg">
                    <h3>{leg.title}</h3>
                    <strong>{leg.distanceKm} km</strong>
                    <pre>{leg.copyText}</pre>
                    <div className="km-react-actions">
                      <button type="button" className="primary" onClick={() => handleCopy(leg)}>
                        {copiedLeg === leg.id ? "Kopioitu" : "Kopioi tämä työmaa"}
                      </button>
                      <a href={leg.mapsUrl} target="_blank" rel="noreferrer">Avaa Mapsissa</a>
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
