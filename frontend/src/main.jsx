import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";
import "./style.css";
import "./rain-slider.css";
import "./modern-theme.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 20,
          fontFamily: "Arial, sans-serif",
          color: "#111827",
          background: "#f8fafc",
          minHeight: "100vh"
        }}>
          <h1>Sovelluksessa tapahtui virhe</h1>
          <p>Tämä näkymä estää valkoisen sivun. Lähetä alla oleva virhe kehittäjälle:</p>
          <pre style={{
            whiteSpace: "pre-wrap",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            padding: 12,
            borderRadius: 8
          }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
