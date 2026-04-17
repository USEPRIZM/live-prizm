import yfinance as yf
import pandas as pd
import json

def fetch_data():
    symbol = "^NSEI"
    print(f"Fetching 5 years of historical data for {symbol}...")
    nifty = yf.Ticker(symbol)
    df = nifty.history(period="5y")
    
    data = []
    for index, row in df.iterrows():
        date_str = index.strftime('%Y-%m-%d')
        data.append({
            "date": date_str,
            "close": round(row['Close'], 2)
        })
    
    with open("public/export.json", "w") as f:
        json.dump(data, f)
    
    print(f"Successfully fetched {len(data)} records for {symbol} and saved to public/export.json")

if __name__ == "__main__":
    fetch_data()
