<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Binance Triangular Arbitrage Opportunity Detector</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body>
    <h1>Binance Triangular Arbitrage Opportunity Detector</h1>
    <form>
        <label for="api_key">API Key:</label>
        <input type="text" name="api_key" id="api_key">
        <label for="api_secret">API Secret:</label>
        <input type="text" name="api_secret" id="api_secret">
        <button type="button" onclick="detectOpportunities()">Detect Opportunities</button>
    </form>
    <div id="opportunities"></div>
</body>
</html>
