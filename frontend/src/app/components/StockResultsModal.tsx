'use client';

import { TrendingUp, Activity, X, Loader2, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

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

interface StockResultsModalProps {
  stockSymbol: string;
  stockData: StockData | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function StockResultsModal({ 
  stockSymbol, 
  stockData, 
  isLoading, 
  error, 
  onClose 
}: StockResultsModalProps) {
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toString();
  };
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div 
        className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400/30 via-orange-400/30 to-amber-400/30 blur-xl" />
          
          {/* Results card */}
          <div className="relative bg-white rounded-2xl border-2 border-amber-200 shadow-2xl shadow-amber-900/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Search Results</h3>
                  <p className="text-amber-50 text-sm">Raw input data</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Stock Symbol */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                  Stock Symbol
                </label>
                <div className="bg-stone-50 border-2 border-stone-200 rounded-xl px-6 py-4">
                  <p className="text-2xl font-bold text-stone-900 font-mono tracking-wider">
                    {stockSymbol}
                  </p>
                  {stockData && (
                    <p className="text-sm text-stone-600 mt-1">{stockData.company_name}</p>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                  <p className="text-stone-600 font-medium">Fetching candlestick data...</p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Candlestick Data */}
              {!isLoading && !error && stockData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                      Candlestick Data ({stockData.interval} intervals)
                    </label>
                    <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
                      {stockData.count} candles
                    </span>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {stockData.candlesticks.map((candle, index) => {
                      const isGreen = candle.close >= candle.open;
                      const changePercent = ((candle.close - candle.open) / candle.open * 100).toFixed(2);
                      
                      return (
                        <div 
                          key={index}
                          className="bg-white border-2 border-stone-200 rounded-lg p-4 hover:border-amber-300 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-stone-500 font-medium">
                                {formatTimestamp(candle.timestamp)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className={`text-2xl font-bold ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
                                  ${candle.close.toFixed(2)}
                                </p>
                                <div className={`flex items-center gap-1 text-sm font-semibold ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
                                  {isGreen ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                  {Math.abs(parseFloat(changePercent))}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-stone-500 font-medium mb-1">Volume</p>
                              <p className="text-sm font-bold text-stone-700">{formatVolume(candle.volume)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div className="bg-stone-50 rounded px-2 py-1.5">
                              <p className="text-stone-500 font-medium">Open</p>
                              <p className="font-bold text-stone-900">${candle.open.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 rounded px-2 py-1.5">
                              <p className="text-green-700 font-medium">High</p>
                              <p className="font-bold text-green-900">${candle.high.toFixed(2)}</p>
                            </div>
                            <div className="bg-red-50 rounded px-2 py-1.5">
                              <p className="text-red-700 font-medium">Low</p>
                              <p className="font-bold text-red-900">${candle.low.toFixed(2)}</p>
                            </div>
                            <div className={`${isGreen ? 'bg-green-50' : 'bg-red-50'} rounded px-2 py-1.5`}>
                              <p className={`${isGreen ? 'text-green-700' : 'text-red-700'} font-medium`}>Close</p>
                              <p className={`font-bold ${isGreen ? 'text-green-900' : 'text-red-900'}`}>${candle.close.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ready State (when no data yet) */}
              {!isLoading && !error && !stockData && (
                <div className="flex items-center gap-2 text-sm text-stone-500 bg-amber-50/50 border border-amber-100 rounded-lg px-4 py-3">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Ready to fetch market data for this symbol</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


