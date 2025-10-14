'use client';

import { useState, useRef } from 'react';
import { Search, TrendingUp, BarChart3, Activity } from 'lucide-react';
import StockResultsModal from './StockResultsModal';

interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockData {
  ticker: string;
  company_name: string;
  interval: string;
  candlesticks: CandlestickData[];
  count: number;
}

export default function StockSearch() {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchedStock, setSearchedStock] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStockData = async (ticker: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/stock/${ticker}/candlestick`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch stock data');
      }
      const data: StockData = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStockData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchedStock(searchValue.trim());
      fetchStockData(searchValue.trim());
    }
  };

  const handleClose = () => {
    setSearchedStock(null);
    setSearchValue('');
    setStockData(null);
    setError(null);
  };

  const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];

  const handlePopularStockClick = (stock: string) => {
    setSearchValue(stock);
    setSearchedStock(stock);
    fetchStockData(stock);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Main heading with gradient */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/80 border border-amber-100/50 backdrop-blur-sm mb-6">
          <Activity className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-900">
            Real-time market intelligence
          </span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-stone-900 via-stone-700 to-stone-600 bg-clip-text text-transparent">
            Discover Stock
          </span>
          <br />
          <span className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Insights
          </span>
        </h1>
        
        <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Search any stock symbol to get comprehensive market data, analysis, and insights in real-time.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div
          className={`
            relative group
            transition-all duration-300 ease-out
            ${isFocused ? 'scale-[1.02]' : 'scale-100'}
          `}
        >
          {/* Glow effect on focus */}
          <div
            className={`
              absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-amber-400/20 
              blur-xl transition-opacity duration-500
              ${isFocused ? 'opacity-100' : 'opacity-0'}
            `}
          />
          
          {/* Main search container */}
          <div
            className={`
              relative flex items-center gap-3 w-full
              px-6 py-5 rounded-2xl
              bg-white/80 backdrop-blur-md
              border-2 transition-all duration-300
              shadow-lg shadow-stone-200/50
              ${
                isFocused
                  ? 'border-amber-300 shadow-xl shadow-amber-200/30'
                  : 'border-stone-200 hover:border-stone-300'
              }
            `}
          >
            {/* Search icon with animation */}
            <div
              className={`
                transition-all duration-300
                ${isFocused ? 'text-amber-600 scale-110' : 'text-stone-400'}
              `}
            >
              <Search className="w-6 h-6" strokeWidth={2.5} />
            </div>

            {/* Input field */}
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter stock symbol (e.g., AAPL, MSFT, GOOGL)"
              className="
                flex-1 bg-transparent outline-none
                text-stone-900 placeholder-stone-400
                text-lg font-medium tracking-wide
                transition-all duration-300
              "
              maxLength={10}
            />

            {/* Search button */}
            <button
              type="submit"
              disabled={!searchValue.trim()}
              className={`
                px-6 py-2.5 rounded-xl font-semibold
                transition-all duration-300 ease-out
                flex items-center gap-2
                ${
                  searchValue.trim()
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105 active:scale-95'
                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                }
              `}
            >
              Search
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Popular stocks section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
          <BarChart3 className="w-4 h-4" />
          <span className="font-medium">Popular stocks</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {popularStocks.map((stock) => (
            <button
              key={stock}
              onClick={() => handlePopularStockClick(stock)}
              className="
                px-4 py-2 rounded-lg
                bg-white/60 backdrop-blur-sm
                border border-stone-200
                text-stone-700 font-semibold text-sm
                transition-all duration-300 ease-out
                hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900
                hover:shadow-md hover:shadow-amber-200/50
                hover:scale-105 active:scale-95
              "
            >
              {stock}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Popup Window */}
      {searchedStock && (
        <StockResultsModal 
          stockSymbol={searchedStock}
          stockData={stockData}
          isLoading={isLoading}
          error={error}
          onClose={handleClose} 
        />
      )}

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-10 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

