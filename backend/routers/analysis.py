"""
Analysis endpoints for comprehensive stock analysis and sentiment analysis.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from analysis.stock_analyzer import StockAnalyzer
import yfinance as yf
from datetime import datetime, timedelta, timezone

router = APIRouter(
    prefix="/api/stock",
    tags=["analysis"],
    responses={404: {"description": "Not found"}},
)

analyzer = StockAnalyzer()


@router.get("/{ticker}/analysis")
async def get_comprehensive_analysis(ticker: str) -> Dict[str, Any]:
    """
    Perform comprehensive analysis including:
    - Aggregated candlestick data (300+ data points)
    - VADER sentiment analysis on news articles
    - Stock price sentiment analysis
    - Combined sentiment assessment
    - Trading recommendations
    """
    try:
        # Get news articles for sentiment analysis
        stock = yf.Ticker(ticker.upper())
        all_news = stock.news
        
        # Filter news from past 48 hours
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
        recent_news = []
        
        for article in all_news:
            try:
                content = article.get('content', {})
                pub_date_str = content.get('pubDate', content.get('displayTime', ''))
                
                if pub_date_str:
                    pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                    if pub_date >= cutoff_time:
                        recent_news.append({
                            "id": article.get('id', content.get('id')),
                            "title": content.get('title', 'No title'),
                            "summary": content.get('summary', ''),
                            "source": content.get('provider', {}).get('displayName', 'Unknown'),
                            "published_at": pub_date_str,
                        })
                        
                        if len(recent_news) >= 10:  # Limit to 10 articles
                            break
            except:
                continue
        
        # Perform comprehensive analysis
        analysis_result = analyzer.comprehensive_analysis(ticker, recent_news)
        
        return analysis_result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed for {ticker}: {str(e)}"
        )


@router.get("/{ticker}/sentiment")
async def get_sentiment_analysis(ticker: str) -> Dict[str, Any]:
    """
    Get sentiment analysis for news articles and stock price movements.
    """
    try:
        # Get news articles
        stock = yf.Ticker(ticker.upper())
        all_news = stock.news
        
        # Filter recent news
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
        recent_news = []
        
        for article in all_news:
            try:
                content = article.get('content', {})
                pub_date_str = content.get('pubDate', content.get('displayTime', ''))
                
                if pub_date_str:
                    pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                    if pub_date >= cutoff_time:
                        recent_news.append({
                            "id": article.get('id', content.get('id')),
                            "title": content.get('title', 'No title'),
                            "summary": content.get('summary', ''),
                            "source": content.get('provider', {}).get('displayName', 'Unknown'),
                        })
                        
                        if len(recent_news) >= 10:
                            break
            except:
                continue
        
        # Analyze news sentiment
        news_sentiment = analyzer.analyze_news_sentiment(recent_news)
        
        # Analyze stock sentiment
        stock_sentiment = analyzer.analyze_stock_sentiment(ticker)
        
        # Combine sentiments
        combined_sentiment = analyzer._combine_sentiments(news_sentiment, stock_sentiment)
        
        return {
            "ticker": ticker.upper(),
            "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "news_sentiment": news_sentiment,
            "stock_sentiment": stock_sentiment,
            "combined_sentiment": combined_sentiment
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sentiment analysis failed for {ticker}: {str(e)}"
        )


@router.get("/{ticker}/aggregated-data")
async def get_aggregated_stock_data(ticker: str) -> Dict[str, Any]:
    """
    Get aggregated candlestick data with comprehensive statistics (300+ data points).
    """
    try:
        aggregated_data = analyzer.aggregate_candlestick_data(ticker)
        return aggregated_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Data aggregation failed for {ticker}: {str(e)}"
        )
