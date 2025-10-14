from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Any

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

@app.get("/api/stock/{ticker}/candlestick")
async def get_candlestick_data(ticker: str) -> Dict[str, Any]:
    """
    Fetch candlestick data for the specified stock ticker.
    Returns the last 10 candlesticks with 15-minute intervals.
    """
    try:
        # Create a Ticker object
        stock = yf.Ticker(ticker.upper())
        
        # Try to get basic info first to validate ticker
        try:
            info = stock.info
            company_name = info.get("longName", info.get("shortName", ticker.upper()))
        except:
            company_name = ticker.upper()
        
        # Fetch intraday data with different strategies
        df = None
        interval_used = "15m"
        
        # Try 1: Get intraday data for current day
        try:
            df = stock.history(period="1d", interval="15m")
            if not df.empty and len(df) >= 5:
                interval_used = "15m"
        except:
            pass
        
        # Try 2: If that fails or insufficient data, try 5-minute intervals
        if df is None or df.empty or len(df) < 5:
            try:
                df = stock.history(period="1d", interval="5m")
                if not df.empty and len(df) >= 5:
                    interval_used = "5m"
            except:
                pass
        
        # Try 3: If still no data, try hourly data over 5 days
        if df is None or df.empty or len(df) < 5:
            try:
                df = stock.history(period="5d", interval="1h")
                if not df.empty:
                    interval_used = "1h"
            except:
                pass
        
        # Try 4: Last resort - daily data
        if df is None or df.empty:
            try:
                df = stock.history(period="1mo", interval="1d")
                if not df.empty:
                    interval_used = "1d"
            except:
                pass
        
        if df is None or df.empty:
            raise HTTPException(
                status_code=404, 
                detail=f"No data found for ticker '{ticker}'. Please verify the stock symbol is correct."
            )
        
        # Get the last 10 candlesticks
        df = df.tail(10)
        
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
            "count": len(candlesticks)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching data for {ticker}: {str(e)}"
        )

