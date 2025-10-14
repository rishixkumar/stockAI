from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="Stock Search API",
    description="Backend API for stock search application",
    version="1.0.0"
)

# Configure CORS to allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Stock Search API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


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

@app.get("/api/stock/{ticker}/candlestick")
async def get_candlestick_data(ticker: str) -> Dict[str, Any]:
    """
    Fetch candlestick data for the specified stock ticker.
    Returns the last 10 candlesticks with 15-minute intervals.
    """
    try:
        return fetch_candlestick_data(ticker, target_count=10, preferred_interval="15m")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data for {ticker}: {str(e)}"
        )


@app.get("/api/stock/{ticker}/candlestick-10m")
async def get_candlestick_10m(ticker: str) -> Dict[str, Any]:
    """
    Fetch 100 candlesticks with 10-minute intervals (uses 15m or 5m as fallback).
    Note: yfinance doesn't support exact 10m intervals, so 15m or 5m will be used.
    """
    try:
        return fetch_candlestick_data(ticker, target_count=100, preferred_interval="15m")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data for {ticker}: {str(e)}"
        )


@app.get("/api/stock/{ticker}/candlestick-30m")
async def get_candlestick_30m(ticker: str) -> Dict[str, Any]:
    """
    Fetch 100 candlesticks with 30-minute intervals.
    """
    try:
        return fetch_candlestick_data(ticker, target_count=100, preferred_interval="30m")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data for {ticker}: {str(e)}"
        )


@app.get("/api/stock/{ticker}/candlestick-1h")
async def get_candlestick_1h(ticker: str) -> Dict[str, Any]:
    """
    Fetch 100 candlesticks with 1-hour intervals.
    """
    try:
        return fetch_candlestick_data(ticker, target_count=100, preferred_interval="1h")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching data for {ticker}: {str(e)}"
        )

