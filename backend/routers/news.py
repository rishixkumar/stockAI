"""
News endpoints for stock-related news articles.
"""

from fastapi import APIRouter, HTTPException
import yfinance as yf
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

router = APIRouter(
    prefix="/api/stock",
    tags=["news"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{ticker}/news")
async def get_stock_news(ticker: str) -> Dict[str, Any]:
    """
    Fetch the latest 10 news articles for the specified stock ticker from the past 48 hours.
    Returns news articles with title, summary, publication date, source, thumbnail, and article URL.
    """
    try:
        # Create a Ticker object
        stock = yf.Ticker(ticker.upper())
        
        # Get company name
        try:
            info = stock.info
            company_name = info.get("longName", info.get("shortName", ticker.upper()))
        except:
            company_name = ticker.upper()
        
        # Fetch news
        all_news = stock.news
        
        if not all_news:
            raise HTTPException(
                status_code=404,
                detail=f"No news found for ticker '{ticker}'. Please verify the stock symbol is correct."
            )
        
        # Calculate cutoff time (48 hours ago)
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=48)
        
        # Process and filter news articles
        news_articles: List[Dict[str, Any]] = []
        for article in all_news:
            try:
                content = article.get('content', {})
                
                # Parse publication date
                pub_date_str = content.get('pubDate', content.get('displayTime', ''))
                if pub_date_str:
                    # Parse ISO format datetime
                    pub_date = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
                    
                    # Skip articles older than 48 hours
                    if pub_date < cutoff_time:
                        continue
                else:
                    # If no date, skip
                    continue
                
                # Extract thumbnail URL
                thumbnail_url = None
                thumbnail = content.get('thumbnail', {})
                if thumbnail and 'originalUrl' in thumbnail:
                    thumbnail_url = thumbnail['originalUrl']
                elif thumbnail and 'resolutions' in thumbnail and len(thumbnail['resolutions']) > 0:
                    thumbnail_url = thumbnail['resolutions'][0].get('url')
                
                # Extract provider information
                provider = content.get('provider', {})
                provider_name = provider.get('displayName', 'Unknown')
                
                # Extract article URL
                canonical_url = content.get('canonicalUrl', {})
                article_url = canonical_url.get('url', content.get('clickThroughUrl', {}).get('url', ''))
                
                news_articles.append({
                    "id": article.get('id', content.get('id')),
                    "title": content.get('title', 'No title'),
                    "summary": content.get('summary', ''),
                    "published_at": pub_date_str,
                    "published_timestamp": int(pub_date.timestamp()),
                    "source": provider_name,
                    "thumbnail_url": thumbnail_url,
                    "article_url": article_url,
                })
                
                # Stop after collecting 10 articles
                if len(news_articles) >= 10:
                    break
                    
            except Exception as e:
                # Skip articles that fail to parse
                continue
        
        if not news_articles:
            raise HTTPException(
                status_code=404,
                detail=f"No recent news found for ticker '{ticker}' in the past 48 hours."
            )
        
        return {
            "ticker": ticker.upper(),
            "company_name": company_name,
            "news": news_articles,
            "count": len(news_articles),
            "time_range": "48 hours"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching news for {ticker}: {str(e)}"
        )

