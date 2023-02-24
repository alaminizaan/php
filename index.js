const BinanceRest = require('binance').default;
const binanceRest = new BinanceRest({
  apiKey: 'OtmdN18Tgx7VjnLyD4Ulc7ooNUaS0ezw38EZtTXvz0Eln4LxePIGCjOC95WG80OG',
  secretKey: 'ShmYzH63927bieEp6SgHTDXv3hlEdkiePHMsSpdXpbviKNJbGpPSS6M3YSTACq4u',
});

const calculateProfit = async (symbol1, symbol2, symbol3) => {
  try {
    const [
      trades1,
      trades2,
      trades3,
      ticker1,
      ticker2,
      ticker3,
    ] = await Promise.all([
      binanceRest.trades({ symbol: symbol1 }),
      binanceRest.trades({ symbol: symbol2 }),
      binanceRest.trades({ symbol: symbol3 }),
      binanceRest.tickerPrice({ symbol: symbol1 }),
      binanceRest.tickerPrice({ symbol: symbol2 }),
      binanceRest.tickerPrice({ symbol: symbol3 }),
    ]);

    if (
      !trades1.length ||
      !trades2.length ||
      !trades3.length ||
      !ticker1.price ||
      !ticker2.price ||
      !ticker3.price
    ) {
      return null;
    }

    const buyPrice1 = parseFloat(trades1[0].price);
    const buyPrice2 = parseFloat(trades2[0].price);
    const buyPrice3 = parseFloat(trades3[0].price);
    const sellPrice =
      (buyPrice1 / buyPrice2) * (buyPrice2 / buyPrice3) * buyPrice3;

    const profit =
      ((sellPrice / buyPrice1) * 100 - 100) -
      ((sellPrice / buyPrice1) * 100 * 0.1 +
        (sellPrice / buyPrice2) * 100 * 0.1 +
        (sellPrice / buyPrice3) * 100 * 0.1);

    return {
      combination: `${symbol1} -> ${symbol2} -> ${symbol3}`,
      profit: profit.toFixed(2),
      buyPrice1: buyPrice1.toFixed(4),
      buyPrice2: buyPrice2.toFixed(4),
      buyPrice3: buyPrice3.toFixed(4),
      sellPrice: sellPrice.toFixed(4),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const scanAllPairs = async () => {
  try {
    const { symbols } = await binanceRest.exchangeInfo();
    const filteredSymbols = symbols.filter(
      (symbol) => symbol.status === 'TRADING' && symbol.quoteAsset === 'USDT'
    );
    const pairs = filteredSymbols.map((symbol) => symbol.baseAsset);
    const combinations = generateCombinations(pairs, 3);
    const opportunities = [];

    for (const combination of combinations) {
      const symbol1 = `${combination[0]}USDT`;
      const symbol2 = `${combination[1]}USDT`;
      const symbol3 = `${combination[2]}USDT`;

      const opportunity = await calculateProfit(symbol1, symbol2, symbol3);
      if (opportunity && opportunity.profit > 0) {
        opportunities.push(opportunity);
      }
      await sleep(100);
    }

    opportunities.sort((a, b) => b.profit - a.profit);
    console.log(opportunities);
  } catch (error) {
    console.error(error);
  }
};

const generateCombinations = (array, size) => {
  const combinations = [];
  const combination = [];

   const makeCombination = (startIndex, size) => {
    if (combination.length === size) {
      combinations.push([...combination]);
      return;
    }

    for (let i = startIndex; i < array.length; i++) {
      combination.push(array[i]);
      makeCombination(i + 1, size);
      combination.pop();
    }
  };

  for (let i = 1; i <= size; i++) {
    makeCombination(0, i);
  }

  return combinations;
};

scanAllPairs();

