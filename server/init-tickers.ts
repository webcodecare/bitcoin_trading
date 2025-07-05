// Script to initialize popular cryptocurrency tickers in the database
import { db } from './db';
import { storage } from './storage';

const popularTickers = [
  { symbol: "BTCUSDT", description: "Bitcoin / Tether USD" },
  { symbol: "ETHUSDT", description: "Ethereum / Tether USD" },
  { symbol: "BNBUSDT", description: "Binance Coin / Tether USD" },
  { symbol: "ADAUSDT", description: "Cardano / Tether USD" },
  { symbol: "SOLUSDT", description: "Solana / Tether USD" },
  { symbol: "XRPUSDT", description: "Ripple / Tether USD" },
  { symbol: "DOTUSDT", description: "Polkadot / Tether USD" },
  { symbol: "MATICUSDT", description: "Polygon / Tether USD" },
  { symbol: "LINKUSDT", description: "Chainlink / Tether USD" },
  { symbol: "AVAXUSDT", description: "Avalanche / Tether USD" },
  { symbol: "LTCUSDT", description: "Litecoin / Tether USD" },
  { symbol: "UNIUSDT", description: "Uniswap / Tether USD" },
  { symbol: "ATOMUSDT", description: "Cosmos / Tether USD" },
  { symbol: "VETUSDT", description: "VeChain / Tether USD" },
  { symbol: "FILUSDT", description: "Filecoin / Tether USD" },
  { symbol: "TRXUSDT", description: "TRON / Tether USD" },
  { symbol: "ETCUSDT", description: "Ethereum Classic / Tether USD" },
  { symbol: "XLMUSDT", description: "Stellar / Tether USD" },
  { symbol: "AAVEUSDT", description: "Aave / Tether USD" },
  { symbol: "EOSUSDT", description: "EOS / Tether USD" },
];

async function initializeTickers() {
  console.log('Initializing cryptocurrency tickers...');
  
  try {
    // Get existing tickers to avoid duplicates
    const existingTickers = await storage.getAllTickers();
    const existingSymbols = new Set(existingTickers.map(t => t.symbol));
    
    let addedCount = 0;
    
    for (const ticker of popularTickers) {
      if (!existingSymbols.has(ticker.symbol)) {
        await storage.createTicker({
          symbol: ticker.symbol,
          description: ticker.description,
          isEnabled: true,
        });
        console.log(`Added: ${ticker.symbol} - ${ticker.description}`);
        addedCount++;
      } else {
        console.log(`Skipped: ${ticker.symbol} (already exists)`);
      }
    }
    
    console.log(`\nInitialization complete!`);
    console.log(`Total tickers added: ${addedCount}`);
    console.log(`Total tickers in system: ${existingTickers.length + addedCount}`);
    
  } catch (error) {
    console.error('Error initializing tickers:', error);
  }
}

// This module exports the initialization function to be called from server startup

export { initializeTickers };