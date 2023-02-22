<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Binance Triangular Arbitrage Opportunity Scanner</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <div class="container">
      <h1>Binance Triangular Arbitrage Opportunity Scanner</h1>
      <form id="form">
        <div class="form-group">
          <label for="api_key">API Key:</label>
          <input type="text" name="api_key" id="api_key" />
        </div>
        <div class="form-group">
          <label for="api_secret">API Secret:</label>
          <input type="text" name="api_secret" id="api_secret" />
        </div>
        <button type="submit">Detect Opportunities</button>
      </form>
      <div id="opportunities"></div>
    </div>
    <script src="./script.js"></script>
  </body>
</html>
