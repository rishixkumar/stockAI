import StockSearch from './components/StockSearch';

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(120 113 108) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full py-20">
        <StockSearch />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center text-sm text-stone-500 border-t border-stone-200/50 bg-white/30 backdrop-blur-sm">
        <p>
          Built with{' '}
          <span className="text-amber-600 font-semibold">Next.js</span>
          {' & '}
          <span className="text-amber-600 font-semibold">FastAPI</span>
        </p>
      </footer>
    </main>
  );
}
