"""
ML-based trading predictor using technical indicators and sentiment analysis.
Generates personalized trading recommendations based on multiple factors.
"""

import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timezone


class TradingPredictor:
    """
    Machine learning-based trading predictor that analyzes technical indicators,
    price movements, and sentiment to generate personalized trading recommendations.
    """
    
    def __init__(self):
        self.min_data_points = 20  # Minimum data points needed for analysis
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Calculate Relative Strength Index (RSI)"""
        if len(prices) < period + 1:
            return 50.0  # Neutral RSI if not enough data
        
        deltas = np.diff(prices)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)
        
        avg_gain = np.mean(gains[-period:])
        avg_loss = np.mean(losses[-period:])
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_macd(self, prices: List[float]) -> Tuple[float, float, str]:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        if len(prices) < 26:
            return 0.0, 0.0, "neutral"
        
        prices_array = np.array(prices)
        
        # Calculate EMAs
        ema_12 = self._calculate_ema(prices_array, 12)
        ema_26 = self._calculate_ema(prices_array, 26)
        
        macd_line = ema_12 - ema_26
        signal_line = self._calculate_ema([macd_line], 9) if len(prices) >= 35 else 0
        
        # Determine signal
        if macd_line > signal_line:
            signal = "bullish"
        elif macd_line < signal_line:
            signal = "bearish"
        else:
            signal = "neutral"
        
        return macd_line, signal_line, signal
    
    def _calculate_ema(self, data: np.ndarray, period: int) -> float:
        """Calculate Exponential Moving Average"""
        if len(data) < period:
            return float(np.mean(data))
        
        multiplier = 2 / (period + 1)
        ema = np.mean(data[:period])
        
        for price in data[period:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        
        return ema
    
    def calculate_bollinger_bands(self, prices: List[float], period: int = 20) -> Dict[str, float]:
        """Calculate Bollinger Bands"""
        if len(prices) < period:
            avg = np.mean(prices)
            return {
                "upper": avg * 1.02,
                "middle": avg,
                "lower": avg * 0.98,
                "position": "middle"
            }
        
        prices_array = np.array(prices[-period:])
        sma = np.mean(prices_array)
        std = np.std(prices_array)
        
        upper_band = sma + (2 * std)
        lower_band = sma - (2 * std)
        current_price = prices[-1]
        
        # Determine position
        if current_price >= upper_band:
            position = "overbought"
        elif current_price <= lower_band:
            position = "oversold"
        elif current_price > sma:
            position = "upper_half"
        else:
            position = "lower_half"
        
        return {
            "upper": upper_band,
            "middle": sma,
            "lower": lower_band,
            "position": position,
            "bandwidth": (upper_band - lower_band) / sma
        }
    
    def calculate_moving_averages(self, prices: List[float]) -> Dict[str, Any]:
        """Calculate multiple moving averages and trends"""
        if len(prices) < 50:
            return {
                "sma_20": prices[-1] if prices else 0,
                "sma_50": prices[-1] if prices else 0,
                "sma_200": prices[-1] if prices else 0,
                "trend": "insufficient_data"
            }
        
        sma_20 = np.mean(prices[-20:])
        sma_50 = np.mean(prices[-50:])
        sma_200 = np.mean(prices[-200:]) if len(prices) >= 200 else np.mean(prices)
        
        current_price = prices[-1]
        
        # Determine trend
        if current_price > sma_20 > sma_50:
            trend = "strong_uptrend"
        elif current_price > sma_20:
            trend = "uptrend"
        elif current_price < sma_20 < sma_50:
            trend = "strong_downtrend"
        elif current_price < sma_20:
            trend = "downtrend"
        else:
            trend = "sideways"
        
        return {
            "sma_20": sma_20,
            "sma_50": sma_50,
            "sma_200": sma_200,
            "trend": trend,
            "distance_from_sma20": ((current_price - sma_20) / sma_20) * 100
        }
    
    def calculate_support_resistance(self, highs: List[float], lows: List[float], 
                                     current_price: float) -> Dict[str, Any]:
        """Calculate dynamic support and resistance levels"""
        if len(highs) < 10 or len(lows) < 10:
            return {
                "resistance": current_price * 1.05,
                "support": current_price * 0.95,
                "next_resistance": current_price * 1.10,
                "next_support": current_price * 0.90
            }
        
        # Find local maxima and minima
        resistance_levels = sorted(set([h for h in highs if h > current_price]))[:3]
        support_levels = sorted(set([l for l in lows if l < current_price]), reverse=True)[:3]
        
        resistance = resistance_levels[0] if resistance_levels else current_price * 1.05
        support = support_levels[0] if support_levels else current_price * 0.95
        
        next_resistance = resistance_levels[1] if len(resistance_levels) > 1 else resistance * 1.05
        next_support = support_levels[1] if len(support_levels) > 1 else support * 0.95
        
        return {
            "resistance": resistance,
            "support": support,
            "next_resistance": next_resistance,
            "next_support": next_support,
            "distance_to_resistance": ((resistance - current_price) / current_price) * 100,
            "distance_to_support": ((current_price - support) / current_price) * 100
        }
    
    def calculate_volatility_metrics(self, prices: List[float], volumes: List[float]) -> Dict[str, Any]:
        """Calculate volatility and volume metrics"""
        if len(prices) < 20:
            return {
                "volatility": 0.02,
                "volume_trend": "average",
                "volume_spike": False
            }
        
        returns = np.diff(prices) / prices[:-1]
        volatility = np.std(returns) * np.sqrt(252)  # Annualized volatility
        
        recent_volume = np.mean(volumes[-5:])
        avg_volume = np.mean(volumes[-20:])
        
        volume_ratio = recent_volume / avg_volume if avg_volume > 0 else 1.0
        
        if volume_ratio > 1.5:
            volume_trend = "high"
            volume_spike = True
        elif volume_ratio < 0.7:
            volume_trend = "low"
            volume_spike = False
        else:
            volume_trend = "average"
            volume_spike = False
        
        return {
            "volatility": volatility,
            "volume_trend": volume_trend,
            "volume_spike": volume_spike,
            "volume_ratio": volume_ratio
        }
    
    def generate_trading_signals(self, stock_data: Dict[str, Any], 
                                 sentiment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive trading signals based on technical analysis and sentiment.
        Returns ML-based personalized trading recommendations.
        """
        # Extract price data
        candlesticks = stock_data.get('candlesticks', [])
        if len(candlesticks) < self.min_data_points:
            return self._generate_insufficient_data_signals()
        
        prices = [c['close'] for c in candlesticks]
        highs = [c['high'] for c in candlesticks]
        lows = [c['low'] for c in candlesticks]
        volumes = [c['volume'] for c in candlesticks]
        
        current_price = prices[-1]
        
        # Calculate technical indicators
        rsi = self.calculate_rsi(prices)
        macd_line, signal_line, macd_signal = self.calculate_macd(prices)
        bollinger = self.calculate_bollinger_bands(prices)
        moving_avgs = self.calculate_moving_averages(prices)
        support_resistance = self.calculate_support_resistance(highs, lows, current_price)
        volatility = self.calculate_volatility_metrics(prices, volumes)
        
        # Extract sentiment scores
        news_sentiment = sentiment_data.get('news_sentiment', {})
        stock_sentiment = sentiment_data.get('stock_sentiment', {})
        combined_sentiment = sentiment_data.get('combined_sentiment', {})
        
        sentiment_score = combined_sentiment.get('combined_score', 0)
        sentiment_label = combined_sentiment.get('overall_sentiment', 'neutral')
        
        # Generate personalized recommendations using ML scoring
        recommendations = self._generate_ml_recommendations(
            rsi=rsi,
            macd_signal=macd_signal,
            bollinger=bollinger,
            moving_avgs=moving_avgs,
            support_resistance=support_resistance,
            volatility=volatility,
            sentiment_score=sentiment_score,
            sentiment_label=sentiment_label,
            current_price=current_price
        )
        
        return {
            "technical_indicators": {
                "rsi": round(rsi, 2),
                "macd": {
                    "line": round(macd_line, 4),
                    "signal": round(signal_line, 4),
                    "signal_type": macd_signal
                },
                "bollinger_bands": {
                    "upper": round(bollinger['upper'], 2),
                    "middle": round(bollinger['middle'], 2),
                    "lower": round(bollinger['lower'], 2),
                    "position": bollinger['position']
                },
                "moving_averages": {
                    "sma_20": round(moving_avgs['sma_20'], 2),
                    "sma_50": round(moving_avgs['sma_50'], 2),
                    "trend": moving_avgs['trend']
                },
                "support_resistance": {
                    "resistance": round(support_resistance['resistance'], 2),
                    "support": round(support_resistance['support'], 2)
                }
            },
            "volatility_metrics": volatility,
            "trading_recommendations": recommendations,
            "current_price": round(current_price, 2),
            "analysis_timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _generate_ml_recommendations(self, **indicators) -> List[Dict[str, str]]:
        """Generate ML-based personalized trading recommendations"""
        recommendations = []
        
        rsi = indicators['rsi']
        macd_signal = indicators['macd_signal']
        bollinger = indicators['bollinger']
        moving_avgs = indicators['moving_avgs']
        support_resistance = indicators['support_resistance']
        volatility = indicators['volatility']
        sentiment_score = indicators['sentiment_score']
        sentiment_label = indicators['sentiment_label']
        current_price = indicators['current_price']
        
        # Recommendation 1: Pullback opportunities
        if (bollinger['position'] == 'lower_half' and rsi < 40 and sentiment_label in ['bullish', 'positive']) or \
           (moving_avgs['trend'] in ['uptrend', 'strong_uptrend'] and current_price < moving_avgs['sma_20'] * 0.98):
            recommendations.append({
                "type": "buy_opportunity",
                "icon": "check_circle",
                "message": f"Consider buying opportunities on pullbacks near ${support_resistance['support']:.2f}",
                "confidence": "high" if sentiment_score > 0.2 else "medium"
            })
        
        # Recommendation 2: Breakout monitoring
        dist_to_resistance = support_resistance['distance_to_resistance']
        if dist_to_resistance < 5 and macd_signal == 'bullish' and rsi > 50:
            recommendations.append({
                "type": "breakout_watch",
                "icon": "lightbulb",
                "message": f"Monitor for breakout above resistance level at ${support_resistance['resistance']:.2f}",
                "confidence": "high" if volatility['volume_spike'] else "medium"
            })
        
        # Recommendation 3: Volatility warning
        if volatility['volatility'] > 0.4 or bollinger['bandwidth'] > 0.15:
            recommendations.append({
                "type": "risk_warning",
                "icon": "alert_triangle",
                "message": f"High volatility detected ({volatility['volatility']:.1%}) - use appropriate position sizing",
                "confidence": "high"
            })
        
        # Recommendation 4: Stop-loss management
        if current_price > support_resistance['support'] * 1.02:
            recommended_stop = support_resistance['support'] * 0.98
            recommendations.append({
                "type": "risk_management",
                "icon": "alert_triangle",
                "message": f"Consider stop-loss orders near ${recommended_stop:.2f} to manage risk",
                "confidence": "high"
            })
        
        # Recommendation 5: Trend confirmation
        if moving_avgs['trend'] == 'strong_downtrend' and sentiment_label in ['bearish', 'negative']:
            recommendations.append({
                "type": "defensive",
                "icon": "lightbulb",
                "message": "Downtrend confirmed - consider defensive positions or waiting for reversal signals",
                "confidence": "high"
            })
        
        # Recommendation 6: Overbought/Oversold conditions
        if rsi > 70 and bollinger['position'] == 'overbought':
            recommendations.append({
                "type": "overbought_warning",
                "icon": "alert_triangle",
                "message": f"Overbought conditions detected (RSI: {rsi:.1f}) - potential pullback ahead",
                "confidence": "medium"
            })
        elif rsi < 30 and bollinger['position'] == 'oversold':
            recommendations.append({
                "type": "oversold_opportunity",
                "icon": "check_circle",
                "message": f"Oversold conditions (RSI: {rsi:.1f}) - potential bounce opportunity",
                "confidence": "medium"
            })
        
        # Recommendation 7: Volume analysis
        if volatility['volume_spike'] and macd_signal == 'bullish':
            recommendations.append({
                "type": "volume_confirmation",
                "icon": "check_circle",
                "message": "Strong volume surge confirms bullish momentum - consider adding to positions",
                "confidence": "high"
            })
        
        # Recommendation 8: Sentiment divergence
        if sentiment_score > 0.3 and moving_avgs['trend'] in ['downtrend', 'strong_downtrend']:
            recommendations.append({
                "type": "contrarian",
                "icon": "lightbulb",
                "message": "Positive sentiment despite downtrend - potential reversal setup developing",
                "confidence": "medium"
            })
        
        # Ensure we have at least 3-5 recommendations
        if len(recommendations) < 3:
            # Add generic recommendation
            if sentiment_label == 'bullish':
                recommendations.append({
                    "type": "general",
                    "icon": "lightbulb",
                    "message": "Maintain watchlist position - wait for clear entry signals",
                    "confidence": "medium"
                })
        
        return recommendations
    
    def _generate_insufficient_data_signals(self) -> Dict[str, Any]:
        """Generate placeholder signals when insufficient data"""
        return {
            "technical_indicators": {},
            "volatility_metrics": {},
            "trading_recommendations": [{
                "type": "insufficient_data",
                "icon": "alert_circle",
                "message": "Insufficient data for comprehensive analysis - need more historical data",
                "confidence": "low"
            }],
            "current_price": 0,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat()
        }

