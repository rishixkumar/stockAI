'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';

interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickListProps {
  candlesticks: CandlestickData[];
}

export default function CandlestickList({ candlesticks }: CandlestickListProps) {
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
    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
      {candlesticks.map((candle, index) => {
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
  );
}

