from __future__ import annotations
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import random
import os
import feedparser

from backend.database import init_db, search_stocks, load_stock_master_list, get_stock_count, save_leaderboard_entry, get_leaderboard_entries
from backend.data_service import fetch_stock_history, get_stock_info, get_alt_data
from backend.llm_service import parse_strategy_prompt, generate_ai_insight, analyze_chart_image, analyze_market_news, analyze_single_news_item, generate_quant_insights_stream
from backend.engine import run_real_backtest
from fastapi.responses import StreamingResponse


# --- Lifespan: runs on startup/shutdown ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and load stock list
    await init_db()
    csv_path = os.path.join(os.path.dirname(__file__), "stock_list.csv")
    if os.path.exists(csv_path):
        await load_stock_master_list(csv_path)
    else:
        print("⚠️  stock_list.csv not found. Run: python -m backend.generate_stock_list")
    count = await get_stock_count()
    print(f"🚀 Prizm API ready — {count} stocks loaded")
    yield
    # Shutdown
    print("👋 Prizm API shutting down")


app = FastAPI(title="Prizm Backend API", lifespan=lifespan)

# Allow Next.js on localhost:3000 to interact with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class PromptRequest(BaseModel):
    prompt: str


class BacktestRequest(BaseModel):
    symbol: str
    range: str = "1y"
    blocks: list[dict]

class ChartAnalysisRequest(BaseModel):
    symbol: str
    image: str

class NewsAnalysisRequest(BaseModel):
    title: str
    summary: str

class PublishLeaderboardRequest(BaseModel):
    author: str
    symbol: str
    blocks: list[dict]
    metrics: dict
    totalTrades: int


# --- Existing Endpoint: Strategy Generation ---

@app.post("/api/generate-strategy")
async def generate_strategy(request: PromptRequest):
    prompt = request.prompt.lower()
    
    # Try True AI Parsing first
    blocks = await parse_strategy_prompt(request.prompt)
    
    # Fallback to "Smart Mock" Parser if API key is missing
    if blocks is None:
        blocks = []
        if "rsi" in prompt:
            blocks.append({"type": "RSI", "label": "> 70"})
        if "macd" in prompt:
            blocks.append({"type": "MACD", "label": "Cross"})
        if "volume" in prompt or "vol" in prompt:
            blocks.append({"type": "Volume", "label": "Spike"})
        if "moving average" in prompt or "ma" in prompt:
            blocks.append({"type": "MA(50)", "label": "Cross Up"})
        if "stop" in prompt:
            blocks.append({"type": "Trailing Stop", "label": "Active"})
        if "sma" in prompt:
            blocks.append({"type": "SMA(200)", "label": "Above"})
        if "ema" in prompt:
            blocks.append({"type": "EMA(20)", "label": "Cross"})
        if "bollinger" in prompt or "bb" in prompt:
            blocks.append({"type": "Bollinger", "label": "Squeeze"})
        if "support" in prompt:
            blocks.append({"type": "Support", "label": "Bounce"})
        if "resistance" in prompt:
            blocks.append({"type": "Resistance", "label": "Break"})
            
        # If no keywords matched, return a default instruction block
        if not blocks:
            blocks = [
                {"type": "Unrecognized", "label": "Try 'RSI' or 'Volume'"}
            ]
            
    return {
        "status": "success", 
        "strategy_id": f"strat_{random.randint(1000, 9999)}", 
        "blocks": blocks
    }


# --- New Endpoint: Stock Search ---

@app.get("/api/stocks/search")
async def stock_search(q: str = Query(..., min_length=1, description="Search query")):
    """Search stocks by symbol or company name."""
    results = await search_stocks(q)
    return {
        "status": "success",
        "query": q,
        "results": results,
        "count": len(results),
    }


# --- New Endpoint: Stock History ---

@app.get("/api/stocks/{symbol}/history")
async def stock_history(
    symbol: str, 
    range: str = Query("1y", description="Time range: 1m, 3m, 6m, 1y, 5y")
):
    """Get OHLC + Volume data for a stock. Fetches from yfinance on-demand and caches."""
    result = await fetch_stock_history(symbol, range)
    
    if not result["data"]:
        return {
            "status": "error",
            "message": f"No data found for {symbol}. Verify the ticker symbol is correct.",
            "symbol": symbol,
        }
    
    return {
        "status": "success",
        **result,
    }


# --- New Endpoint: Stock Info ---

@app.get("/api/stocks/{symbol}/info")
async def stock_info_endpoint(symbol: str):
    """Get basic info about a stock."""
    info = await get_stock_info(symbol)
    if not info:
        return {"status": "error", "message": f"Could not fetch info for {symbol}"}
    return {"status": "success", **info}


# --- Endpoint: Run Backtest (Real Engine) ---

@app.post("/api/run-backtest")
async def run_backtest(request: BacktestRequest):
    """
    Run a real backtest using the Prizm engine.
    Computes actual technical indicators and simulates real trades.
    """
    # Fetch the historical data for this stock
    history = await fetch_stock_history(request.symbol, request.range)
    data = history.get("data", [])
    
    if not data or len(data) < 20:
        return {
            "status": "error",
            "message": "Insufficient data for backtest. Need at least 20 data points.",
        }
        
    # Inject Alternative Data (Google Trends, Satellite, Foot Traffic)
    data = await get_alt_data(request.symbol, data)
    
    # Run the Prizm backtest engine (v2.0 with costs + walk-forward)
    result = run_real_backtest(data, request.blocks, capital=100000)
    
    # Generate AI Insight on the real results
    ai_insight = await generate_ai_insight(result["metrics"], result["metrics"]["totalTrades"])
    
    return {
        "status": "success",
        "symbol": request.symbol,
        "range": request.range,
        "strategy_blocks": request.blocks,
        "metrics": result["metrics"],
        "aiInsight": ai_insight,
        "equityCurve": result["equityCurve"],
        "tradeLog": result["tradeLog"],
        "walkForward": result.get("walkForward"),
    }


# --- New Endpoint: Chart Analysis (Vision) ---

@app.post("/api/analyze-chart")
async def analyze_chart(request: ChartAnalysisRequest):
    """
    Uses Prizm AI Vision to read a candlestick chart image and return technical analysis.
    """
    insight = await analyze_chart_image(request.image, request.symbol)
    
    if not insight:
        return {
            "status": "error",
            "message": "AI Vision analysis unavailable (API key missing or failed)."
        }
        
    return {
        "status": "success",
        "symbol": request.symbol,
        "analysis": insight
    }

# --- New Endpoints: Leaderboard ---

@app.post("/api/leaderboard/publish")
async def publish_to_leaderboard(request: PublishLeaderboardRequest):
    """Saves a strategy backtest to the public leaderboard."""
    try:
        import json
        blocks_str = json.dumps(request.blocks)
        await save_leaderboard_entry(
            author=request.author,
            symbol=request.symbol,
            blocks_json=blocks_str,
            metrics=request.metrics,
            total_trades=request.totalTrades
        )
        return {"status": "success", "message": "Strategy published!"}
    except Exception as e:
        print(f"Error publishing: {e}")
        return {"status": "error", "message": "Failed to publish strategy."}

@app.get("/api/leaderboard")
async def fetch_leaderboard():
    """Fetches the top strategies."""
    try:
        entries = await get_leaderboard_entries()
        # Parse the JSON string back to dict for the frontend
        import json
        for entry in entries:
            entry["blocks"] = json.loads(entry["blocks_json"])
            del entry["blocks_json"]
        return {"status": "success", "data": entries}
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        return {"status": "error", "message": "Failed to fetch leaderboard."}

# --- New Endpoint: Market Pulse (Live News + AI) ---

@app.get("/api/market-pulse")
async def market_pulse():
    """Fetches live market news and AI impact analysis."""
    try:
        # Fetch RSS from Yahoo Finance (Top US/Global + India Proxies)
        # ^BSESN is BSE Sensex, ^NSEI is Nifty 50, ^DJI is Dow Jones
        feed_url = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^NSEI,^BSESN,^DJI,^GSPC,AAPL,RELIANCE.NS"
        feed = feedparser.parse(feed_url)
        
        headlines = []
        raw_news = []
        
        # Parse top 15 news items
        for entry in feed.entries[:15]:
            title = entry.title
            link = entry.link
            pub_date = entry.published if hasattr(entry, 'published') else ""
            
            # Basic cleanup of summary
            summary = entry.summary if hasattr(entry, 'summary') else ""
            if "<" in summary:
                import re
                summary = re.sub('<[^<]+>', '', summary)
                
            headlines.append(title)
            raw_news.append({
                "title": title,
                "summary": summary, # Keep full summary
                "link": link,
                "pubDate": pub_date
            })
            
        return {
            "status": "success",
            "news": raw_news,
        }
    except Exception as e:
        print(f"Error fetching market pulse: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/analyze-news-item")
async def analyze_news_item(request: NewsAnalysisRequest):
    """Analyzes a single news item on demand."""
    try:
        analysis = await analyze_single_news_item(request.title, request.summary)
        if not analysis:
            return {"status": "error", "message": "AI analysis unavailable"}
            
        return {
            "status": "success",
            "analysis": analysis
        }
    except Exception as e:
        print(f"Error analyzing news item: {e}")
        return {"status": "error", "message": str(e)}

class QuantInsightRequest(BaseModel):
    symbol: str
    company_name: str

@app.post("/api/quant-insights")
async def get_quant_insights(request: QuantInsightRequest):
    """Generates alternative data insights for a given stock and streams the result."""
    try:
        return StreamingResponse(
            generate_quant_insights_stream(request.symbol, request.company_name), 
            media_type="text/plain"
        )
    except Exception as e:
        print(f"Error generating quant insights: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Make sure to run this via standard module execution if running manually
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
