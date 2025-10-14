'use client';

import { useState } from 'react';
import { TrendingUp, Activity, X, Loader2, AlertCircle, Clock } from 'lucide-react';
import CandlestickList from './CandlestickList';

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
  requested_count?: number;
}

interface AllStockData {
  default: StockData | null;
  tenMin: StockData | null;
  thirtyMin: StockData | null;
  oneHour: StockData | null;
}

interface StockResultsModalProps {
  stockSymbol: string;
  allStockData: AllStockData;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

type TabType = 'quick' | '10m' | '30m' | '1h';

export default function StockResultsModal({ 
  stockSymbol, 
  allStockData, 
  isLoading, 
  error, 
  onClose 
}: StockResultsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quick');

  // Get the currently displayed stock data based on active tab
  const getCurrentStockData = (): StockData | null => {
    switch (activeTab) {
      case 'quick':
        return allStockData.default;
      case '10m':
        return allStockData.tenMin;
      case '30m':
        return allStockData.thirtyMin;
      case '1h':
        return allStockData.oneHour;
      default:
        return null;
    }
  };

  const stockData = getCurrentStockData();

  const tabs = [
    { id: 'quick' as TabType, label: 'Quick View', subtitle: '10 candles', available: !!allStockData.default },
    { id: '10m' as TabType, label: '15 Min', subtitle: '100 candles', available: !!allStockData.tenMin },
    { id: '30m' as TabType, label: '30 Min', subtitle: '100 candles', available: !!allStockData.thirtyMin },
    { id: '1h' as TabType, label: '1 Hour', subtitle: '100 candles', available: !!allStockData.oneHour },
  ];
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
                  {(allStockData.default || allStockData.tenMin || allStockData.thirtyMin || allStockData.oneHour) && (
                    <p className="text-sm text-stone-600 mt-1">
                      {allStockData.default?.company_name || 
                       allStockData.tenMin?.company_name || 
                       allStockData.thirtyMin?.company_name || 
                       allStockData.oneHour?.company_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              {!isLoading && !error && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={!tab.available}
                      className={`
                        flex-shrink-0 px-4 py-3 rounded-lg transition-all duration-300
                        ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                            : tab.available
                            ? 'bg-white border-2 border-stone-200 text-stone-700 hover:border-amber-300 hover:shadow-md'
                            : 'bg-stone-100 border-2 border-stone-200 text-stone-400 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <div className="text-left">
                          <p className="font-semibold text-sm">{tab.label}</p>
                          <p className={`text-xs ${activeTab === tab.id ? 'text-amber-100' : 'text-stone-500'}`}>
                            {tab.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

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
                    <label className="text-sm font-semibold text-stone-600 uppercase tracking-wide flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-600" />
                      Candlestick Data ({stockData.interval} intervals)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded">
                        Showing {stockData.count} candles
                      </span>
                    </div>
                  </div>

                  <CandlestickList candlesticks={stockData.candlesticks} />
                </div>
              )}

              {/* No Data State (when tab has no data) */}
              {!isLoading && !error && !stockData && (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <AlertCircle className="w-12 h-12 text-stone-400" />
                  <p className="text-stone-600 font-medium">No data available for this timeframe</p>
                  <p className="text-sm text-stone-500">Try selecting a different interval</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


