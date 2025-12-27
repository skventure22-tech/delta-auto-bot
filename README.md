# Delta Auto Margin Crypto Trading Bot

A fully autonomous, production-grade crypto margin trading system designed for cloud deployment.  
Integrates directly with **Delta Exchange REST API** and maintains persistent **WebSocket feeds** for real-time market monitoring.

## Core Capabilities
- Supported assets: **Bitcoin (BTC)** and **Ethereum (ETH)**
- Markets: **Futures** and **Options**
- Leverage governance: **50x** and **100x** (with margin-based 100x auto-disable policy)
- Risk engine:
  - Hard Stop-Loss at **-300 INR**
  - Take-Profit at **+600 INR**
  - Trailing stop activates between **+300 to +600 INR**
  - Volatility guard blocks entries if 1-minute wick exceeds **1.2%**
- Order execution: **Fully automatic** (no manual Buy/Sell)
- Resilience:
  - Auto-reconnect for API and WebSocket disconnects
  - Structured logging without dashboard crashes
- Secure API credential storage (encrypted, never exposed to frontend)

## System Roles
- **Admin**: Monitoring dashboard, user balances, open positions, logs, and emergency kill switch
- **User**: API input interface, encrypted storage, read-only live trade view

## Deployment Targets
Optimized for **shared hosting dashboards** (PHP) with trading workers running on cloud tiers such as:
- Render
- Railway
- Fly.io
- PythonAnywhere

## Security Notes
- API keys are stored using encryption and loaded only from server environment variables
- `.env` is intentionally excluded from version control

---

**This repository contains only the trading worker and backend sync layer. Frontend dashboards are managed separately on Hostinger.**
