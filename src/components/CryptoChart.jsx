import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import CryptoDashboardStyles from './CryptoDashboardStyles'; // Adjust the path accordingly

const CryptoDashboard = () => {
  // State variables
  const [coinList, setCoinList] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [marketData, setMarketData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [amountInDollars, setAmountInDollars] = useState(0);
  const [amountInRwandanFrancs, setAmountInRwandanFrancs] = useState(0);

  // Ref to hold the Chart.js instance
  const chartRef = useRef(null);

  // Fetch the list of supported coins on component mount
  useEffect(() => {
    fetchCoinList();
  }, []);

  // Fetch market data for the selected coin whenever it changes
  useEffect(() => {
    if (selectedCoin) {
      fetchMarketData(selectedCoin);
    }
  }, [selectedCoin]);

  // Update the chart whenever marketData or chartType changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById('crypto-chart');
    chartRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: marketData.map((data) => data.timestamp),
        datasets: [
          {
            label: 'Price (USD)',
            data: marketData.map((data) => data.price),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
          },
        ],
      },
    });
  }, [marketData, chartType]);

  // Fetch the list of supported coins from the CoinGecko API
  const fetchCoinList = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
      const data = await response.json();
      setCoinList(data);
    } catch (error) {
      console.error('Error fetching coin list:', error);
    }
  };

  // Fetch historical market data for the selected coin from the CoinGecko API
  const fetchMarketData = async (coinId) => {
    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          vs_currency: 'usd',
          days: '90',
          interval: 'daily',
          precision: '2',
        },
      });
      const data = await response.json();
      setMarketData(data.prices.map((price, index) => ({ timestamp: index, price: price[1] })));
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  // Convert the entered amount of the selected coin to dollars and Rwandan francs
  useEffect(() => {
    if (amountInDollars && selectedCoin) {
      const priceInUSD = marketData.length > 0 ? marketData[marketData.length - 1]?.price : 1;
      const convertedAmountInDollars = amountInDollars * priceInUSD;
      setAmountInRwandanFrancs(convertedAmountInDollars * 1000); // Assuming 1 USD = 1000 Rwandan francs (adjust as needed)
    }
  }, [amountInDollars, selectedCoin, marketData]);

  // Render the UI
  return (
    <div style={CryptoDashboardStyles.pageContainer}>
      <header style={CryptoDashboardStyles.header}>Crypto Dashboard</header>
      <div style={CryptoDashboardStyles.cryptoDashboardContainer}>
        <div style={CryptoDashboardStyles.inputContainer}>
          <label htmlFor="coin">Select Coin:</label>
          <select
            id="coin"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            style={CryptoDashboardStyles.input}
          >
            <option value="">Select a coin</option>
            {coinList.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol})
              </option>
            ))}
          </select>
        </div>
        {selectedCoin && (
          <>
            <div style={CryptoDashboardStyles.inputContainer}>
              <label htmlFor="chartType">Select Chart Type:</label>
              <select
                id="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={CryptoDashboardStyles.input}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                {/* Add more chart types as needed */}
              </select>
            </div>
            <div style={CryptoDashboardStyles.inputContainer}>
              <label htmlFor="amountInDollars">Enter Amount in {selectedCoin.toUpperCase()}:</label>
              <input
                type="number"
                id="amountInDollars"
                value={amountInDollars}
                onChange={(e) => setAmountInDollars(e.target.value)}
                style={CryptoDashboardStyles.input}
              />
            </div>
            <div style={CryptoDashboardStyles.logContainer}>
              <p>
                Amount in Dollars: ${amountInDollars} USD
              </p>
              <p>
                Amount in Rwandan Francs: {isNaN(amountInRwandanFrancs) ? 'N/A' : `${amountInRwandanFrancs} RWF`}
              </p>
            </div>
            <canvas id="crypto-chart" width="800" height="400" style={CryptoDashboardStyles.chart}></canvas>
          </>
        )}
      </div>
      <footer style={CryptoDashboardStyles.footer}>© 2024 Crypto Dashboard</footer>
    </div>
  );
};

export default CryptoDashboard;
