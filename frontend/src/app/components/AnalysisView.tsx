'use client';

import { TrendingUp, TrendingDown, Minus, Target, BarChart3, Activity } from 'lucide-react';
import TradingDecision from './TradingDecision';
import MLTradingRecommendations from './MLTradingRecommendations';

interface AnalysisData {
  ticker: string;
  analysis_timestamp: string;
  stock_analysis: any;
  news_sentiment: any;
  stock_sentiment: any;
  combined_sentiment: any;
  recommendations: string[];
  ml_trading_signals?: any;
  trading_decision?: any;
}

interface AnalysisViewProps {
  analysisData: AnalysisData;
}

export default function AnalysisView({ analysisData }: AnalysisViewProps) {
  const { stock_analysis, news_sentiment, stock_sentiment, combined_sentiment, recommendations, ml_trading_signals, trading_decision } = analysisData;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'bullish':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'negative':
      case 'bearish':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      default:
        return <Minus className="w-6 h-6 text-stone-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'bullish':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'negative':
      case 'bearish':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-stone-700 bg-stone-50 border-stone-200';
    }
  };


  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-stone-900">Comprehensive Market Analysis</h2>
        <p className="text-sm text-stone-600">
          ML-Powered Analysis • Generated {formatTimestamp(analysisData.analysis_timestamp)}
        </p>
      </div>

      {/* Trading Decision - Top Priority */}
      {trading_decision && (
        <TradingDecision tradingDecision={trading_decision} />
      )}

      {/* ML Trading Recommendations */}
      {ml_trading_signals && ml_trading_signals.trading_recommendations && (
        <MLTradingRecommendations recommendations={ml_trading_signals.trading_recommendations} />
      )}

      {/* Combined Sentiment Overview */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            Overall Market Sentiment
          </h3>
          {getSentimentIcon(combined_sentiment.overall_sentiment)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-700">
              {combined_sentiment.combined_score > 0 ? '+' : ''}{combined_sentiment.combined_score}
            </p>
            <p className="text-sm text-stone-600">Combined Score</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold capitalize">
              {combined_sentiment.overall_sentiment}
            </p>
            <p className="text-sm text-stone-600">Sentiment</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">
              {Math.round(Math.abs(combined_sentiment.combined_score) * 100)}%
            </p>
            <p className="text-sm text-stone-600">Confidence</p>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Sentiment */}
        <div className="bg-white border-2 border-stone-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            News Sentiment Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-700">Overall Sentiment:</span>
              <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getSentimentColor(news_sentiment.overall_sentiment)}`}>
                {getSentimentIcon(news_sentiment.overall_sentiment)}
                <span className="capitalize font-semibold">{news_sentiment.overall_sentiment}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Positive:</span>
                <span className="font-semibold text-green-600">{(news_sentiment.sentiment_scores.positive * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Neutral:</span>
                <span className="font-semibold text-stone-600">{(news_sentiment.sentiment_scores.neutral * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Negative:</span>
                <span className="font-semibold text-red-600">{(news_sentiment.sentiment_scores.negative * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-stone-200">
              <div className="flex justify-between text-sm">
                <span>Articles Analyzed:</span>
                <span className="font-semibold">{news_sentiment.articles_analyzed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confidence:</span>
                <span className="font-semibold">{(news_sentiment.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Sentiment */}
        <div className="bg-white border-2 border-stone-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Price Movement Sentiment
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-stone-700">Market Sentiment:</span>
              <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getSentimentColor(stock_sentiment.sentiment)}`}>
                {getSentimentIcon(stock_sentiment.sentiment)}
                <span className="capitalize font-semibold">{stock_sentiment.sentiment}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Price Momentum:</span>
                <span className="font-semibold">{stock_sentiment.indicators.price_momentum > 0 ? '+' : ''}{stock_sentiment.indicators.price_momentum}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volume Momentum:</span>
                <span className="font-semibold">{stock_sentiment.indicators.volume_momentum > 0 ? '+' : ''}{stock_sentiment.indicators.volume_momentum}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Positive Moves:</span>
                <span className="font-semibold text-green-600">{stock_sentiment.indicators.positive_moves}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Negative Moves:</span>
                <span className="font-semibold text-red-600">{stock_sentiment.indicators.negative_moves}</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-stone-200">
              <div className="flex justify-between text-sm">
                <span>Avg Price Change:</span>
                <span className="font-semibold">{stock_sentiment.recent_performance.avg_price_change > 0 ? '+' : ''}{stock_sentiment.recent_performance.avg_price_change}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volatility:</span>
                <span className="font-semibold">{stock_sentiment.recent_performance.volatility.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Analysis Summary */}
      <div className="bg-white border-2 border-stone-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-600" />
          Stock Performance Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-stone-900">${stock_analysis.current_price}</p>
            <p className="text-sm text-stone-600">Current Price</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stock_analysis.price_statistics.highest}</p>
            <p className="text-sm text-stone-600">52-Week High</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stock_analysis.price_statistics.lowest}</p>
            <p className="text-sm text-stone-600">52-Week Low</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{stock_analysis.price_statistics.volatility}</p>
            <p className="text-sm text-stone-600">Volatility</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-stone-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-stone-700">24h Change:</span>
              <span className={`ml-2 font-semibold ${stock_analysis.trend_analysis.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock_analysis.trend_analysis.price_change_24h > 0 ? '+' : ''}{stock_analysis.trend_analysis.price_change_24h}%
              </span>
            </div>
            <div>
              <span className="font-medium text-stone-700">7d Change:</span>
              <span className={`ml-2 font-semibold ${stock_analysis.trend_analysis.price_change_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock_analysis.trend_analysis.price_change_7d > 0 ? '+' : ''}{stock_analysis.trend_analysis.price_change_7d}%
              </span>
            </div>
            <div>
              <span className="font-medium text-stone-700">Trend:</span>
              <span className={`ml-2 font-semibold capitalize ${stock_analysis.trend_analysis.recent_trend === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
                {stock_analysis.trend_analysis.recent_trend}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
