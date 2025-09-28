import './App.css';

function App() {
  return (
    <div className="page-root">
      <header className="brand">
        <div className="brand-dot" />
        <span className="brand-name">StockAI</span>
      </header>

      <main className="hero">
        <h1 className="hero-title">Market intelligence, simplified.</h1>
        <p className="hero-subtitle">
          Enter a stock ticker to begin. Minimal noise, maximal signal.
        </p>

        <form className="ticker-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="ticker" className="sr-only">Ticker</label>
          <div className="input-row">
            <input
              id="ticker"
              name="ticker"
              autoComplete="off"
              inputMode="text"
              pattern="[A-Za-z\.\-]{1,10}"
              placeholder="e.g. AAPL"
              className="ticker-input"
              aria-label="Enter stock ticker"
            />
            <button type="submit" className="submit-btn">Analyze</button>
          </div>
          <p className="hint">Supported formats: AAPL, MSFT, BRK.B</p>
        </form>
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} StockAI</span>
      </footer>
    </div>
  );
}

export default App;
