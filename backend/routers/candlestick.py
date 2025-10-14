"""
Candlestick data endpoints for stock market data retrieval.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from utils.stock_data import fetch_candlestick_data

router = APIRouter(
    prefix="/api/stock",
    tags=["candlestick"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{ticker}/candlestick")
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


@router.get("/{ticker}/candlestick-10m")
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


@router.get("/{ticker}/candlestick-30m")
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


@router.get("/{ticker}/candlestick-1h")
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

