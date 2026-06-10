import { useMemo, useState } from "react";

const HALL_ADDRESS = "Ilvesvuorenkatu 25, Nurmijärvi";

function makeCopyText(stops) {
  return [HALL_ADDRESS, ...stops, HALL_ADDRESS]
    .filter(Boolean)
    .map((item) => `- ${item}`)
    .join("\n");
}

function makeMapsUrl(stops) {
  return `https://www.google.com/maps/dir/${[HALL_ADDRESS, ...stops, HALL_ADDRESS].map(encodeURIComponent).join("/")}`;
}

async function geocode(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`, {
    headers: { Accept: "application/json" }
  });
  const data = await response.json();
  if (!data?.[0]) throw new Error(`Osoitetta ei löytynyt: ${address}`);
  return [Number(data[0].lon), Number(data[0].lat)];
}

async function calculateKm(stops) {
  const coords = [];
  for (const address of [HALL_ADDRESS, ...stops, HALL_ADDRESS]) {
    coords.push(await geocode(address));
  }

  const coordText = coords.map((coord) => coord.join(",")).join(";");
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordText}?overview=false`);
  const data = await response.json();
  if (!data?.routes?.[0]) throw new Error("Reittiä ei voitu laskea.");
  return Math.round(data.routes[0].distance / 1000);
}

export default function KmTool({ selectedArea }) {
  const [open, setOpen] = useState(false);
  const [stops, setStops] = useState([""]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanStops = useMemo(() => stops.map((stop) => stop.trim()).filter(Boolean), [stops]);
  const visible = selectedArea === "uusimaa";
  const copyText = makeCopyText(cleanStops);

  if (!visible) return null;

  async function handleCalculate() {
    setError("");
    setCopied(false);

    if (!cleanStops.length) {
      setError("Lisää vähintään yksi työmaan osoite.");
      return;
    }

    try {
      setLoading(true);
      const km = await calculateKm(cleanStops);
      setDistanceKm(km);
    } catch (err) {
      setError(err?.message || "Kilometrien laskenta epäonnistui.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
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
                <p>Lähtö ja paluu: {HALL_ADDRESS}</p>
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
                        setDistanceKm(null);
                      }}
                    />
                    {stops.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStops(stops.filter((_, itemIndex) => itemIndex !== index))}
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

            {distanceKm !== null && (
              <div className="km-react-result">
                <strong>{distanceKm} km</strong>
                <pre>{copyText}</pre>
                <div className="km-react-actions">
                  <button type="button" className="primary" onClick={handleCopy}>{copied ? "Kopioitu" : "Kopioi osoitteet"}</button>
                  <a href={makeMapsUrl(cleanStops)} target="_blank" rel="noreferrer">Avaa Google Mapsissa</a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
