const form = document.getElementById('form');
const apiKeyInput = document.getElementById('api_key');
const apiSecretInput = document.getElementById('api_secret');
const opportunitiesDiv = document.getElementById('opportunities');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const apiKey = apiKeyInput.value;
  const apiSecret = apiSecretInput.value;

  if (!apiKey || !apiSecret) {
    alert('Please enter API Key and API Secret!');
    return;
  }

  const binanceRest = new BinanceRest({
    key: apiKey,
    secret: apiSecret,
    recvWindow: 5000,
    timeout: 15000,
    disableBeautification: false,
    handleDrift: true,
  });

  binanceRest.exchangeInfo().then((res) => {
    const symbols = res.symbols;
    const filteredSymbols = symbols.filter(
      (symbol) => symbol.status === 'TRADING' && symbol.quoteAsset === 'USDT'
    );
    const pairs = filteredSymbols.map((symbol) => symbol.baseAsset);
    const combinations = generateCombinations(pairs, 3);
    const opportunities = [];

    combinations.forEach((combination) => {
      const symbol1 = combination[0] + 'USDT';
      const symbol2 = combination[1] + 'USDT';
      const symbol3 = combination[2] + 'USDT';

      binanceRest.trades({ symbol: symbol1 }).then((res1) => {
        if (res1.length === 0) {
          return;
        }

        const buyPrice1 = parseFloat(res1[0].price);

        binanceRest.trades({ symbol: symbol2 }).then((res2) => {
          if (res2.length === 0) {
            return;
          }

          const buyPrice2 = parseFloat(res2[0].price);

          binanceRest.trades({ symbol: symbol3 }).then((res3) => {
            if (res3.length === 0) {
              return;
            }

            const buyPrice3 = parseFloat(res3[0].price);

            const sellPrice = (buyPrice1 / buyPrice2) * (buyPrice2 / buyPrice3) * buyPrice3;

            const profit =
              ((sellPrice / buyPrice1) * 100 - 100) -
              ((sellPrice / buyPrice1) * 100 * 0.1 + (sellPrice / buyPrice2) * 100 * 0.1 + (sellPrice / buyPrice3) * 100 * 0.1);

            if (profit > 0) {
              opportunities.push({
                combination: combination,
                profit: profit.toFixed(2),
                symbol1: symbol1,
                symbol2: symbol2,
                symbol3: symbol3,
                buyPrice1: buyPrice1.toFixed(4),
                buyPrice2: buyPrice2.toFixed(4),
                buyPrice3: buyPrice3.toFixed(4),
                sellPrice: sellPrice.toFixed(4),
              });
            }
          });
        });
      });
    });

setTimeout(() => {
  opportunities.sort((a, b) => b.profit - a.profit);

  let html = '<h2>Opportunities:</h2>';

  if (opportunities.length === 0) {
    html += '<p>No opportunities found.</p>';
  } else {
    html += '<table>';
    html += '<thead><tr><th>Symbol 1</th><th>Symbol 2</th><th>Symbol 3</th><th>Profit (%)</th></tr></thead>';
    html += '<tbody>';

    opportunities.forEach((opportunity) => {
      html += '<tr>';
      html += `<td>${opportunity.symbol1}</td>`;
      html += `<td>${opportunity.symbol2}</td>`;
      html += `<td>${opportunity.symbol3}</td>`;
      html += `<td>${opportunity.profit.toFixed(2)}%</td>`;
      html += '</tr>';
    });

    html += '</tbody>';
    html += '</table>';
  }

  opportunitiesDiv.innerHTML = html;
}, 5000);
