#!/usr/bin/env python3
"""
Saturdoom — Daily + weekly market data fetcher.
Downloads daily closes, saves both the raw daily series and the weekly summary.
"""

import json
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import yfinance as yf

# ---------- CONFIG ----------
SYMBOLS = {
    "energy": "XLE",
    "tech":   "XLK",
    "brent":  "BZ=F",
    "wti":    "CL=F",
    "usd":    "DX-Y.NYB",
}

START_DATE = "2026-01-01"
REQUEST_DELAY = 3
OUTPUT = Path("data/market_data.json")


def fetch_daily_prices() -> pd.DataFrame:
    """Download daily closes for each symbol."""
    series = {}
    for key, symbol in SYMBOLS.items():
        print(f"→ Fetching {symbol} ({key}) ...")
        ticker = yf.Ticker(symbol)
        df = ticker.history(start=START_DATE, interval="1d", auto_adjust=False)
        if df.empty:
            print(f"  ⚠ No data for {symbol}")
            continue
        df.index = df.index.tz_localize(None)
        series[key] = df["Close"]
        time.sleep(REQUEST_DELAY)

    combined = pd.DataFrame(series).sort_index()
    combined = combined.dropna(how="all")
    return combined


def build_daily(df: pd.DataFrame) -> list[dict]:
    """Serialize the daily closes (only trading days)."""
    out = []
    for date, row in df.iterrows():
        def r(v):
            return None if pd.isna(v) else round(float(v), 2)
        out.append({
            "date":   date.strftime("%Y-%m-%d"),
            "energy": r(row.get("energy")),
            "tech":   r(row.get("tech")),
            "brent":  r(row.get("brent")),
            "wti":    r(row.get("wti")),
            "usd":    r(row.get("usd")),
        })
    return out


def build_weeks(df: pd.DataFrame) -> list[dict]:
    """Weekly (Fri-Fri) percentage change, derived from daily closes."""
    weekly = df.resample("W-FRI").last()
    perf = weekly.pct_change() * 100

    weeks = []
    for friday in perf.index:
        row = perf.loc[friday]
        if row.isna().all():
            continue

        monday = friday - pd.Timedelta(days=4)
        saturday = friday + pd.Timedelta(days=1)

        def r(v):
            return None if pd.isna(v) else round(float(v), 2)

        weeks.append({
            "date":   monday.strftime("%Y-%m-%d"),
            "scan":   saturday.strftime("%m-%d"),
            "energy": r(row.get("energy")),
            "tech":   r(row.get("tech")),
            "brent_w": r(row.get("brent")),
            "wti_w":   r(row.get("wti")),
            "usd_w":   r(row.get("usd")),
        })

    weeks.reverse()
    return weeks


def main():
    print("Saturdoom — fetching market data …")
    df = fetch_daily_prices()
    if df.empty:
        raise SystemExit("No data downloaded; aborting.")

    daily = build_daily(df)
    weeks = build_weeks(df)
    print(f"→ {len(daily)} daily rows, {len(weeks)} weekly entries.")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "daily": daily,
        "weeks": weeks,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"✓ Written to {OUTPUT}")


if __name__ == "__main__":
    main()