"""
ML-based decision engine for Buy/Sell/Hold recommendations with price targets.
Provides concrete trading decisions backed by technical analysis and sentiment.
"""

import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timezone


class TradingDecisionEngine:
    """
    Machine learning-based decision engine that provides concrete Buy/Sell/Hold
    recommendations with price targets and detailed explanations.
    """
    
    def __init__(self):
        # Scoring weights for different factors
        self.weights = {
            'technical': 0.35,
            'sentiment': 0.25,
            'momentum': 0.20,
            'volatility': 0.10,
            'volume': 0.10
        }
        
        # Decision thresholds
        self.buy_threshold = 0.15
        self.sell_threshold = -0.15
    
    def make_trading_decision(self, 
                             technical_indicators: Dict[str, Any],
                             sentiment_data: Dict[str, Any],
                             stock_data: Dict[str, Any],
                             current_price: float) -> Dict[str, Any]:
        """
        Generate a concrete Buy/Sell/Hold decision with price target and explanation.
        """
        # Calculate individual scores
        technical_score = self._calculate_technical_score(technical_indicators)
        sentiment_score = self._calculate_sentiment_score(sentiment_data)
        momentum_score = self._calculate_momentum_score(stock_data)
        volatility_score = self._calculate_volatility_score(technical_indicators)
        volume_score = self._calculate_volume_score(technical_indicators)
        
        # Calculate weighted overall score
        overall_score = (
            technical_score * self.weights['technical'] +
            sentiment_score * self.weights['sentiment'] +
            momentum_score * self.weights['momentum'] +
            volatility_score * self.weights['volatility'] +
            volume_score * self.weights['volume']
        )
        
        # Make decision based on overall score
        if overall_score >= self.buy_threshold:
            decision = "BUY"
            price_target = self._calculate_buy_target(current_price, technical_indicators, overall_score)
            explanation = self._generate_buy_explanation(
                technical_indicators, sentiment_data, overall_score, 
                technical_score, sentiment_score, momentum_score
            )
        elif overall_score <= self.sell_threshold:
            decision = "SELL"
            price_target = self._calculate_sell_target(current_price, technical_indicators, overall_score)
            explanation = self._generate_sell_explanation(
                technical_indicators, sentiment_data, overall_score,
                technical_score, sentiment_score, momentum_score
            )
        else:
            decision = "HOLD"
            price_target = current_price
            explanation = self._generate_hold_explanation(
                technical_indicators, sentiment_data, overall_score,
                technical_score, sentiment_score
            )
        
        # Calculate confidence level
        confidence = self._calculate_confidence(
            overall_score, 
            [technical_score, sentiment_score, momentum_score]
        )
        
        return {
            "decision": decision,
            "price_target": round(price_target, 2),
            "current_price": round(current_price, 2),
            "confidence": confidence,
            "overall_score": round(overall_score, 4),
            "component_scores": {
                "technical": round(technical_score, 3),
                "sentiment": round(sentiment_score, 3),
                "momentum": round(momentum_score, 3),
                "volatility": round(volatility_score, 3),
                "volume": round(volume_score, 3)
            },
            "explanation": explanation,
            "risk_level": self._assess_risk_level(technical_indicators, overall_score),
            "time_horizon": self._suggest_time_horizon(technical_indicators, decision),
            "decision_timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _calculate_technical_score(self, indicators: Dict[str, Any]) -> float:
        """Calculate score based on technical indicators"""
        score = 0.0
        count = 0
        
        # RSI scoring
        rsi = indicators.get('technical_indicators', {}).get('rsi', 50)
        if rsi < 30:
            score += 0.8  # Oversold - bullish
        elif rsi < 40:
            score += 0.4
        elif rsi > 70:
            score -= 0.8  # Overbought - bearish
        elif rsi > 60:
            score -= 0.4
        count += 1
        
        # MACD scoring
        macd_data = indicators.get('technical_indicators', {}).get('macd', {})
        macd_signal = macd_data.get('signal_type', 'neutral')
        if macd_signal == 'bullish':
            score += 0.6
        elif macd_signal == 'bearish':
            score -= 0.6
        count += 1
        
        # Moving averages scoring
        ma_data = indicators.get('technical_indicators', {}).get('moving_averages', {})
        trend = ma_data.get('trend', 'sideways')
        if trend == 'strong_uptrend':
            score += 0.8
        elif trend == 'uptrend':
            score += 0.4
        elif trend == 'strong_downtrend':
            score -= 0.8
        elif trend == 'downtrend':
            score -= 0.4
        count += 1
        
        # Bollinger Bands scoring
        bb_data = indicators.get('technical_indicators', {}).get('bollinger_bands', {})
        position = bb_data.get('position', 'middle')
        if position == 'oversold':
            score += 0.6
        elif position == 'lower_half':
            score += 0.3
        elif position == 'overbought':
            score -= 0.6
        elif position == 'upper_half':
            score -= 0.3
        count += 1
        
        return score / count if count > 0 else 0.0
    
    def _calculate_sentiment_score(self, sentiment_data: Dict[str, Any]) -> float:
        """Calculate score based on sentiment analysis"""
        combined = sentiment_data.get('combined_sentiment', {})
        news = sentiment_data.get('news_sentiment', {})
        stock = sentiment_data.get('stock_sentiment', {})
        
        # Combined sentiment score
        combined_score = combined.get('combined_score', 0)
        
        # News sentiment
        news_compound = news.get('sentiment_scores', {}).get('compound', 0)
        
        # Stock sentiment
        stock_score = stock.get('sentiment_score', 0)
        
        # Weighted average
        sentiment_score = (combined_score * 0.5) + (news_compound * 0.3) + (stock_score * 0.2)
        
        # Normalize to -1 to 1 range
        return np.clip(sentiment_score, -1, 1)
    
    def _calculate_momentum_score(self, stock_data: Dict[str, Any]) -> float:
        """Calculate score based on price momentum"""
        price_stats = stock_data.get('price_statistics', {})
        trend_data = stock_data.get('trend_analysis', {})
        
        # Recent price changes
        change_24h = trend_data.get('price_change_24h', 0) / 100
        change_7d = trend_data.get('price_change_7d', 0) / 100
        
        # Trend direction
        trend = trend_data.get('recent_trend', 'neutral')
        trend_score = 0.5 if trend == 'bullish' else -0.5 if trend == 'bearish' else 0
        
        # Combine momentum indicators
        momentum = (change_24h * 0.4) + (change_7d * 0.3) + (trend_score * 0.3)
        
        return np.clip(momentum, -1, 1)
    
    def _calculate_volatility_score(self, indicators: Dict[str, Any]) -> float:
        """Calculate score based on volatility (lower is better)"""
        volatility_metrics = indicators.get('volatility_metrics', {})
        volatility = volatility_metrics.get('volatility', 0.3)
        
        # Lower volatility gets higher score
        if volatility < 0.2:
            return 0.5
        elif volatility < 0.4:
            return 0.0
        elif volatility < 0.6:
            return -0.3
        else:
            return -0.6
    
    def _calculate_volume_score(self, indicators: Dict[str, Any]) -> float:
        """Calculate score based on volume trends"""
        volatility_metrics = indicators.get('volatility_metrics', {})
        volume_trend = volatility_metrics.get('volume_trend', 'average')
        volume_spike = volatility_metrics.get('volume_spike', False)
        
        if volume_spike and volume_trend == 'high':
            return 0.7
        elif volume_trend == 'high':
            return 0.4
        elif volume_trend == 'low':
            return -0.3
        else:
            return 0.0
    
    def _calculate_buy_target(self, current_price: float, 
                             indicators: Dict[str, Any], 
                             score: float) -> float:
        """Calculate price target for buy decision"""
        # Get resistance levels
        sr_data = indicators.get('technical_indicators', {}).get('support_resistance', {})
        resistance = sr_data.get('resistance', current_price * 1.05)
        
        # Calculate target based on score strength
        if score > 0.3:  # Strong buy
            target = resistance * 1.02  # Aim slightly above resistance
        else:  # Moderate buy
            target = (current_price + resistance) / 2  # Aim midway
        
        return max(target, current_price * 1.03)  # At least 3% upside
    
    def _calculate_sell_target(self, current_price: float,
                               indicators: Dict[str, Any],
                               score: float) -> float:
        """Calculate price target for sell decision"""
        # Get support levels
        sr_data = indicators.get('technical_indicators', {}).get('support_resistance', {})
        support = sr_data.get('support', current_price * 0.95)
        
        # Calculate target based on score strength
        if score < -0.3:  # Strong sell
            target = support * 0.98  # Aim slightly below support
        else:  # Moderate sell
            target = (current_price + support) / 2  # Aim midway
        
        return min(target, current_price * 0.97)  # At least 3% downside protection
    
    def _generate_buy_explanation(self, technical_indicators: Dict[str, Any],
                                   sentiment_data: Dict[str, Any],
                                   overall_score: float,
                                   technical_score: float,
                                   sentiment_score: float,
                                   momentum_score: float) -> str:
        """Generate detailed explanation for buy decision"""
        reasons = []
        
        # Technical reasons
        if technical_score > 0.3:
            rsi = technical_indicators.get('technical_indicators', {}).get('rsi', 50)
            if rsi < 40:
                reasons.append(f"RSI at {rsi:.1f} indicates oversold conditions")
            
            macd = technical_indicators.get('technical_indicators', {}).get('macd', {})
            if macd.get('signal_type') == 'bullish':
                reasons.append("MACD shows bullish crossover signal")
            
            ma_data = technical_indicators.get('technical_indicators', {}).get('moving_averages', {})
            if ma_data.get('trend') in ['uptrend', 'strong_uptrend']:
                reasons.append(f"Strong uptrend confirmed by moving averages")
        
        # Sentiment reasons
        if sentiment_score > 0.2:
            combined = sentiment_data.get('combined_sentiment', {})
            sentiment_label = combined.get('overall_sentiment', 'positive')
            reasons.append(f"Market sentiment is {sentiment_label} with {abs(sentiment_score)*100:.0f}% confidence")
        
        # Momentum reasons
        if momentum_score > 0.2:
            reasons.append("Positive price momentum across multiple timeframes")
        
        # Volume confirmation
        volume_metrics = technical_indicators.get('volatility_metrics', {})
        if volume_metrics.get('volume_spike'):
            reasons.append("Strong volume surge confirms buying interest")
        
        # Construct explanation
        if len(reasons) > 0:
            explanation = "Buy signal generated based on: " + "; ".join(reasons[:3])
        else:
            explanation = f"Buy signal with overall bullish score of {overall_score:.2f}"
        
        explanation += f". Technical analysis ({technical_score:.2f}), market sentiment ({sentiment_score:.2f}), and momentum indicators ({momentum_score:.2f}) all support this decision."
        
        return explanation
    
    def _generate_sell_explanation(self, technical_indicators: Dict[str, Any],
                                    sentiment_data: Dict[str, Any],
                                    overall_score: float,
                                    technical_score: float,
                                    sentiment_score: float,
                                    momentum_score: float) -> str:
        """Generate detailed explanation for sell decision"""
        reasons = []
        
        # Technical reasons
        if technical_score < -0.3:
            rsi = technical_indicators.get('technical_indicators', {}).get('rsi', 50)
            if rsi > 60:
                reasons.append(f"RSI at {rsi:.1f} indicates overbought conditions")
            
            macd = technical_indicators.get('technical_indicators', {}).get('macd', {})
            if macd.get('signal_type') == 'bearish':
                reasons.append("MACD shows bearish crossover signal")
            
            ma_data = technical_indicators.get('technical_indicators', {}).get('moving_averages', {})
            if ma_data.get('trend') in ['downtrend', 'strong_downtrend']:
                reasons.append("Downtrend confirmed by moving averages")
        
        # Sentiment reasons
        if sentiment_score < -0.2:
            combined = sentiment_data.get('combined_sentiment', {})
            sentiment_label = combined.get('overall_sentiment', 'negative')
            reasons.append(f"Market sentiment is {sentiment_label} with negative outlook")
        
        # Momentum reasons
        if momentum_score < -0.2:
            reasons.append("Negative price momentum across multiple timeframes")
        
        # Construct explanation
        if len(reasons) > 0:
            explanation = "Sell signal generated based on: " + "; ".join(reasons[:3])
        else:
            explanation = f"Sell signal with overall bearish score of {overall_score:.2f}"
        
        explanation += f". Technical analysis ({technical_score:.2f}), market sentiment ({sentiment_score:.2f}), and momentum indicators ({momentum_score:.2f}) suggest taking profits or reducing exposure."
        
        return explanation
    
    def _generate_hold_explanation(self, technical_indicators: Dict[str, Any],
                                    sentiment_data: Dict[str, Any],
                                    overall_score: float,
                                    technical_score: float,
                                    sentiment_score: float) -> str:
        """Generate detailed explanation for hold decision"""
        reasons = []
        
        # Mixed signals
        if abs(technical_score) < 0.2 and abs(sentiment_score) < 0.2:
            reasons.append("Technical indicators and sentiment analysis show neutral signals")
        elif technical_score * sentiment_score < 0:
            reasons.append("Conflicting signals between technical analysis and market sentiment")
        
        # Sideways market
        ma_data = technical_indicators.get('technical_indicators', {}).get('moving_averages', {})
        if ma_data.get('trend') == 'sideways':
            reasons.append("Market is trading sideways without clear direction")
        
        # Moderate volatility
        volatility_metrics = technical_indicators.get('volatility_metrics', {})
        if 0.2 <= volatility_metrics.get('volatility', 0) <= 0.4:
            reasons.append("Moderate volatility suggests waiting for clearer entry points")
        
        # Construct explanation
        if len(reasons) > 0:
            explanation = "Hold recommendation based on: " + "; ".join(reasons[:2])
        else:
            explanation = f"Hold position with neutral score of {overall_score:.2f}"
        
        explanation += f". Monitor for stronger signals before making changes. Current technical score: {technical_score:.2f}, sentiment score: {sentiment_score:.2f}."
        
        return explanation
    
    def _calculate_confidence(self, overall_score: float, 
                             component_scores: List[float]) -> str:
        """Calculate confidence level in the decision"""
        # Check agreement among components
        score_agreement = sum(1 for s in component_scores if s * overall_score > 0)
        agreement_ratio = score_agreement / len(component_scores)
        
        # Determine confidence
        if abs(overall_score) > 0.4 and agreement_ratio > 0.75:
            return "very_high"
        elif abs(overall_score) > 0.25 and agreement_ratio > 0.65:
            return "high"
        elif abs(overall_score) > 0.15 and agreement_ratio > 0.5:
            return "medium"
        else:
            return "low"
    
    def _assess_risk_level(self, indicators: Dict[str, Any], score: float) -> str:
        """Assess risk level of the trading decision"""
        volatility = indicators.get('volatility_metrics', {}).get('volatility', 0.3)
        
        if volatility > 0.6:
            return "high"
        elif volatility > 0.4:
            return "medium"
        elif abs(score) < 0.1:
            return "low"  # Neutral position
        else:
            return "medium"
    
    def _suggest_time_horizon(self, indicators: Dict[str, Any], decision: str) -> str:
        """Suggest appropriate time horizon for the trade"""
        volatility = indicators.get('volatility_metrics', {}).get('volatility', 0.3)
        ma_data = indicators.get('technical_indicators', {}).get('moving_averages', {})
        trend = ma_data.get('trend', 'sideways')
        
        if decision == "HOLD":
            return "N/A"
        elif volatility > 0.5:
            return "short_term (1-7 days)"
        elif trend in ['strong_uptrend', 'strong_downtrend']:
            return "medium_term (1-4 weeks)"
        else:
            return "short_to_medium_term (3-14 days)"

