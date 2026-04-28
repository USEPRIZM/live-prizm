"""
Prizm Backtesting Engine v2.0
==============================
An institutional-grade backtesting engine with:
- Real indicator computation (RSI, MACD, SMA, EMA, Bollinger, Volume)
- Indian market transaction costs (STT, brokerage, GST, stamp duty)
- Slippage modeling (market impact simulation)
- Walk-forward validation (train/test split to detect overfitting)
- Intraday interval support
"""
from __future__ import annotations

import re
import math
import numpy as np
import pandas as pd
import ta


# ---------------------------------------------------------------------------
# 0. TRANSACTION COST MODEL (Indian Market: NSE/BSE)
# ---------------------------------------------------------------------------

class TransactionCosts:
    """
    Realistic Indian equity transaction cost model.
    Based on Zerodha / discount broker fee structure (2024).
    """
    BROKERAGE_PER_ORDER = 20.0          # ₹20 flat per executed order
    STT_BUY_PCT = 0.0                    # STT on delivery buy = 0%
    STT_SELL_PCT = 0.1                    # STT on delivery sell = 0.1%
    EXCHANGE_TXN_PCT = 0.00345            # NSE transaction charge
    GST_PCT = 18.0                        # GST on brokerage + txn charges
    SEBI_TURNOVER_PCT = 0.0001            # SEBI turnover fee
    STAMP_DUTY_BUY_PCT = 0.015            # Stamp duty on buy side

    @classmethod
    def calculate(cls, price: float, shares: int, side: str) -> float:
        """
        Calculate total transaction cost for a trade.
        Returns the cost in ₹ (always positive).
        """
        turnover = price * shares

        brokerage = cls.BROKERAGE_PER_ORDER
        stt = turnover * (cls.STT_SELL_PCT / 100) if side == "SELL" else 0
        txn_charge = turnover * (cls.EXCHANGE_TXN_PCT / 100)
        gst = (brokerage + txn_charge) * (cls.GST_PCT / 100)
        sebi = turnover * (cls.SEBI_TURNOVER_PCT / 100)
        stamp = turnover * (cls.STAMP_DUTY_BUY_PCT / 100) if side == "BUY" else 0

        return round(brokerage + stt + txn_charge + gst + sebi + stamp, 2)


def apply_slippage(price: float, side: str, slippage_pct: float = 0.05) -> float:
    """
    Apply slippage to simulate real market impact.
    Buys execute slightly higher, sells slightly lower.
    Default: 0.05% (5 bps) — realistic for liquid large-caps.
    """
    if side == "BUY":
        return round(price * (1 + slippage_pct / 100), 2)
    else:
        return round(price * (1 - slippage_pct / 100), 2)


# ---------------------------------------------------------------------------
# 1. INDICATOR COMPUTATION
# ---------------------------------------------------------------------------

def compute_indicators(df: pd.DataFrame, blocks: list[dict]) -> pd.DataFrame:
    """
    Given a DataFrame with columns [open, high, low, close, volume]
    and a list of strategy blocks, compute only the indicators referenced.
    """
    block_types = {b.get("type", "").upper() for b in blocks}
    block_labels = {b.get("label", "").upper() for b in blocks}
    all_text = " ".join(block_types | block_labels)

    # RSI (default period 14)
    if "RSI" in all_text:
        period = _extract_period(all_text, "RSI", default=14)
        df["rsi"] = ta.momentum.rsi(df["close"], window=period)

    # MACD
    if "MACD" in all_text:
        macd_obj = ta.trend.MACD(df["close"])
        df["macd"] = macd_obj.macd()
        df["macd_signal"] = macd_obj.macd_signal()
        df["macd_diff"] = macd_obj.macd_diff()

    # SMA — detect period from block text like "SMA(50)", "MA(200)", "SMA 50"
    for period in _extract_all_periods(all_text, ["SMA", "MA"], default=50):
        col = f"sma_{period}"
        df[col] = ta.trend.sma_indicator(df["close"], window=period)

    # EMA
    for period in _extract_all_periods(all_text, ["EMA"], default=20):
        col = f"ema_{period}"
        df[col] = ta.trend.ema_indicator(df["close"], window=period)

    # Bollinger Bands
    if "BOLLINGER" in all_text or "BB" in all_text:
        bb = ta.volatility.BollingerBands(df["close"], window=20, window_dev=2)
        df["bb_upper"] = bb.bollinger_hband()
        df["bb_lower"] = bb.bollinger_lband()
        df["bb_mid"] = bb.bollinger_mavg()
        df["bb_width"] = bb.bollinger_wband()

    # Volume average (20-day)
    if "VOLUME" in all_text or "VOL" in all_text:
        df["vol_avg_20"] = df["volume"].rolling(window=20).mean()
        df["vol_ratio"] = df["volume"] / df["vol_avg_20"]

    # ATR for volatility-based stops
    df["atr_14"] = ta.volatility.average_true_range(df["high"], df["low"], df["close"], window=14)

    # Always compute a simple trailing-stop helper (peak tracker)
    df["rolling_peak"] = df["close"].cummax()

    return df


def _extract_period(text: str, indicator: str, default: int) -> int:
    """Extract numeric period from text like 'RSI(14)', 'RSI 14', 'RSI14'."""
    patterns = [
        rf"{indicator}\s*\(\s*(\d+)\s*\)",
        rf"{indicator}\s*(\d+)",
        rf"{indicator}\(\s*(\d+)\s*\)",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return default


def _extract_all_periods(text: str, indicators: list[str], default: int) -> list[int]:
    """Extract all periods for a set of indicator names. Returns unique list."""
    periods = set()
    for ind in indicators:
        patterns = [
            rf"{ind}\s*\(\s*(\d+)\s*\)",
            rf"{ind}\s+(\d+)",
            rf"{ind}(\d+)",
        ]
        for pat in patterns:
            for m in re.finditer(pat, text, re.IGNORECASE):
                periods.add(int(m.group(1)))
    if not periods:
        periods.add(default)
    return sorted(periods)


# ---------------------------------------------------------------------------
# 2. SIGNAL GENERATION
# ---------------------------------------------------------------------------

def _parse_condition(block: dict) -> callable:
    """
    Convert a strategy block into a callable that takes a DataFrame row
    and returns True/False.
    """
    btype = block.get("type", "").upper().strip()
    label = block.get("label", "").upper().strip()
    full = f"{btype} {label}"

    # --- RSI ---
    if "RSI" in btype:
        threshold = _extract_number(label, default=30)
        if "<" in label or "BELOW" in label or "UNDER" in label:
            return lambda row: _safe(row, "rsi") is not None and _safe(row, "rsi") < threshold
        elif ">" in label or "ABOVE" in label or "OVER" in label:
            return lambda row: _safe(row, "rsi") is not None and _safe(row, "rsi") > threshold
        else:
            return lambda row: _safe(row, "rsi") is not None and _safe(row, "rsi") < threshold

    # --- MACD ---
    if "MACD" in btype:
        if "BEAR" in label or "SELL" in label or "BELOW" in label:
            return lambda row: (
                _safe(row, "macd") is not None and
                _safe(row, "macd_signal") is not None and
                _safe(row, "macd") < _safe(row, "macd_signal")
            )
        else:
            return lambda row: (
                _safe(row, "macd") is not None and
                _safe(row, "macd_signal") is not None and
                _safe(row, "macd") > _safe(row, "macd_signal")
            )

    # --- SMA / MA ---
    if "SMA" in btype or (btype == "MA" or "MA(" in btype):
        period = _extract_number(btype + label, default=50)
        col = f"sma_{int(period)}"
        if "BELOW" in label or "UNDER" in label or "DOWN" in label:
            return lambda row, c=col: _safe(row, c) is not None and row["close"] < _safe(row, c)
        else:
            return lambda row, c=col: _safe(row, c) is not None and row["close"] > _safe(row, c)

    # --- EMA ---
    if "EMA" in btype:
        period = _extract_number(btype + label, default=20)
        col = f"ema_{int(period)}"
        if "BELOW" in label or "UNDER" in label or "DOWN" in label:
            return lambda row, c=col: _safe(row, c) is not None and row["close"] < _safe(row, c)
        else:
            return lambda row, c=col: _safe(row, c) is not None and row["close"] > _safe(row, c)

    # --- Bollinger Bands ---
    if "BOLLINGER" in btype or "BB" in btype:
        if "UPPER" in label or "ABOVE" in label:
            return lambda row: _safe(row, "bb_upper") is not None and row["close"] > _safe(row, "bb_upper")
        elif "SQUEEZE" in label:
            return lambda row: _safe(row, "bb_width") is not None and _safe(row, "bb_width") < 0.05
        else:
            return lambda row: _safe(row, "bb_lower") is not None and row["close"] <= _safe(row, "bb_lower")

    # --- Volume ---
    if "VOLUME" in btype or "VOL" in btype:
        multiplier = _extract_number(label, default=2)
        if multiplier > 10:
            multiplier = 2
        return lambda row, m=multiplier: _safe(row, "vol_ratio") is not None and _safe(row, "vol_ratio") > m

    # --- Support / Bounce ---
    if "SUPPORT" in btype:
        return lambda row: row["close"] <= row["low"] * 1.01

    # --- Alternative Data ---
    if "TREND" in btype or "GOOGLE" in btype:
        threshold = _extract_number(label, default=50)
        if ">" in label or "SPIKE" in label or "HIGH" in label:
            return lambda row: _safe(row, "google_trends") is not None and _safe(row, "google_trends") > threshold
        else:
            return lambda row: _safe(row, "google_trends") is not None and _safe(row, "google_trends") < threshold

    if "SATELLITE" in btype or "PARKING" in btype:
        threshold = _extract_number(label, default=1000)
        if ">" in label or "HIGH" in label or "FULL" in label:
            return lambda row: _safe(row, "satellite_count") is not None and _safe(row, "satellite_count") > threshold
        else:
            return lambda row: _safe(row, "satellite_count") is not None and _safe(row, "satellite_count") < threshold

    if "FOOT" in btype or "TRAFFIC" in btype:
        threshold = _extract_number(label, default=50)
        if ">" in label or "HIGH" in label or "SPIKE" in label:
            return lambda row: _safe(row, "foot_traffic") is not None and _safe(row, "foot_traffic") > threshold
        else:
            return lambda row: _safe(row, "foot_traffic") is not None and _safe(row, "foot_traffic") < threshold

    # --- Trailing Stop --- (handled separately in simulation, not as entry signal)
    if "TRAILING" in btype or "STOP" in btype:
        return None

    # --- Fallback: always False (unknown block) ---
    return lambda row: False


def _extract_number(text: str, default: float) -> float:
    """Extract the first number from text."""
    m = re.search(r"(\d+\.?\d*)", text)
    return float(m.group(1)) if m else default


def _safe(row, col):
    """Safely get a value from a row, returning None if NaN or missing."""
    try:
        v = row[col]
        if pd.isna(v):
            return None
        return v
    except (KeyError, TypeError):
        return None


def generate_signals(df: pd.DataFrame, blocks: list[dict]) -> list[dict]:
    """
    Walk through each row and check if ALL entry conditions are met.
    Uses AND logic: all conditions must be true simultaneously for a BUY signal.
    Exit signal: when ANY condition flips to false after being in a position.
    """
    entry_conditions = []
    has_trailing_stop = False
    use_atr_stop = False
    atr_multiplier = 2.0
    trailing_pct = 5.0

    for block in blocks:
        btype = block.get("type", "").upper()
        label = block.get("label", "5").upper()
        if "TRAILING" in btype or "STOP" in btype:
            has_trailing_stop = True
            if "ATR" in label:
                use_atr_stop = True
                atr_multiplier = _extract_number(label, default=2.0)
            else:
                trailing_pct = _extract_number(label, default=5.0)
        else:
            cond = _parse_condition(block)
            if cond is not None:
                entry_conditions.append((block, cond))

    if not entry_conditions:
        return []

    signals = []
    in_position = False
    entry_price = 0
    peak_since_entry = 0

    for i in range(len(df)):
        row = df.iloc[i]
        date = row["date"] if "date" in df.columns else df.index[i]

        all_met = all(cond(row) for _, cond in entry_conditions)

        if not in_position:
            if all_met:
                signals.append({
                    "date": str(date),
                    "action": "BUY",
                    "price": round(row["close"], 2),
                    "atr": _safe(row, "atr_14") or (row["close"] * 0.05),
                    "reason": " + ".join(f"{b['type']} {b['label']}" for b, _ in entry_conditions)
                })
                in_position = True
                entry_price = row["close"]
                peak_since_entry = row["close"]
        else:
            peak_since_entry = max(peak_since_entry, row["close"])

            if has_trailing_stop:
                if use_atr_stop:
                    current_atr = _safe(row, "atr_14") or (row["close"] * 0.02) # Fallback to 2% volatility
                    stop_price = peak_since_entry - (atr_multiplier * current_atr)
                    if row["close"] <= stop_price:
                        signals.append({
                            "date": str(date),
                            "action": "SELL",
                            "price": round(row["close"], 2),
                            "reason": f"ATR Trailing Stop ({atr_multiplier}x)"
                        })
                        in_position = False
                        continue
                else:
                    drop_from_peak = ((peak_since_entry - row["close"]) / peak_since_entry) * 100
                    if drop_from_peak >= trailing_pct:
                        signals.append({
                            "date": str(date),
                            "action": "SELL",
                            "price": round(row["close"], 2),
                            "reason": f"Trailing Stop ({trailing_pct}%)"
                        })
                        in_position = False
                        continue

            if not all_met:
                signals.append({
                    "date": str(date),
                    "action": "SELL",
                    "price": round(row["close"], 2),
                    "reason": "Conditions no longer met"
                })
                in_position = False

    if in_position:
        last_row = df.iloc[-1]
        date = last_row["date"] if "date" in df.columns else df.index[-1]
        signals.append({
            "date": str(date),
            "action": "SELL",
            "price": round(last_row["close"], 2),
            "reason": "End of backtest period"
        })

    return signals


# ---------------------------------------------------------------------------
# 3. TRADE SIMULATION (with costs + slippage)
# ---------------------------------------------------------------------------

def simulate_trades(
    df: pd.DataFrame,
    signals: list[dict],
    blocks: list[dict],
    capital: float = 100000,
    include_costs: bool = True,
    slippage_pct: float = 0.05
) -> dict:
    """
    Simulate trades with realistic transaction costs and slippage.
    Returns metrics, equity curve, and trade log.
    """
    starting_capital = capital
    current_capital = capital
    shares = 0
    in_position = False
    total_costs = 0.0

    trades = []
    trade_log = []
    equity_curve = []
    entry_info = None

    sizing_type = "ALL"
    risk_pct = 1.0

    if blocks:
        for block in blocks:
            btype = block.get("type", "").upper()
            if "SIZE" in btype or "POSITION" in btype:
                label = block.get("label", "").upper()
                if "RISK" in label:
                    sizing_type = "RISK"
                    risk_pct = _extract_number(label, 1.0) / 100.0
                else:
                    sizing_type = "FIXED"
                    risk_pct = _extract_number(label, 100.0) / 100.0

    for sig in signals:
        if sig["action"] == "BUY" and not in_position:
            exec_price = apply_slippage(sig["price"], "BUY", slippage_pct) if include_costs else sig["price"]
            
            if sizing_type == "FIXED":
                allocated_capital = current_capital * risk_pct
                shares = math.floor(allocated_capital / exec_price)
            elif sizing_type == "RISK":
                atr = sig.get("atr", exec_price * 0.05)
                shares_by_risk = (current_capital * risk_pct) / max(atr, 0.01)
                shares_by_cap = current_capital / exec_price
                shares = math.floor(min(shares_by_risk, shares_by_cap))
            else:
                shares = math.floor(current_capital / exec_price)

            if shares <= 0:
                continue
            cost_basis = shares * exec_price
            txn_cost = TransactionCosts.calculate(exec_price, shares, "BUY") if include_costs else 0
            total_costs += txn_cost
            current_capital -= (cost_basis + txn_cost)
            in_position = True
            entry_info = {"date": sig["date"], "price": exec_price, "shares": shares, "cost": txn_cost}

            trade_log.append({
                "date": sig["date"],
                "action": "BUY",
                "price": exec_price,
                "pnl": 0,
                "reason": sig.get("reason", ""),
                "txnCost": txn_cost,
            })

        elif sig["action"] == "SELL" and in_position:
            exec_price = apply_slippage(sig["price"], "SELL", slippage_pct) if include_costs else sig["price"]
            revenue = shares * exec_price
            txn_cost = TransactionCosts.calculate(exec_price, shares, "SELL") if include_costs else 0
            total_costs += txn_cost
            gross_pnl = revenue - (entry_info["shares"] * entry_info["price"])
            net_pnl = gross_pnl - txn_cost - entry_info["cost"]
            current_capital += (revenue - txn_cost)
            in_position = False

            trades.append({
                "entry_date": entry_info["date"],
                "entry_price": entry_info["price"],
                "exit_date": sig["date"],
                "exit_price": exec_price,
                "shares": entry_info["shares"],
                "pnl": round(net_pnl, 2),
                "return_pct": round((net_pnl / (entry_info["shares"] * entry_info["price"])) * 100, 2),
                "txn_costs": round(txn_cost + entry_info["cost"], 2),
            })

            trade_log.append({
                "date": sig["date"],
                "action": "SELL",
                "price": exec_price,
                "pnl": round(net_pnl, 2),
                "reason": sig.get("reason", ""),
                "txnCost": txn_cost,
            })

            shares = 0
            entry_info = None

    # --- Compute equity curve ---
    running_capital = starting_capital
    running_shares = 0
    signal_idx = 0
    sample_rate = max(1, len(df) // 60)

    for i, (_, row) in enumerate(df.iterrows()):
        d = row["date"] if "date" in df.columns else str(row.name)

        while signal_idx < len(signals) and signals[signal_idx]["date"] == str(d):
            s = signals[signal_idx]
            if s["action"] == "BUY" and running_shares == 0:
                ep = apply_slippage(s["price"], "BUY", slippage_pct) if include_costs else s["price"]
                buyable = math.floor(running_capital / ep)
                if buyable > 0:
                    tc = TransactionCosts.calculate(ep, buyable, "BUY") if include_costs else 0
                    running_shares = buyable
                    running_capital -= (buyable * ep + tc)
            elif s["action"] == "SELL" and running_shares > 0:
                ep = apply_slippage(s["price"], "SELL", slippage_pct) if include_costs else s["price"]
                tc = TransactionCosts.calculate(ep, running_shares, "SELL") if include_costs else 0
                running_capital += (running_shares * ep - tc)
                running_shares = 0
            signal_idx += 1

        if i % sample_rate == 0:
            portfolio_value = running_capital + (running_shares * row["close"])
            equity_curve.append({
                "date": str(d),
                "equity": round(portfolio_value, 2),
            })

    # --- Compute metrics ---
    total_trades = len(trades)
    if total_trades == 0:
        return {
            "metrics": {
                "totalReturn": 0, "winRate": 0, "maxDrawdown": 0,
                "sharpeRatio": 0, "totalTrades": 0,
                "startingCapital": starting_capital,
                "endingCapital": starting_capital,
                "totalCosts": 0, "costImpact": 0,
            },
            "equityCurve": equity_curve,
            "tradeLog": trade_log,
        }

    wins = sum(1 for t in trades if t["pnl"] > 0)
    win_rate = round((wins / total_trades) * 100, 1)

    ending_capital = current_capital + (shares * df.iloc[-1]["close"] if in_position else 0)
    total_return = round(((ending_capital - starting_capital) / starting_capital) * 100, 2)

    # Cost impact: how much % return was eaten by costs
    cost_impact = round((total_costs / starting_capital) * 100, 2)

    # Max Drawdown
    max_dd = 0
    peak_equity = 0
    for pt in equity_curve:
        if pt["equity"] > peak_equity:
            peak_equity = pt["equity"]
        if peak_equity > 0:
            dd = ((peak_equity - pt["equity"]) / peak_equity) * 100
            if dd > max_dd:
                max_dd = dd

    # Sharpe Ratio (annualized)
    if total_trades > 1:
        returns = [t["return_pct"] for t in trades]
        avg_ret = np.mean(returns)
        std_ret = np.std(returns)
        sharpe = round((avg_ret / std_ret) * math.sqrt(252 / max(1, total_trades)), 2) if std_ret > 0 else 0
    else:
        sharpe = 0

    # Profit Factor
    gross_profit = sum(t["pnl"] for t in trades if t["pnl"] > 0)
    gross_loss = abs(sum(t["pnl"] for t in trades if t["pnl"] < 0))
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else float('inf')

    # Average trade duration (in days, estimated)
    avg_hold = 0
    if trades:
        durations = []
        for t in trades:
            try:
                entry_dt = pd.to_datetime(t["entry_date"])
                exit_dt = pd.to_datetime(t["exit_date"])
                durations.append((exit_dt - entry_dt).days)
            except Exception:
                pass
        if durations:
            avg_hold = round(np.mean(durations), 1)

    return {
        "metrics": {
            "totalReturn": total_return,
            "winRate": win_rate,
            "maxDrawdown": round(-max_dd, 2),
            "sharpeRatio": sharpe,
            "totalTrades": total_trades,
            "startingCapital": starting_capital,
            "endingCapital": round(ending_capital, 2),
            "totalCosts": round(total_costs, 2),
            "costImpact": cost_impact,
            "profitFactor": profit_factor,
            "avgHoldDays": avg_hold,
        },
        "equityCurve": equity_curve,
        "tradeLog": trade_log,
    }


# ---------------------------------------------------------------------------
# 4. WALK-FORWARD VALIDATION
# ---------------------------------------------------------------------------

def walk_forward_test(
    df: pd.DataFrame,
    blocks: list[dict],
    capital: float = 100000,
    train_pct: float = 0.7,
) -> dict:
    """
    Split data into train (70%) and test (30%) windows.
    Run backtest on both to detect overfitting.
    Returns both results + an overfitting score.
    """
    split_idx = int(len(df) * train_pct)
    df_train = df.iloc[:split_idx].copy().reset_index(drop=True)
    df_test = df.iloc[split_idx:].copy().reset_index(drop=True)

    # Run on training data
    df_train = compute_indicators(df_train, blocks)
    train_signals = generate_signals(df_train, blocks)
    train_result = simulate_trades(df_train, train_signals, blocks, capital)

    # Run on test data
    df_test = compute_indicators(df_test, blocks)
    test_signals = generate_signals(df_test, blocks)
    test_result = simulate_trades(df_test, test_signals, blocks, capital)

    # Compute overfitting score (0-100)
    # If test return is much worse than train, strategy is likely overfit
    train_ret = train_result["metrics"]["totalReturn"]
    test_ret = test_result["metrics"]["totalReturn"]

    if train_ret > 0:
        consistency = (test_ret / train_ret) * 100 if train_ret != 0 else 0
        consistency = max(0, min(100, consistency))
    else:
        # Both negative or train is negative
        consistency = 50 if test_ret <= train_ret else 80

    # Grade the strategy
    if consistency >= 70:
        grade = "Robust"
        grade_color = "green"
    elif consistency >= 40:
        grade = "Moderate"
        grade_color = "amber"
    else:
        grade = "Overfit Risk"
        grade_color = "red"

    return {
        "trainMetrics": train_result["metrics"],
        "testMetrics": test_result["metrics"],
        "trainPeriod": {
            "start": str(df_train.iloc[0]["date"]) if "date" in df_train.columns else "",
            "end": str(df_train.iloc[-1]["date"]) if "date" in df_train.columns else "",
            "dataPoints": len(df_train),
        },
        "testPeriod": {
            "start": str(df_test.iloc[0]["date"]) if "date" in df_test.columns else "",
            "end": str(df_test.iloc[-1]["date"]) if "date" in df_test.columns else "",
            "dataPoints": len(df_test),
        },
        "consistency": round(consistency, 1),
        "grade": grade,
        "gradeColor": grade_color,
    }


# ---------------------------------------------------------------------------
# 5. ORCHESTRATOR
# ---------------------------------------------------------------------------

def run_real_backtest(
    data: list[dict],
    blocks: list[dict],
    capital: float = 100000,
    include_costs: bool = True,
    include_walkforward: bool = True,
) -> dict:
    """
    Main entry point. Takes raw OHLCV data and strategy blocks,
    returns complete backtest results with costs and walk-forward analysis.
    """
    df = pd.DataFrame(data)

    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["close"])

    if len(df) < 20:
        return {
            "metrics": {
                "totalReturn": 0, "winRate": 0, "maxDrawdown": 0,
                "sharpeRatio": 0, "totalTrades": 0,
                "startingCapital": capital, "endingCapital": capital,
                "totalCosts": 0, "costImpact": 0,
                "profitFactor": 0, "avgHoldDays": 0,
            },
            "equityCurve": [],
            "tradeLog": [],
            "walkForward": None,
        }

    # Step 1: Compute indicators
    df = compute_indicators(df, blocks)

    # Step 2: Generate signals
    signals = generate_signals(df, blocks)

    # Step 3: Simulate trades with costs
    result = simulate_trades(df, signals, blocks, capital, include_costs=include_costs)

    # Step 4: Walk-forward validation (needs enough data)
    wf_result = None
    if include_walkforward and len(df) >= 60:
        try:
            df_wf = pd.DataFrame(data)
            for col in ["open", "high", "low", "close", "volume"]:
                df_wf[col] = pd.to_numeric(df_wf[col], errors="coerce")
            df_wf = df_wf.dropna(subset=["close"])
            wf_result = walk_forward_test(df_wf, blocks, capital)
        except Exception as e:
            print(f"⚠️ Walk-forward test failed: {e}")
            wf_result = None

    result["walkForward"] = wf_result
    return result
