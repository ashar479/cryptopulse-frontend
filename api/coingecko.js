import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

// Fetch detailed info for a coin
export const getCoinDetails = async (coinId) => {
  try {
    const response = await axios.get(`${API_URL}/coins/${coinId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

// Fetch 7-day price history for a coin
export const getCoinMarketChart = async (coinId, days = 7) => {
  try {
    const response = await axios.get(
      `${API_URL}/coins/${coinId}/market_chart`,
      {
        params: {
          vs_currency: 'usd',
          days,
        },
      }
    );
    // The "prices" field is an array of [timestamp, price]
    return response.data.prices;
  } catch (error) {
    return [];
  }
};

// Fetch top market data (used for your list)
export const getMarketData = async () => {
  try {
    const response = await axios.get(`${API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 20,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    return [];
  }
};
