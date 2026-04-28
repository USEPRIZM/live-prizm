"""
Generate the NSE + BSE stock master list CSV.
Uses yfinance-compatible ticker symbols.

Run once: python -m backend.generate_stock_list
"""

import csv
import os

# --- NSE Stocks (Top ~500 actively traded) ---
# Full NSE list has ~2000+ stocks. We include the most actively traded ones.
# Ticker format: SYMBOL.NS
NSE_STOCKS = [
    # NIFTY 50
    ("RELIANCE.NS", "Reliance Industries Limited"),
    ("TCS.NS", "Tata Consultancy Services Limited"),
    ("HDFCBANK.NS", "HDFC Bank Limited"),
    ("INFY.NS", "Infosys Limited"),
    ("ICICIBANK.NS", "ICICI Bank Limited"),
    ("HINDUNILVR.NS", "Hindustan Unilever Limited"),
    ("ITC.NS", "ITC Limited"),
    ("SBIN.NS", "State Bank of India"),
    ("BHARTIARTL.NS", "Bharti Airtel Limited"),
    ("KOTAKBANK.NS", "Kotak Mahindra Bank Limited"),
    ("LT.NS", "Larsen & Toubro Limited"),
    ("AXISBANK.NS", "Axis Bank Limited"),
    ("ASIANPAINT.NS", "Asian Paints Limited"),
    ("MARUTI.NS", "Maruti Suzuki India Limited"),
    ("TITAN.NS", "Titan Company Limited"),
    ("SUNPHARMA.NS", "Sun Pharmaceutical Industries Limited"),
    ("BAJFINANCE.NS", "Bajaj Finance Limited"),
    ("WIPRO.NS", "Wipro Limited"),
    ("ULTRACEMCO.NS", "UltraTech Cement Limited"),
    ("ONGC.NS", "Oil and Natural Gas Corporation Limited"),
    ("NTPC.NS", "NTPC Limited"),
    ("POWERGRID.NS", "Power Grid Corporation of India Limited"),
    ("TATAMOTORS.NS", "Tata Motors Limited"),
    ("M&M.NS", "Mahindra & Mahindra Limited"),
    ("JSWSTEEL.NS", "JSW Steel Limited"),
    ("TATASTEEL.NS", "Tata Steel Limited"),
    ("ADANIENT.NS", "Adani Enterprises Limited"),
    ("ADANIPORTS.NS", "Adani Ports and Special Economic Zone Limited"),
    ("HCLTECH.NS", "HCL Technologies Limited"),
    ("BAJAJFINSV.NS", "Bajaj Finserv Limited"),
    ("TECHM.NS", "Tech Mahindra Limited"),
    ("INDUSINDBK.NS", "IndusInd Bank Limited"),
    ("COALINDIA.NS", "Coal India Limited"),
    ("DRREDDY.NS", "Dr. Reddy's Laboratories Limited"),
    ("CIPLA.NS", "Cipla Limited"),
    ("EICHERMOT.NS", "Eicher Motors Limited"),
    ("DIVISLAB.NS", "Divi's Laboratories Limited"),
    ("BPCL.NS", "Bharat Petroleum Corporation Limited"),
    ("GRASIM.NS", "Grasim Industries Limited"),
    ("BRITANNIA.NS", "Britannia Industries Limited"),
    ("NESTLEIND.NS", "Nestle India Limited"),
    ("HEROMOTOCO.NS", "Hero MotoCorp Limited"),
    ("APOLLOHOSP.NS", "Apollo Hospitals Enterprise Limited"),
    ("SBILIFE.NS", "SBI Life Insurance Company Limited"),
    ("HDFCLIFE.NS", "HDFC Life Insurance Company Limited"),
    ("TATACONSUM.NS", "Tata Consumer Products Limited"),
    ("BAJAJ-AUTO.NS", "Bajaj Auto Limited"),
    ("HINDALCO.NS", "Hindalco Industries Limited"),
    ("WIPRO.NS", "Wipro Limited"),
    ("UPL.NS", "UPL Limited"),

    # NIFTY NEXT 50 / NIFTY MIDCAP SELECT
    ("ADANIGREEN.NS", "Adani Green Energy Limited"),
    ("ADANIPOWER.NS", "Adani Power Limited"),
    ("AMBUJACEM.NS", "Ambuja Cements Limited"),
    ("AUROPHARMA.NS", "Aurobindo Pharma Limited"),
    ("BANDHANBNK.NS", "Bandhan Bank Limited"),
    ("BANKBARODA.NS", "Bank of Baroda"),
    ("BEL.NS", "Bharat Electronics Limited"),
    ("BERGEPAINT.NS", "Berger Paints India Limited"),
    ("BIOCON.NS", "Biocon Limited"),
    ("BOSCHLTD.NS", "Bosch Limited"),
    ("CANBK.NS", "Canara Bank"),
    ("CHOLAFIN.NS", "Cholamandalam Investment and Finance Company"),
    ("COLPAL.NS", "Colgate-Palmolive (India) Limited"),
    ("CONCOR.NS", "Container Corporation of India Limited"),
    ("DABUR.NS", "Dabur India Limited"),
    ("DLF.NS", "DLF Limited"),
    ("FEDERALBNK.NS", "Federal Bank Limited"),
    ("GAIL.NS", "GAIL (India) Limited"),
    ("GODREJCP.NS", "Godrej Consumer Products Limited"),
    ("GODREJPROP.NS", "Godrej Properties Limited"),
    ("HAVELLS.NS", "Havells India Limited"),
    ("HAL.NS", "Hindustan Aeronautics Limited"),
    ("ICICIPRULI.NS", "ICICI Prudential Life Insurance"),
    ("ICICIGI.NS", "ICICI Lombard General Insurance"),
    ("IDEA.NS", "Vodafone Idea Limited"),
    ("IDFCFIRSTB.NS", "IDFC First Bank Limited"),
    ("INDIGO.NS", "InterGlobe Aviation Limited"),
    ("IOC.NS", "Indian Oil Corporation Limited"),
    ("IRCTC.NS", "Indian Railway Catering and Tourism Corporation"),
    ("JINDALSTEL.NS", "Jindal Steel & Power Limited"),
    ("JUBLFOOD.NS", "Jubilant FoodWorks Limited"),
    ("LICI.NS", "Life Insurance Corporation of India"),
    ("LTIM.NS", "LTIMindtree Limited"),
    ("LUPIN.NS", "Lupin Limited"),
    ("MARICO.NS", "Marico Limited"),
    ("MCDOWELL-N.NS", "United Spirits Limited"),
    ("MPHASIS.NS", "Mphasis Limited"),
    ("MUTHOOTFIN.NS", "Muthoot Finance Limited"),
    ("NAUKRI.NS", "Info Edge (India) Limited"),
    ("NMDC.NS", "NMDC Limited"),
    ("OBEROIRLTY.NS", "Oberoi Realty Limited"),
    ("OFSS.NS", "Oracle Financial Services Software"),
    ("PAGEIND.NS", "Page Industries Limited"),
    ("PEL.NS", "Piramal Enterprises Limited"),
    ("PERSISTENT.NS", "Persistent Systems Limited"),
    ("PETRONET.NS", "Petronet LNG Limited"),
    ("PIDILITIND.NS", "Pidilite Industries Limited"),
    ("PIIND.NS", "PI Industries Limited"),
    ("PNB.NS", "Punjab National Bank"),
    ("POLYCAB.NS", "Polycab India Limited"),
    ("SAIL.NS", "Steel Authority of India Limited"),
    ("SHREECEM.NS", "Shree Cement Limited"),
    ("SIEMENS.NS", "Siemens Limited"),
    ("SRF.NS", "SRF Limited"),
    ("TATAPOWER.NS", "Tata Power Company Limited"),
    ("TATACOMM.NS", "Tata Communications Limited"),
    ("TRENT.NS", "Trent Limited"),
    ("TORNTPHARM.NS", "Torrent Pharmaceuticals Limited"),
    ("VEDL.NS", "Vedanta Limited"),
    ("VOLTAS.NS", "Voltas Limited"),
    ("ZOMATO.NS", "Zomato Limited"),
    ("ZYDUSLIFE.NS", "Zydus Lifesciences Limited"),

    # Popular Mid & Small Caps
    ("AAPL.NS", "Not listed"),  # Will be skipped
    ("ABCAPITAL.NS", "Aditya Birla Capital Limited"),
    ("ACC.NS", "ACC Limited"),
    ("ALKEM.NS", "Alkem Laboratories Limited"),
    ("ATUL.NS", "Atul Limited"),
    ("BALKRISIND.NS", "Balkrishna Industries Limited"),
    ("BATAINDIA.NS", "Bata India Limited"),
    ("BHEL.NS", "Bharat Heavy Electricals Limited"),
    ("CAMS.NS", "Computer Age Management Services"),
    ("CANFINHOME.NS", "Can Fin Homes Limited"),
    ("CDSL.NS", "Central Depository Services (India) Limited"),
    ("CENTRALBK.NS", "Central Bank of India"),
    ("CLEAN.NS", "Clean Science and Technology Limited"),
    ("COFORGE.NS", "Coforge Limited"),
    ("CROMPTON.NS", "Crompton Greaves Consumer Electricals"),
    ("CUB.NS", "City Union Bank Limited"),
    ("CUMMINSIND.NS", "Cummins India Limited"),
    ("DEEPAKNTR.NS", "Deepak Nitrite Limited"),
    ("DELHIVERY.NS", "Delhivery Limited"),
    ("DIXON.NS", "Dixon Technologies (India) Limited"),
    ("ESCORTS.NS", "Escorts Kubota Limited"),
    ("EXIDEIND.NS", "Exide Industries Limited"),
    ("GLAND.NS", "Gland Pharma Limited"),
    ("GLAXO.NS", "GlaxoSmithKline Pharmaceuticals Limited"),
    ("GMRINFRA.NS", "GMR Airports Infrastructure Limited"),
    ("GNFC.NS", "Gujarat Narmada Valley Fertilizers"),
    ("GRANULES.NS", "Granules India Limited"),
    ("GUJGASLTD.NS", "Gujarat Gas Limited"),
    ("HAPPSTMNDS.NS", "Happiest Minds Technologies Limited"),
    ("HDFCAMC.NS", "HDFC Asset Management Company Limited"),
    ("HONAUT.NS", "Honeywell Automation India Limited"),
    ("IPCALAB.NS", "IPCA Laboratories Limited"),
    ("IRFC.NS", "Indian Railway Finance Corporation Limited"),
    ("IEX.NS", "Indian Energy Exchange Limited"),
    ("INDIANB.NS", "Indian Bank"),
    ("INDUSTOWER.NS", "Indus Towers Limited"),
    ("KAJARIACER.NS", "Kajaria Ceramics Limited"),
    ("KEI.NS", "KEI Industries Limited"),
    ("L&TFH.NS", "L&T Finance Holdings Limited"),
    ("LAURUSLABS.NS", "Laurus Labs Limited"),
    ("LICHSGFIN.NS", "LIC Housing Finance Limited"),
    ("LTTS.NS", "L&T Technology Services Limited"),
    ("MANAPPURAM.NS", "Manappuram Finance Limited"),
    ("MAXHEALTH.NS", "Max Healthcare Institute Limited"),
    ("MCX.NS", "Multi Commodity Exchange of India"),
    ("METROPOLIS.NS", "Metropolis Healthcare Limited"),
    ("MFSL.NS", "Max Financial Services Limited"),
    ("MGL.NS", "Mahanagar Gas Limited"),
    ("MOTHERSON.NS", "Samvardhana Motherson International Limited"),
    ("NAM-INDIA.NS", "Nippon Life India Asset Management"),
    ("NATIONALUM.NS", "National Aluminium Company Limited"),
    ("NIACL.NS", "New India Assurance Company Limited"),
    ("PAYTM.NS", "One 97 Communications Limited"),
    ("PFC.NS", "Power Finance Corporation Limited"),
    ("PHOENIXLTD.NS", "The Phoenix Mills Limited"),
    ("PRESTIGE.NS", "Prestige Estates Projects Limited"),
    ("PVRINOX.NS", "PVR INOX Limited"),
    ("RAJESHEXPO.NS", "Rajesh Exports Limited"),
    ("RAMCOCEM.NS", "The Ramco Cements Limited"),
    ("RBLBANK.NS", "RBL Bank Limited"),
    ("RECLTD.NS", "REC Limited"),
    ("RELAXO.NS", "Relaxo Footwears Limited"),
    ("SBICARD.NS", "SBI Cards and Payment Services Limited"),
    ("SJVN.NS", "SJVN Limited"),
    ("SOLARINDS.NS", "Solar Industries India Limited"),
    ("SONACOMS.NS", "Sona BLW Precision Forgings Limited"),
    ("STAR.NS", "Star Health and Allied Insurance"),
    ("SUNDARMFIN.NS", "Sundaram Finance Limited"),
    ("SYNGENE.NS", "Syngene International Limited"),
    ("TATACHEM.NS", "Tata Chemicals Limited"),
    ("TATAELXSI.NS", "Tata Elxsi Limited"),
    ("THERMAX.NS", "Thermax Limited"),
    ("TIINDIA.NS", "Tube Investments of India Limited"),
    ("TRIDENT.NS", "Trident Limited"),
    ("TVSMOTOR.NS", "TVS Motor Company Limited"),
    ("UNIONBANK.NS", "Union Bank of India"),
    ("UNITDSPR.NS", "United Spirits Limited"),
    ("WHIRLPOOL.NS", "Whirlpool of India Limited"),
    ("YESBANK.NS", "Yes Bank Limited"),

    # Indices (for sandbox)
    ("^NSEI", "Nifty 50 Index"),
    ("^BSESN", "BSE Sensex Index"),
    ("^NSEBANK", "Nifty Bank Index"),
    ("^NSMIDCP", "Nifty Midcap 50 Index"),
]

# --- US Stocks (NASDAQ / NYSE) ---
NASDAQ_STOCKS = [
    # Mega Caps
    ("AAPL", "Apple Inc."),
    ("MSFT", "Microsoft Corporation"),
    ("NVDA", "NVIDIA Corporation"),
    ("GOOGL", "Alphabet Inc. (Class A)"),
    ("AMZN", "Amazon.com Inc."),
    ("META", "Meta Platforms Inc."),
    ("BRK-B", "Berkshire Hathaway Inc."),
    ("TSLA", "Tesla Inc."),
    ("LLY", "Eli Lilly and Company"),
    ("AVGO", "Broadcom Inc."),
    ("V", "Visa Inc."),
    ("JPM", "JPMorgan Chase & Co."),
    ("WMT", "Walmart Inc."),
    ("MA", "Mastercard Incorporated"),
    ("UNH", "UnitedHealth Group Incorporated"),
    ("XOM", "Exxon Mobil Corporation"),
    ("HD", "The Home Depot Inc."),
    ("PG", "The Procter & Gamble Company"),
    ("JNJ", "Johnson & Johnson"),
    ("COST", "Costco Wholesale Corporation"),
    ("MRK", "Merck & Co. Inc."),
    ("ABBV", "AbbVie Inc."),
    ("CRM", "Salesforce Inc."),
    ("AMD", "Advanced Micro Devices Inc."),
    ("CVX", "Chevron Corporation"),
    ("NFLX", "Netflix Inc."),
    ("PEP", "PepsiCo Inc."),
    ("KO", "The Coca-Cola Company"),
    ("ADBE", "Adobe Inc."),
    ("INTC", "Intel Corporation"),
    ("QCOM", "QUALCOMM Incorporated"),
    ("CSCO", "Cisco Systems Inc."),
    ("TXN", "Texas Instruments Incorporated"),
    ("AMAT", "Applied Materials Inc."),
    ("INTU", "Intuit Inc."),
    ("ISRG", "Intuitive Surgical Inc."),
    ("NOW", "ServiceNow Inc."),
    ("SBUX", "Starbucks Corporation"),
    ("HON", "Honeywell International Inc."),
    ("BA", "The Boeing Company"),
    ("GE", "General Electric Company"),
    ("DIS", "The Walt Disney Company"),
    ("NKE", "NIKE Inc."),
    ("PFE", "Pfizer Inc."),
    
    # Popular US Indices
    ("^GSPC", "S&P 500 Index"),
    ("^IXIC", "NASDAQ Composite Index"),
    ("^DJI", "Dow Jones Industrial Average"),
]

# --- BSE Stocks (Top actively traded, .BO suffix) ---
BSE_STOCKS = [
    ("RELIANCE.BO", "Reliance Industries Limited"),
    ("TCS.BO", "Tata Consultancy Services Limited"),
    ("HDFCBANK.BO", "HDFC Bank Limited"),
    ("INFY.BO", "Infosys Limited"),
    ("ICICIBANK.BO", "ICICI Bank Limited"),
    ("HINDUNILVR.BO", "Hindustan Unilever Limited"),
    ("ITC.BO", "ITC Limited"),
    ("SBIN.BO", "State Bank of India"),
    ("BHARTIARTL.BO", "Bharti Airtel Limited"),
    ("KOTAKBANK.BO", "Kotak Mahindra Bank Limited"),
    ("LT.BO", "Larsen & Toubro Limited"),
    ("AXISBANK.BO", "Axis Bank Limited"),
    ("ASIANPAINT.BO", "Asian Paints Limited"),
    ("MARUTI.BO", "Maruti Suzuki India Limited"),
    ("TITAN.BO", "Titan Company Limited"),
    ("SUNPHARMA.BO", "Sun Pharmaceutical Industries Limited"),
    ("BAJFINANCE.BO", "Bajaj Finance Limited"),
    ("WIPRO.BO", "Wipro Limited"),
    ("TATAMOTORS.BO", "Tata Motors Limited"),
    ("M&M.BO", "Mahindra & Mahindra Limited"),
    ("ADANIENT.BO", "Adani Enterprises Limited"),
    ("HCLTECH.BO", "HCL Technologies Limited"),
    ("TATASTEEL.BO", "Tata Steel Limited"),
    ("NTPC.BO", "NTPC Limited"),
    ("POWERGRID.BO", "Power Grid Corporation of India Limited"),
    ("COALINDIA.BO", "Coal India Limited"),
    ("ONGC.BO", "Oil and Natural Gas Corporation Limited"),
    ("DRREDDY.BO", "Dr. Reddy's Laboratories Limited"),
    ("CIPLA.BO", "Cipla Limited"),
    ("BAJAJ-AUTO.BO", "Bajaj Auto Limited"),
    ("ZOMATO.BO", "Zomato Limited"),
    ("HAL.BO", "Hindustan Aeronautics Limited"),
    ("DLF.BO", "DLF Limited"),
    ("TATAPOWER.BO", "Tata Power Company Limited"),
    ("VEDL.BO", "Vedanta Limited"),
    ("IRFC.BO", "Indian Railway Finance Corporation Limited"),
    ("PNB.BO", "Punjab National Bank"),
    ("BANKBARODA.BO", "Bank of Baroda"),
    ("IOC.BO", "Indian Oil Corporation Limited"),
    ("BEL.BO", "Bharat Electronics Limited"),
]


def generate_csv():
    """Generate the stock_list.csv file."""
    output_path = os.path.join(os.path.dirname(__file__), "stock_list.csv")

    seen = set()
    rows = []

    for symbol, name in NSE_STOCKS:
        if symbol not in seen:
            exchange = "INDEX" if symbol.startswith("^") else "NSE"
            rows.append({"symbol": symbol, "name": name, "exchange": exchange, "sector": ""})
            seen.add(symbol)

    for symbol, name in BSE_STOCKS:
        if symbol not in seen:
            rows.append({"symbol": symbol, "name": name, "exchange": "BSE", "sector": ""})
            seen.add(symbol)

    for symbol, name in NASDAQ_STOCKS:
        if symbol not in seen:
            exchange = "INDEX" if symbol.startswith("^") else "NASDAQ/NYSE"
            rows.append({"symbol": symbol, "name": name, "exchange": exchange, "sector": ""})
            seen.add(symbol)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["symbol", "name", "exchange", "sector"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Generated {output_path} with {len(rows)} stocks")
    return output_path


if __name__ == "__main__":
    generate_csv()
