function detectOpportunities() {
    const apiKey = document.getElementById("api_key").value.trim();
    const apiSecret = document.getElementById("api_secret").value.trim();

    if (apiKey === "" || apiSecret === "") {
        alert("Please enter your Binance API key and secret.");
        return;
    }

    const apiUrl = "https://api.binance.com";
    const apiVersion = "v3";
    const timestamp = Date.now();

    const xhr1 = new XMLHttpRequest();
    const xhr2 = new XMLHttpRequest();
    const xhr3 = new XMLHttpRequest();

    xhr1.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            const symbols = JSON.parse(this.responseText);
            const pairs = [];

            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i].symbol;

                if (symbol.endsWith("BTC") || symbol.endsWith("ETH") || symbol.endsWith("USDT")) {
                    pairs.push(symbol);
                }
            }

            const opportunities = [];

            for (let i = 0; i < pairs.length; i++) {
                for (let j = 0; j < pairs.length; j++) {
                    if (j !== i) {
                        const pair1 = pairs[i];
                        const pair2 = pairs[j];
                        const pair3 = pair2.substring(0, pair2.length - 3) + pair1.substring(pair1.length - 3);

                        xhr2.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                const ticker2 = JSON.parse(this.responseText).price;

                                xhr3.onreadystatechange = function () {
                                    if (this.readyState === 4 && this.status === 200) {
                                        const ticker3 = JSON.parse(this.responseText).price;

                                        const rate1 = 1;
                                        const
