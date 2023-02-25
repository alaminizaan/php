<?php

function calculate_profit_percentage($price1, $price2, $price3) {
    $product = $price1 * $price2 * $price3;
    $profit_percentage = (($product / 100000000) - 1) * 100;
    return $profit_percentage;
}

// Add this code to handle errors
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});
// Add your Binance API key and secret here
$binance_api_key = 'OtmdN18Tgx7VjnLyD4Ulc7ooNUaS0ezw38EZtTXvz0Eln4LxePIGCjOC95WG80OG';
$binance_secret = 'ShmYzH63927bieEp6SgHTDXv3hlEdkiePHMsSpdXpbviKNJbGpPSS6M3YSTACq4u';

// Set up API endpoint and version
$api_endpoint = 'https://api.binance.com';
$api_version = '/api/v3';

// Set up headers for API requests
$headers = array(
    'X-MBX-APIKEY: ' . $binance_api_key,
);

// Get all tickers on Binance
$ticker_url = $api_endpoint . $api_version . '/ticker/price';
$ticker_response = call_api($ticker_url, $headers);
$ticker_data = json_decode($ticker_response, true);

// Create array to store all possible triangular arbitrage opportunities
$opportunities = array();

// Loop through all tickers to find opportunities
foreach ($ticker_data as $key1 => $value1) {
    $base1 = str_replace('BTC', '', $key1);
    foreach ($ticker_data as $key2 => $value2) {
        $base2 = str_replace('BTC', '', $key2);
        if ($base2 === $base1) {
            continue;
        }
        foreach ($ticker_data as $key3 => $value3) {
            $base3 = str_replace('BTC', '', $key3);
            if ($base3 === $base2 || $base3 === $base1) {
                continue;
            }
            if ($base1 === 'USDT' && $base2 !== 'USDT' && $base3 !== 'USDT') {
                continue;
            }
            if ($base2 === 'USDT' && $base1 !== 'USDT' && $base3 !== 'USDT') {
                continue;
            }
            if ($base3 === 'USDT' && $base1 !== 'USDT' && $base2 !== 'USDT') {
                continue;
            }
            $pair1 = $key1;
            $pair2 = $key2;
            $pair3 = $key3;
            $price1 = $value1['price'];
            $price2 = $value2['price'];
            $price3 = $value3['price'];
            $profit_percentage = calculate_profit_percentage($price1, $price2, $price3);
            if ($profit_percentage > 0) {
                $opportunities[] = array(
                    'pair1' => $pair1,
                    'pair2' => $pair2,
                    'pair3' => $pair3,
                    'price1' => $price1,
                    'price2' => $price2,
                    'price3' => $price3,
                    'profit_percentage' => $profit_percentage,
                );
            }
        }
    }
}

// Sort opportunities by profit percentage
usort($opportunities, function ($a, $b) {
    return $b['profit_percentage'] <=> $a['profit_percentage'];
});

// Print out all opportunities
echo "Opportunities: \n";
foreach ($opportunities as $opportunity) {
    echo "Buy ".$opportunity['buy']['symbol']." on ".$opportunity['buy']['exchange']." at ".$opportunity['buy']['price']."\n";
    echo "Sell ".$opportunity['sell']['symbol']." on ".$opportunity['sell']['exchange']." at ".$opportunity['sell']['price']."\n";
    echo "Sell ".$opportunity['middle']['symbol']." on ".$opportunity['middle']['exchange']." at ".$opportunity['middle']['price']."\n";

    // Calculate trading fees
    $buy_fee = $opportunity['buy']['amount'] * 0.001;
    $middle_fee = $opportunity['middle']['amount'] * 0.001;
    $sell_fee = $opportunity['sell']['amount'] * 0.001;

    // Calculate total profit after fees
    $profit = ($opportunity['sell']['amount'] - $sell_fee) - ($opportunity['buy']['amount'] + $buy_fee) - ($opportunity['middle']['amount'] + $middle_fee);

    echo "Potential profit: ".$profit."\n";
    echo "=========================\n";
}
