"""
Prizm Database Layer
SQLite-backed storage for stock master list and cached OHLC price data.
Uses aiosqlite for async access from FastAPI.
"""
from __future__ import annotations

import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "prizm_data.db")


async def get_db():
    """Get a database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        # Master list of all available stocks
        await db.execute("""
            CREATE TABLE IF NOT EXISTS stocks (
                symbol TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                exchange TEXT NOT NULL,
                sector TEXT DEFAULT '',
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Cached OHLC price data
        await db.execute("""
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                date TEXT NOT NULL,
                open REAL,
                high REAL,
                low REAL,
                close REAL,
                volume INTEGER,
                UNIQUE(symbol, date)
            )
        """)

        # Leaderboard table for published strategies
        await db.execute("""
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT NOT NULL,
                symbol TEXT NOT NULL,
                blocks_json TEXT NOT NULL,
                win_rate REAL NOT NULL,
                total_return REAL NOT NULL,
                max_drawdown REAL NOT NULL,
                total_trades INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Indexes for fast lookups
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_price_symbol 
            ON price_history(symbol)
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_price_symbol_date 
            ON price_history(symbol, date)
        """)
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_stocks_name 
            ON stocks(name)
        """)

        await db.commit()
    print("✅ Database initialized at", DB_PATH)


async def search_stocks(query: str, limit: int = 20):
    """Search stocks by symbol or company name (fuzzy)."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        search_term = f"%{query.upper()}%"
        cursor = await db.execute(
            """
            SELECT symbol, name, exchange 
            FROM stocks 
            WHERE UPPER(symbol) LIKE ? OR UPPER(name) LIKE ?
            ORDER BY 
                CASE 
                    WHEN UPPER(symbol) LIKE ? THEN 0 
                    ELSE 1 
                END,
                LENGTH(symbol)
            LIMIT ?
            """,
            (search_term, search_term, f"{query.upper()}%", limit)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_cached_history(symbol: str, start_date: str = None):
    """Retrieve cached price history for a stock."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if start_date:
            cursor = await db.execute(
                """
                SELECT date, open, high, low, close, volume 
                FROM price_history 
                WHERE symbol = ? AND date >= ?
                ORDER BY date ASC
                """,
                (symbol, start_date)
            )
        else:
            cursor = await db.execute(
                """
                SELECT date, open, high, low, close, volume 
                FROM price_history 
                WHERE symbol = ?
                ORDER BY date ASC
                """,
                (symbol,)
            )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def get_cache_freshness(symbol: str):
    """Get the most recent date in cache for a symbol. Returns None if no data."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT MAX(date) as latest FROM price_history WHERE symbol = ?",
            (symbol,)
        )
        row = await cursor.fetchone()
        return row[0] if row and row[0] else None


async def cache_stock_data(symbol: str, data: list[dict]):
    """Insert or replace OHLC data into the cache."""
    if not data:
        return
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executemany(
            """
            INSERT OR REPLACE INTO price_history 
            (symbol, date, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (symbol, d["date"], d["open"], d["high"], d["low"], d["close"], d["volume"])
                for d in data
            ]
        )
        await db.commit()


async def load_stock_master_list(csv_path: str):
    """Load stock master list from CSV into the database."""
    import csv

    async with aiosqlite.connect(DB_PATH) as db:
        # Check if already populated (informational only)
        cursor = await db.execute("SELECT COUNT(*) FROM stocks")
        count = (await cursor.fetchone())[0]
        if count > 0:
            print(f"📋 Current DB has {count} stocks. Syncing with CSV...")

        # Load from CSV
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = []
            for row in reader:
                rows.append((
                    row["symbol"],
                    row["name"],
                    row["exchange"],
                    row.get("sector", "")
                ))

        await db.executemany(
            "INSERT OR IGNORE INTO stocks (symbol, name, exchange, sector) VALUES (?, ?, ?, ?)",
            rows
        )
        await db.commit()
        print(f"✅ Loaded {len(rows)} stocks into database")
        return len(rows)


async def get_stock_count():
    """Get total number of stocks in the master list."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT COUNT(*) FROM stocks")
        row = await cursor.fetchone()
        return row[0]

async def save_leaderboard_entry(author: str, symbol: str, blocks_json: str, metrics: dict, total_trades: int):
    """Save a strategy to the leaderboard."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO leaderboard 
            (author, symbol, blocks_json, win_rate, total_return, max_drawdown, total_trades)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (author, symbol, blocks_json, metrics.get("winRate", 0), metrics.get("totalReturn", 0), metrics.get("maxDrawdown", 0), total_trades)
        )
        await db.commit()

async def get_leaderboard_entries(limit: int = 50):
    """Fetch top strategies ranked by total return."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            """
            SELECT * FROM leaderboard
            ORDER BY total_return DESC
            LIMIT ?
            """,
            (limit,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

