"""
Stock data analysis and sentiment analysis using VADER.
"""

import yfinance as yf
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional
import statistics
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import re


class StockAnalyzer:
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
    
    def aggregate_candlestick_data(self, ticker: str) -> Dict[str, Any]:
        """
        Aggregate all available candlestick data (300+ pieces) and calculate comprehensive statistics.
        """
        stock = yf.Ticker(ticker.upper())
        
        # Get company info
        try:
            info = stock.info
            company_name = info.get("longName", info.get("shortName", ticker.upper()))
        except:
            company_name = ticker.upper()
        
        # Fetch comprehensive data across multiple timeframes
        all_data = []
        
        # Strategy: Get data from multiple periods and intervals
        data_sources = [
            ("1d", "5m"),    # Intraday 5-minute data
            ("5d", "15m"),   # 5-day 15-minute data
            ("1mo", "1h"),   # 1-month hourly data
            ("3mo", "1d"),   # 3-month daily data
        ]
        
        for period, interval in data_sources:
            try:
                df = stock.history(period=period, interval=interval)
                if not df.empty:
                    for index, row in df.iterrows():
                        all_data.append({
                            "timestamp": index.isoformat(),
                            "open": float(row['Open']),
                            "high": float(row['High']),
                            "low": float(row['Low']),
                            "close": float(row['Close']),
                            "volume": int(row['Volume']),
                            "interval": interval,
                            "period": period
                        })
            except Exception as e:
                continue
        
        if not all_data:
            raise ValueError(f"No data found for ticker {ticker}")
        
        # Sort by timestamp (most recent first)
        all_data.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Calculate comprehensive statistics
        closes = [d['close'] for d in all_data]
        volumes = [d['volume'] for d in all_data]
        highs = [d['high'] for d in all_data]
        lows = [d['low'] for d in all_data]
        
        # Price statistics
        current_price = closes[0] if closes else 0
        price_changes = [closes[i] - closes[i+1] for i in range(len(closes)-1)]
        price_changes_pct = [(closes[i] - closes[i+1]) / closes[i+1] * 100 for i in range(len(closes)-1)]
        
        # Volume statistics
        avg_volume = statistics.mean(volumes) if volumes else 0
        max_volume = max(volumes) if volumes else 0
        min_volume = min(volumes) if volumes else 0
        
        # Volatility calculations
        volatility = statistics.stdev(price_changes_pct) if len(price_changes_pct) > 1 else 0
        
        # Trend analysis
        recent_trend = "bullish" if price_changes_pct[:10] and statistics.mean(price_changes_pct[:10]) > 0 else "bearish"
        
        # Support and resistance levels
        resistance_levels = sorted(set(highs), reverse=True)[:5]  # Top 5 resistance levels
        support_levels = sorted(set(lows))[:5]  # Top 5 support levels
        
        return {
            "ticker": ticker.upper(),
            "company_name": company_name,
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "data_points": len(all_data),
            "current_price": round(current_price, 2),
            "price_statistics": {
                "highest": round(max(closes), 2),
                "lowest": round(min(closes), 2),
                "average": round(statistics.mean(closes), 2),
                "median": round(statistics.median(closes), 2),
                "volatility": round(volatility, 4)
            },
            "volume_statistics": {
                "average": int(avg_volume),
                "maximum": max_volume,
                "minimum": min_volume,
                "current": volumes[0] if volumes else 0
            },
            "trend_analysis": {
                "recent_trend": recent_trend,
                "price_change_24h": round(price_changes_pct[0], 2) if price_changes_pct else 0,
                "price_change_7d": round(statistics.mean(price_changes_pct[:7]), 2) if len(price_changes_pct) >= 7 else 0,
                "price_change_30d": round(statistics.mean(price_changes_pct[:30]), 2) if len(price_changes_pct) >= 30 else 0
            },
            "technical_levels": {
                "resistance_levels": [round(level, 2) for level in resistance_levels],
                "support_levels": [round(level, 2) for level in support_levels]
            },
            "data_sources": {
                "periods_analyzed": [period for period, _ in data_sources],
                "intervals_analyzed": list(set([interval for _, interval in data_sources]))
            }
        }
    
    def analyze_news_sentiment(self, news_articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Perform VADER sentiment analysis on news articles.
        """
        if not news_articles:
            return {
                "overall_sentiment": "neutral",
                "sentiment_scores": {"compound": 0.0, "positive": 0.0, "neutral": 0.0, "negative": 0.0},
                "article_sentiments": [],
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "confidence": 0.0
            }
        
        article_sentiments = []
        compound_scores = []
        
        for article in news_articles:
            # Combine title and summary for analysis
            text = f"{article.get('title', '')} {article.get('summary', '')}"
            
            # Clean text
            text = re.sub(r'[^\w\s]', ' ', text)
            text = ' '.join(text.split())
            
            # Get sentiment scores
            scores = self.sentiment_analyzer.polarity_scores(text)
            
            # Determine sentiment label
            if scores['compound'] >= 0.05:
                sentiment_label = "positive"
            elif scores['compound'] <= -0.05:
                sentiment_label = "negative"
            else:
                sentiment_label = "neutral"
            
            article_sentiments.append({
                "article_id": article.get('id'),
                "title": article.get('title', ''),
                "source": article.get('source', ''),
                "sentiment": sentiment_label,
                "scores": {
                    "compound": round(scores['compound'], 4),
                    "positive": round(scores['pos'], 4),
                    "neutral": round(scores['neu'], 4),
                    "negative": round(scores['neg'], 4)
                }
            })
            
            compound_scores.append(scores['compound'])
        
        # Calculate overall sentiment
        avg_compound = statistics.mean(compound_scores) if compound_scores else 0
        
        if avg_compound >= 0.05:
            overall_sentiment = "positive"
        elif avg_compound <= -0.05:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        # Count sentiment distribution
        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        for sentiment in article_sentiments:
            sentiment_counts[sentiment["sentiment"]] += 1
        
        # Calculate confidence (how far from neutral)
        confidence = abs(avg_compound)
        
        return {
            "overall_sentiment": overall_sentiment,
            "sentiment_scores": {
                "compound": round(avg_compound, 4),
                "positive": round(statistics.mean([s["scores"]["positive"] for s in article_sentiments]), 4),
                "neutral": round(statistics.mean([s["scores"]["neutral"] for s in article_sentiments]), 4),
                "negative": round(statistics.mean([s["scores"]["negative"] for s in article_sentiments]), 4)
            },
            "article_sentiments": article_sentiments,
            "sentiment_distribution": sentiment_counts,
            "confidence": round(confidence, 4),
            "articles_analyzed": len(news_articles)
        }
    
    def analyze_stock_sentiment(self, ticker: str) -> Dict[str, Any]:
        """
        Analyze stock sentiment by examining price movements and patterns.
        """
        stock = yf.Ticker(ticker.upper())
        
        # Get recent price data
        df = stock.history(period="5d", interval="1h")
        if df.empty:
            return {"error": "No price data available for sentiment analysis"}
        
        # Calculate price momentum indicators
        closes = df['Close'].tolist()
        volumes = df['Volume'].tolist()
        
        # Price momentum
        price_changes = [closes[i] - closes[i-1] for i in range(1, len(closes))]
        price_changes_pct = [(closes[i] - closes[i-1]) / closes[i-1] * 100 for i in range(1, len(closes))]
        
        # Volume momentum
        volume_changes = [volumes[i] - volumes[i-1] for i in range(1, len(volumes))]
        
        # Calculate sentiment indicators
        positive_moves = sum(1 for change in price_changes if change > 0)
        negative_moves = sum(1 for change in price_changes if change < 0)
        total_moves = len(price_changes)
        
        # Volume sentiment (higher volume on up moves = bullish)
        volume_sentiment = 0
        for i, change in enumerate(price_changes):
            if i < len(volume_changes):
                if change > 0 and volume_changes[i] > 0:
                    volume_sentiment += 1
                elif change < 0 and volume_changes[i] < 0:
                    volume_sentiment -= 1
        
        # Overall sentiment calculation
        price_sentiment = (positive_moves - negative_moves) / total_moves if total_moves > 0 else 0
        volume_sentiment_normalized = volume_sentiment / total_moves if total_moves > 0 else 0
        
        # Combine indicators
        overall_sentiment_score = (price_sentiment * 0.7) + (volume_sentiment_normalized * 0.3)
        
        # Determine sentiment label
        if overall_sentiment_score >= 0.1:
            sentiment_label = "bullish"
        elif overall_sentiment_score <= -0.1:
            sentiment_label = "bearish"
        else:
            sentiment_label = "neutral"
        
        return {
            "sentiment": sentiment_label,
            "sentiment_score": round(overall_sentiment_score, 4),
            "indicators": {
                "price_momentum": round(price_sentiment, 4),
                "volume_momentum": round(volume_sentiment_normalized, 4),
                "positive_moves": positive_moves,
                "negative_moves": negative_moves,
                "total_moves": total_moves
            },
            "recent_performance": {
                "avg_price_change": round(statistics.mean(price_changes_pct), 4),
                "volatility": round(statistics.stdev(price_changes_pct), 4) if len(price_changes_pct) > 1 else 0
            }
        }
    
    def comprehensive_analysis(self, ticker: str, news_articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Perform comprehensive analysis combining stock data aggregation and sentiment analysis.
        """
        try:
            # Aggregate stock data
            stock_analysis = self.aggregate_candlestick_data(ticker)
            
            # Analyze news sentiment
            news_sentiment = self.analyze_news_sentiment(news_articles)
            
            # Analyze stock sentiment
            stock_sentiment = self.analyze_stock_sentiment(ticker)
            
            # Combine insights
            combined_sentiment = self._combine_sentiments(news_sentiment, stock_sentiment)
            
            return {
                "ticker": ticker.upper(),
                "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
                "stock_analysis": stock_analysis,
                "news_sentiment": news_sentiment,
                "stock_sentiment": stock_sentiment,
                "combined_sentiment": combined_sentiment,
                "recommendations": self._generate_recommendations(stock_analysis, combined_sentiment)
            }
            
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "ticker": ticker.upper(),
                "analysis_timestamp": datetime.now(timezone.utc).isoformat()
            }
    
    def _combine_sentiments(self, news_sentiment: Dict[str, Any], stock_sentiment: Dict[str, Any]) -> Dict[str, Any]:
        """Combine news and stock sentiment into overall assessment."""
        news_compound = news_sentiment.get("sentiment_scores", {}).get("compound", 0)
        stock_score = stock_sentiment.get("sentiment_score", 0)
        
        # Weighted combination (news 60%, stock 40%)
        combined_score = (news_compound * 0.6) + (stock_score * 0.4)
        
        if combined_score >= 0.1:
            overall_sentiment = "bullish"
        elif combined_score <= -0.1:
            overall_sentiment = "bearish"
        else:
            overall_sentiment = "neutral"
        
        return {
            "overall_sentiment": overall_sentiment,
            "combined_score": round(combined_score, 4),
            "news_weight": 0.6,
            "stock_weight": 0.4,
            "news_contribution": round(news_compound * 0.6, 4),
            "stock_contribution": round(stock_score * 0.4, 4)
        }
    
    def _generate_recommendations(self, stock_analysis: Dict[str, Any], combined_sentiment: Dict[str, Any]) -> List[str]:
        """Generate trading recommendations based on analysis."""
        recommendations = []
        
        sentiment = combined_sentiment.get("overall_sentiment", "neutral")
        volatility = stock_analysis.get("price_statistics", {}).get("volatility", 0)
        trend = stock_analysis.get("trend_analysis", {}).get("recent_trend", "neutral")
        
        # Sentiment-based recommendations
        if sentiment == "bullish":
            recommendations.append("Consider buying opportunities on pullbacks")
            recommendations.append("Monitor for breakout above resistance levels")
        elif sentiment == "bearish":
            recommendations.append("Consider selling or shorting opportunities")
            recommendations.append("Watch for breakdown below support levels")
        else:
            recommendations.append("Market sentiment is neutral - wait for clearer signals")
        
        # Volatility-based recommendations
        if volatility > 0.05:
            recommendations.append("High volatility detected - use appropriate position sizing")
            recommendations.append("Consider stop-loss orders to manage risk")
        elif volatility < 0.02:
            recommendations.append("Low volatility environment - may indicate consolidation")
        
        # Trend-based recommendations
        if trend == "bullish":
            recommendations.append("Uptrend confirmed - look for buying opportunities")
        elif trend == "bearish":
            recommendations.append("Downtrend confirmed - consider defensive positions")
        
        return recommendations
