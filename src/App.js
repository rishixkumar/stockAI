import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [ticker, setTicker] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [lastQueriedTicker, setLastQueriedTicker] = useState('');
  const [responsesByTicker, setResponsesByTicker] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const overlayRef = useRef(null);

  const currentText = lastQueriedTicker ? responsesByTicker[lastQueriedTicker] : '';

  function sanitizeTicker(value) {
    return value.replace(/[^A-Za-z.\-]/g, '').toUpperCase().slice(0, 10);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleaned = sanitizeTicker(ticker);
    if (!cleaned) return;

    // Open modal immediately and show loading only if we will fetch
    setModalOpen(true);

    const hasCached = Boolean(responsesByTicker[cleaned]);
    const isSameAsLast = cleaned === lastQueriedTicker;

    if (hasCached && isSameAsLast) {
      setLoading(false);
      setErrorMsg('');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: cleaned })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Request failed');
      }
      const data = await resp.json();
      const content = data?.content || '';
      setResponsesByTicker((prev) => ({ ...prev, [cleaned]: content }));
      setLastQueriedTicker(cleaned);
    } catch (err) {
      setErrorMsg('Unable to generate description. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openModal() {
    if (!lastQueriedTicker) return;
    setModalOpen(true);
    setLoading(false); // no requery on open
  }

  function closeModal() {
    setModalOpen(false);
  }

  useEffect(() => {
    if (!isModalOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

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

        <form className="ticker-form" onSubmit={handleSubmit}>
          <label htmlFor="ticker" className="sr-only">Ticker</label>
          <div className="input-row">
            <input
              id="ticker"
              name="ticker"
              autoComplete="off"
              inputMode="text"
              pattern="[A-Za-z.\-]{1,10}"
              placeholder="e.g. AAPL"
              className="ticker-input"
              aria-label="Enter stock ticker"
              value={ticker}
              onChange={(e) => setTicker(sanitizeTicker(e.target.value))}
            />
            <button type="submit" className="submit-btn">Analyze</button>
          </div>
          <p className="hint">Supported formats: AAPL, MSFT, BRK.B {lastQueriedTicker ? `• Last: ${lastQueriedTicker}` : ''}</p>
        </form>

        {lastQueriedTicker && (
          <button className="link-btn" onClick={openModal} aria-label="View last result">
            View last result
          </button>
        )}
      </main>

      <footer className="footer">
        <span>© {new Date().getFullYear()} StockAI</span>
      </footer>

      {isModalOpen && (
        <div
          className="modal-overlay"
          ref={overlayRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <h2 id="modal-title" className="modal-title">{lastQueriedTicker || 'Result'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <div className="spinner-wrap">
                  <div className="spinner" />
                  <div className="spinner-text">Generating summary…</div>
                </div>
              ) : errorMsg ? (
                <div className="error-text">{errorMsg}</div>
              ) : (
                <p className="modal-text">{currentText}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
