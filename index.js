const Binance = require('binance-api-node').default;

const client = Binance({
  apiKey: 'OtmdN18Tgx7VjnLyD4Ulc7ooNUaS0ezw38EZtTXvz0Eln4LxePIGCjOC95WG80OG',
  apiSecret: 'ShmYzH63927bieEp6SgHTDXv3hlEdkiePHMsSpdXpbviKNJbGpPSS6M3YSTACq4u'
});

// use the client object to make API calls

const axios = require('axios');

const API_URL = 'https://api.binance.com/api/v3';

async function getSymbols() {
  try {
    const response = await axios.get(`${API_URL}/exchangeInfo`);
    const data = response.data;
    return data.symbols.map((symbol) => ({
      baseAsset: symbol.baseAsset,
      quoteAsset: symbol.quoteAsset,
    }));
  } catch (error) {
    console.error('Error getting symbols:', error);
    return [];
  }
}

async function getOrderBook(symbol) {
  try {
    const response = await axios.get(
      `${API_URL}/depth?symbol=${symbol.baseAsset}${symbol.quoteAsset}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(`Error getting order book for ${symbol.baseAsset}${symbol.quoteAsset}:`, error);
    return null;
  }
}

function findOpportunities(symbol, orderBook) {
  const baseAsset = symbol.baseAsset;
  const quoteAsset = symbol.quoteAsset;

  // Find the best buy price and quantity for the base asset
  let bestBuyPrice = Infinity;
  let bestBuyQty = 0;
  for (let bid of orderBook.bids) {
    let price = parseFloat(bid[0]);
    let qty = parseFloat(bid[1]);
    if (price < bestBuyPrice && qty > 0) {
      bestBuyPrice = price;
      bestBuyQty = qty;
    }
  }

  // Find the best sell price and quantity for the quote asset
  let bestSellPrice = 0;
  let bestSellQty = 0;
  for (let ask of orderBook.asks) {
    let price = parseFloat(ask[0]);
    let qty = parseFloat(ask[1]);
    if (price > bestSellPrice && qty > 0) {
      bestSellPrice = price;
      bestSellQty = qty;
    }
  }

  // Calculate the potential profit of a triangular arbitrage opportunity
  const usdtPrice = 1; // Assume USDT as the intermediate currency
  const btcPrice = bestBuyPrice * usdtPrice;
  const altPrice = bestSellPrice * usdtPrice;
  const profit = ((1 / btcPrice) * (1 / altPrice) - (1 / bestBuyPrice)) * bestBuyQty;

  // Check if there is a profitable opportunity
  if (profit > 0) {
    const opportunity = {
      baseAsset: baseAsset,
      quoteAsset: quoteAsset,
      profit: profit.toFixed(8),
    };
    return opportunity;
  }

  return null;
}

async function scanForOpportunities() {
  const symbols = await getSymbols();
  for (let symbol of symbols) {
    const orderBook = await getOrderBook(symbol);
    if (orderBook) {
      const opportunity = findOpportunities(symbol, orderBook);
      if (opportunity) {
        console.log(`Opportunity found for ${opportunity.baseAsset}${opportunity.quoteAsset}:`);
        console.log(`  Potential profit: ${opportunity.profit} ${opportunity.quoteAsset}`);
      }
    }
  }
}

setInterval(scanForOpportunities, 10000); // Check every 10 seconds
