from __future__ import annotations
import os
import json
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_client() -> genai.Client | None:
    """Initialize the AI client if API key is present."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "your-key-here":
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"❌ Failed to initialize AI client: {e}")
        return None

async def parse_strategy_prompt(prompt: str) -> list[dict] | None:
    """
    Uses AI to parse a natural language prompt into structured strategy blocks.
    Returns None if LLM is unavailable.
    """
    client = get_client()
    if not client:
        return None
        
    system_instruction = """
You are an expert quantitative trading parser for the Prizm backtesting engine.
Convert the user's natural language trading strategy into a JSON array of logic blocks.
The user may write their prompt in English, Hindi, or Hinglish. Parse accurately regardless of language.

Each block must have exactly two string fields: "type" and "label".

STRICT RULES for "type" — use ONLY these exact values:
- "RSI" — Relative Strength Index
- "MACD" — Moving Average Convergence Divergence
- "SMA(N)" — Simple Moving Average with period N, e.g. "SMA(50)", "SMA(200)"
- "EMA(N)" — Exponential Moving Average with period N, e.g. "EMA(20)"
- "Bollinger" — Bollinger Bands
- "Volume" — Volume analysis
- "Trailing Stop" — Trailing stop loss (Percentage or ATR)
- "SIZE" — Position sizing strategy
- "Google Trends" — Google Search Volume Index
- "Satellite" — Satellite Imagery/Parking Lot Car Counts
- "Foot Traffic" — Geolocation Foot Traffic

STRICT RULES for "label" — use mathematical operators:
- For RSI: "< 30", "> 70", "< 20", etc.
- For MACD: "Bullish Cross", "Bearish Cross"
- For SMA/EMA: "Cross Up" (price crosses above), "Cross Down" (price crosses below), "Above", "Below"
- For Bollinger: "Lower Band", "Upper Band", "Squeeze"
- For Volume: "Spike" (meaning > 2x average), "> 3x avg", etc.
- For Trailing Stop: "5%" or "2 ATR", "3 ATR", etc.
- For SIZE: "1% Risk", "2% Risk", "100% Capital", "50% Capital"
- For Google Trends: "> 70", "Spike", "High"
- For Satellite: "Full", "> 1200", "High"
- For Foot Traffic: "Spike", "> 70"

If the user says "moving average" without specifying type, default to SMA(50).
If the user mentions a number for RSI but no direction, default to "< {number}" (buy on oversold).
If the user specifies risk, output a SIZE block.

Return ONLY valid JSON. No markdown, no code blocks.
Example input: "Buy when RSI is below 30 and google trends spikes, risking 2% per trade with a 2 ATR stop"
Example output: [{"type": "RSI", "label": "< 30"}, {"type": "Google Trends", "label": "Spike"}, {"type": "SIZE", "label": "2% Risk"}, {"type": "Trailing Stop", "label": "2 ATR"}]
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
            )
        )
        
        # Parse the JSON response
        text = response.text.strip()
        blocks = json.loads(text)
        if isinstance(blocks, list):
            return blocks
        return [{"type": "AI Error", "label": "Invalid Response Format"}]
        
    except Exception as e:
        print(f"❌ AI Parsing Error: {e}")
        return [{"type": "AI Error", "label": "Generation Failed"}]


async def generate_ai_insight(metrics: dict, total_trades: int) -> str | None:
    """
    Uses AI to analyze backtest metrics and act as a trading mentor.
    """
    client = get_client()
    if not client:
        return None
        
    system_instruction = """
You are an elite quantitative trading mentor analyzing a user's backtest results.
Provide a concise, 2-3 sentence analysis of their strategy's performance.
Highlight the biggest strength and the biggest risk (e.g., high drawdown, low win rate).
Be constructive, professional, and slightly conversational.
Do not use markdown formatting.
"""
    
    prompt = f"""
Analyze these backtest results:
- Total Return: {metrics.get('totalReturn', 0)}%
- Win Rate: {metrics.get('winRate', 0)}%
- Max Drawdown: {metrics.get('maxDrawdown', 0)}%
- Sharpe Ratio: {metrics.get('sharpeRatio', 0)}
- Total Trades Executed: {total_trades}
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"❌ AI Insight Error: {e}")
        return None

async def analyze_chart_image(base64_data: str, symbol: str) -> str | None:
    """
    Uses AI Vision to analyze a base64 encoded chart image and provide technical analysis.
    """
    client = get_client()
    if not client:
        return None
        
    try:
        # Strip the data URI prefix if present (e.g. data:image/png;base64,...)
        if "," in base64_data:
            base64_data = base64_data.split(",", 1)[1]
            
        image_bytes = base64.b64decode(base64_data)
        
        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type="image/png"
        )
        
        system_instruction = f"""
You are an expert technical analyst reading a stock chart for {symbol}.
Provide a brief, 3-4 sentence analysis of the visual chart.
Mention any obvious trends (uptrend/downtrend), support/resistance levels you can visually estimate, or patterns (head and shoulders, flags, consolidation).
Do not use markdown formatting. Be direct and professional.
If the chart is empty or unreadable, say so nicely.
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[image_part, "Analyze this candlestick chart."],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"❌ AI Vision Error: {e}")
        return None

async def analyze_market_news(headlines: list[str]) -> list[dict] | None:
    """
    Uses AI to analyze market news headlines and identify affected sectors/stocks.
    """
    client = get_client()
    if not client:
        return None
        
    if not headlines:
        return []

    system_instruction = """
You are an elite quantitative analyst. 
Read the following recent market headlines and identify which specific sectors (e.g., IT, Banking, Auto, Energy) or specific major stocks in the Indian or US markets are most likely to be affected.
For each affected entity, categorize the expected impact as "Bullish", "Bearish", or "Neutral", and provide a 1-sentence reasoning based on the headlines.
Ignore noise. Focus only on news with clear market implications.
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "entity": "Name of Sector or Stock (e.g. Indian IT Sector, or Reliance Industries)",
    "impact": "Bullish" | "Bearish" | "Neutral",
    "reasoning": "1-sentence explanation"
  }
]
No markdown, no code blocks. Just raw JSON.
"""
    prompt = "Headlines:\n" + "\n".join([f"- {h}" for h in headlines])

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
            )
        )
        
        # Parse the JSON response
        text = response.text.strip()
        analysis = json.loads(text)
        if isinstance(analysis, list):
            return analysis
        return []
    except Exception as e:
        print(f"❌ AI News Analysis Error: {e}")
        return None

async def analyze_single_news_item(title: str, summary: str) -> dict | None:
    """
    Uses AI to analyze a single news article, returning keywords and impacted stocks.
    """
    client = get_client()
    if not client:
        return None
        
    system_instruction = """
You are an elite quantitative analyst. 
Read the following news headline and summary.
Task 1: Identify 3-5 crucial financial/market-related keywords or phrases in the text (e.g., "interest rates", "acquisition", "Q3 earnings", "inflation"). Return them as an array of exact strings that appear in the text.
Task 2: Identify specific sectors or major stocks (Indian or US) that will be impacted by this specific news. Categorize the expected impact as "Bullish", "Bearish", or "Neutral", and provide a 1-sentence reasoning.
Return ONLY a valid JSON object with the following schema:
{
  "keywords": ["exact phrase 1", "exact phrase 2"],
  "impacted_entities": [
    {
      "entity": "Name of Sector or Stock",
      "impact": "Bullish" | "Bearish" | "Neutral",
      "reasoning": "1-sentence explanation"
    }
  ]
}
No markdown, no code blocks. Just raw JSON.
"""
    prompt = f"Headline: {title}\nSummary: {summary}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
            )
        )
        
        text = response.text.strip()
        analysis = json.loads(text)
        return analysis
    except Exception as e:
        print(f"❌ AI Single News Analysis Error: {e}")
        return None

async def generate_quant_insights_stream(symbol: str, company_name: str):
    """
    Uses AI to generate a realistic alternative data / quant thesis for a given stock, streaming the response.
    """
    client = get_client()
    if not client:
        return
        
    system_instruction = """
You are a senior quantitative analyst at a top hedge fund.
The user is viewing a stock. Your job is to provide a brief, realistic "Alternative Data Thesis" for this company based on what typical alternative data (search trends, foot traffic, satellite data, app downloads, web scraping) might be showing right now.

Keep it highly engaging and professional. Use formatting like bullet points.
Make it sound like you have access to premium data feeds.

Example for Walmart (WMT):
- **Satellite Data:** Car counts at midwest distribution centers are up 12% MoM, suggesting strong inventory turnover.
- **Credit Card Data:** Aggregated transaction data shows a 4% increase in average basket size.
- **Web Scraping:** Job postings for supply chain logistics are at a 6-month high.

Provide a similar 3-point analysis for the requested stock. Be creative but realistic based on the company's industry. Keep it under 150 words.
"""
    try:
        response_stream = client.models.generate_content_stream(
            model='gemini-2.5-flash',
            contents=f"Generate a quant alternative data thesis for {company_name} ({symbol}).",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            )
        )
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        print(f"❌ Quant Insights failed: {e}")
        yield f"Error: {e}"


