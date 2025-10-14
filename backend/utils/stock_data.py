"""
Utility functions for fetching and processing stock data.
"""

import yfinance as yf
from fastapi import HTTPException
from typing import List, Dict, Any


def fetch_candlestick_data(
    ticker: str, 
    target_count: int = 10, 
    preferred_interval: str = "15m"
) -> Dict[str, Any]:
    """
    Helper function to fetch candlestick data with fallback strategies.
    
    Args:
        ticker: Stock symbol
        target_count: Number of candlesticks to return
        preferred_interval: Preferred interval (e.g., "5m", "15m", "30m", "1h", "1d")
    
    Returns:
        Dictionary with candlestick data
    """
    stock = yf.Ticker(ticker.upper())
    
    # Try to get basic info first to validate ticker
    try:
        info = stock.info
        company_name = info.get("longName", info.get("shortName", ticker.upper()))
    except:
        company_name = ticker.upper()
    
    df = None
    interval_used = preferred_interval
    
    # Define fallback strategies based on preferred interval
    if preferred_interval in ["5m", "10m", "15m"]:
        # For short intervals, try different periods to get enough data
        strategies = [
            ("7d", "15m"),
            ("7d", "5m"),
            ("5d", "15m"),
            ("5d", "5m"),
            ("1d", "5m"),
            ("5d", "30m"),
            ("1mo", "1h"),
        ]
    elif preferred_interval == "30m":
        strategies = [
            ("1mo", "30m"),
            ("1mo", "1h"),
            ("2mo", "1h"),
            ("3mo", "1d"),
        ]
    elif preferred_interval == "1h":
        strategies = [
            ("2mo", "1h"),
            ("3mo", "1h"),
            ("6mo", "1d"),
        ]
    else:
        # Daily or other intervals
        strategies = [
            ("1y", "1d"),
            ("6mo", "1d"),
            ("3mo", "1d"),
        ]
    
    # Try each strategy until we get enough data
    for period, interval in strategies:
        try:
            df = stock.history(period=period, interval=interval)
            if not df.empty and len(df) >= min(target_count, 5):
                interval_used = interval
                break
        except:
            continue
    
    if df is None or df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for ticker '{ticker}'. Please verify the stock symbol is correct."
        )
    
    # Get the requested number of candlesticks (or all if less available)
    df = df.tail(target_count)
    
    # Convert to list of dictionaries
    candlesticks: List[Dict[str, Any]] = []
    for index, row in df.iterrows():
        candlesticks.append({
            "timestamp": index.isoformat(),
            "open": round(float(row['Open']), 2),
            "high": round(float(row['High']), 2),
            "low": round(float(row['Low']), 2),
            "close": round(float(row['Close']), 2),
            "volume": int(row['Volume'])
        })
    
    return {
        "ticker": ticker.upper(),
        "company_name": company_name,
        "interval": interval_used,
        "candlesticks": candlesticks,
        "count": len(candlesticks),
        "requested_count": target_count
    }

