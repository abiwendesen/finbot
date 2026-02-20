# FinBot

FinBot is a Telegram bot that provides:
- Foreign exchange rates from Ethiopian banks and forex providers
- Crypto market prices from CoinGecko
- 7-day crypto price charts as generated images

The bot is designed for quick lookups inside Telegram using simple commands.

## What The Bot Does

### 1. Ethiopian Forex Rates
FinBot fetches daily exchange rates for selected currencies from multiple sources and returns buying/selling data in ETB.

Supported providers in the current implementation:
- Commercial Bank of Ethiopia (CBE)
- National Bank of Ethiopia (NBE)
- Awash Bank
- Oromia Bank
-  DBH endpoint
- Global Forex Bureau

### 2. Crypto Prices + Chart Image
The `/price` command retrieves crypto market data from CoinGecko and sends a chart image to Telegram.

- Input: coin name and quote currency
- Example: `/price bitcoin usd`
- Output: a chart image of the last 7 days of price data

## Bot Commands

- `/start` : Start the bot
- `/help` : Show usage help
- `/price <coin> <currency>` : Crypto chart image (7 days)
- `/cbe <currency_code>` : CBE exchange rate
- `/nbe <currency_code>` : NBE exchange rate
- `/awash <currency_code>` : Awash Bank exchange rate
- `/oromia <currency_code>` : Oromia Bank exchange rate
- `/dbh <currency_code>` : DBH exchange rate
- `/global <currency_code>` : Global Forex Bureau exchange rate

Examples:
- `/cbe usd`
- `/nbe eur`
- `/price ethereum usd`

## Tech Stack

- Node.js (ES Modules)
- [grammY](https://grammy.dev/) for Telegram bot interactions
- `node-fetch` for API requests
- `quickchart-js` for generating chart images
- `dotenv` for environment variable management
- `redis` for caching support (included in the project dependencies and ready to be enabled)

Additional packages used in the project include: `express`, `helmet`, `morgan`, `mysql2`, `node-cron`, and `xlsx`.

## Project Structure

- `bot.js` : Main Telegram bot logic and command handlers
- `README.md` : Project documentation
- `package.json` : Scripts and dependencies
- `.env` : Runtime configuration (local only, do not commit secrets)

## Setup

### 1. Clone and install
```bash
git clone https://github.com/abiwendesen/finbot.git
cd finbot
npm install
```

### 2. Configure environment variables
Create/update `.env` with the required keys:

```env
TELEGRAM_API_KEY=your_telegram_bot_token
API_KEY=optional_or_provider_specific
AWASH_URL=awash_endpoint
OROMIA_URL=oromia_endpoint
GLOBAL_FOREX_URL=global_forex_endpoint
DBH_URL=dbh_endpoint
```

### 3. Run the bot
```bash
npm start
```

Current `start` script runs:
```bash
nodemon bot.js
```

## Redis Usage

Redis is already added to dependencies and imported in the code. It is intended for caching frequently requested rates and reducing repeated API calls.

Typical use cases in this project:
- Cache recent forex responses for short periods
- Cache crypto lookups for faster repeated requests
- Reduce external API load and improve response speed

Note: the Redis connection block is currently scaffolded/commented in `bot.js` and can be enabled when you are ready to add active caching.

## Notes

- Currency inputs are expected as currency codes (for example: `USD`, `EUR`, `GBP`).
- Some providers publish rates daily, so availability may depend on source update time.
- Network/API issues are handled with error responses in Telegram.

## Future Improvements

- Enable full Redis caching flow
- Improve validation for unsupported currency codes
- Refactor command handlers into modular files
- Add tests for command parsing and API mapping
- Add richer chart options (time ranges and chart types)

## License

ISC
