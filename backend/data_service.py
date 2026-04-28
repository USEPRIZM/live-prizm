"""
Prizm Data Service
On-demand stock data fetching via yfinance with SQLite caching.
Handles rate limiting, cache staleness, and data normalization.
"""
from __future__ import annotations

import yfinance as yf
import asyncio
import random
import pandas as pd
from datetime import datetime, timedelta
from pytrends.request import TrendReq
from backend.database import get_cached_history, cache_stock_data, get_cache_freshness

# Rate limiting: track last fetch time
_last_fetch_time = 0
_FETCH_DELAY = 1.0  # seconds between yfinance calls

# Period mapping for frontend range selector
RANGE_TO_PERIOD = {
    "1m": ("1mo", 30),
    "3m": ("3mo", 90),
    "6m": ("6mo", 180),
    "1y": ("1y", 365),
    "5y": ("5y", 1825),
}


async def _rate_limit():
    """Enforce minimum delay between yfinance API calls."""
    global _last_fetch_time
    now = asyncio.get_event_loop().time()
    elapsed = now - _last_fetch_time
    if elapsed < _FETCH_DELAY:
        await asyncio.sleep(_FETCH_DELAY - elapsed)
    _last_fetch_time = asyncio.get_event_loop().time()


def _fetch_from_yfinance(symbol: str, period: str) -> list[dict]:
    """
    Synchronous yfinance fetch. Called in a thread executor 
    to avoid blocking the async event loop.
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)

        if df.empty:
            return []

        data = []
        for index, row in df.iterrows():
            data.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })
        return data

    except Exception as e:
        print(f"❌ yfinance error for {symbol}: {e}")
        return []


async def fetch_stock_history(symbol: str, range_key: str = "1y") -> dict:
    """
    Fetch OHLC+Volume data for a stock. 
    Checks cache first, fetches from yfinance if stale/missing.
    
    Returns:
        {
            "symbol": "RELIANCE.NS",
            "range": "1y",
            "data": [...],
            "source": "cache" | "yfinance",
            "count": 245
        }
    """
    period_info = RANGE_TO_PERIOD.get(range_key, ("1y", 365))
    yf_period = period_info[0]
    days_back = period_info[1]

    # Calculate the start date for this range
    start_date = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")

    # Check cache freshness
    latest_cached = await get_cache_freshness(symbol)
    today = datetime.now().strftime("%Y-%m-%d")

    # Use cache if data exists and is fresh (fetched today)
    if latest_cached and latest_cached >= (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"):
        cached_data = await get_cached_history(symbol, start_date)
        if cached_data:
            enriched = await get_alt_data(symbol, cached_data)
            return {
                "symbol": symbol,
                "range": range_key,
                "data": enriched,
                "source": "cache",
                "count": len(enriched),
            }

    # Rate limit before fetching
    await _rate_limit()

    # Fetch from yfinance in a thread (it's synchronous/blocking)
    loop = asyncio.get_event_loop()
    # Always fetch max range (5y) to populate cache broadly
    fresh_data = await loop.run_in_executor(None, _fetch_from_yfinance, symbol, "5y")

    if not fresh_data:
        # If yfinance fails, try returning whatever cache we have
        cached_data = await get_cached_history(symbol, start_date)
        return {
            "symbol": symbol,
            "range": range_key,
            "data": cached_data,
            "source": "cache (stale)",
            "count": len(cached_data),
        }

    # Cache the full dataset
    await cache_stock_data(symbol, fresh_data)

    # Filter to requested range
    filtered = [d for d in fresh_data if d["date"] >= start_date]

    # Attach alternative data for the chart overlay
    enriched = await get_alt_data(symbol, filtered)

    return {
        "symbol": symbol,
        "range": range_key,
        "data": enriched,
        "source": "yfinance",
        "count": len(enriched),
    }


async def get_stock_info(symbol: str) -> dict | None:
    """Get basic info about a stock from yfinance."""
    try:
        loop = asyncio.get_event_loop()

        def _fetch_info():
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                "symbol": symbol,
                "name": info.get("longName", info.get("shortName", symbol)),
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
                "currentPrice": info.get("currentPrice", info.get("regularMarketPrice", 0)),
                "previousClose": info.get("previousClose", 0),
                "marketCap": info.get("marketCap", 0),
                "currency": info.get("currency", "INR"),
            }

        await _rate_limit()
        return await loop.run_in_executor(None, _fetch_info)
    except Exception as e:
        print(f"❌ Failed to get info for {symbol}: {e}")
        return None

# --- Alternative Data (Quant Features) ---

def _fetch_google_trends(keyword: str, start_date: str, end_date: str) -> dict:
    """Synchronous fetch from Google Trends using pytrends."""
    try:
        pytrends = TrendReq(hl='en-US', tz=330, retries=2, backoff_factor=0.5)
        # Format for pytrends: YYYY-MM-DD YYYY-MM-DD
        timeframe = f"{start_date} {end_date}"
        pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo='', gprop='')
        df = pytrends.interest_over_time()
        
        if df.empty:
            return {}
            
        if "isPartial" in df.columns:
            df = df.drop(columns=["isPartial"])
            
        # Convert index to YYYY-MM-DD string keys
        trends_dict = {}
        for index, row in df.iterrows():
            date_str = index.strftime("%Y-%m-%d")
            trends_dict[date_str] = float(row[keyword])
            
        return trends_dict
    except Exception as e:
        print(f"❌ PyTrends error for {keyword}: {e}")
        return {}

async def get_alt_data(symbol: str, history_data: list[dict]) -> list[dict]:
    """
    Enriches historical OHLCV data with Alternative Data signals:
    1. Google Trends (Real, via pytrends, with fallback)
    2. Satellite Car Count (Synthetic, correlated to price)
    3. Foot Traffic Index (Synthetic, correlated to volume/price)
    """
    if not history_data:
        return []
        
    start_date = history_data[0]["date"]
    end_date = history_data[-1]["date"]
    
    # Extract a clean keyword for trends (e.g. "RELIANCE.NS" -> "Reliance")
    keyword = symbol.split(".")[0].replace("^", "")
    if len(keyword) > 3:
        keyword = keyword.capitalize()
    
    # 1. Fetch Real Google Trends Data
    loop = asyncio.get_event_loop()
    real_trends = await loop.run_in_executor(None, _fetch_google_trends, keyword, start_date, end_date)
    
    # 2. Generate Synthetic Data & Merge
    enriched_data = []
    
    # We use a running state to make synthetic data look realistic (random walk with drift)
    base_satellite = 1000
    base_foot = 50.0
    
    for i, day in enumerate(history_data):
        date_str = day["date"]
        
        # --- Google Trends ---
        # If pytrends failed or missing date, fallback to a synthetic trend that loosely follows price
        if date_str in real_trends:
            trend_val = real_trends[date_str]
        else:
            # Synthetic trend: normalized price * random noise (0-100 scale)
            price_factor = day["close"] / history_data[0]["close"]
            trend_val = min(100, max(0, int(50 * price_factor * random.uniform(0.8, 1.2))))
            
        # --- Satellite Car Count (Synthetic) ---
        # Assume cars correlate slightly with volume and overall trend
        vol_factor = day["volume"] / history_data[0]["volume"] if history_data[0]["volume"] > 0 else 1
        price_factor = day["close"] / history_data[0]["close"]
        base_satellite = base_satellite * 0.9 + (1000 * price_factor * vol_factor) * 0.1
        satellite_val = int(base_satellite * random.uniform(0.9, 1.1))
        
        # --- Foot Traffic Index (Synthetic) ---
        # 0-100 index
        base_foot = base_foot * 0.8 + (50 * price_factor) * 0.2
        foot_val = min(100.0, max(0.0, round(base_foot * random.uniform(0.85, 1.15), 1)))
        
        enriched_day = {
            **day,
            "google_trends": trend_val,
            "satellite_count": satellite_val,
            "foot_traffic": foot_val
        }
        enriched_data.append(enriched_day)
        
    return enriched_data

