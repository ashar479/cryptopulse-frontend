import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { getCoinDetails, getCoinMarketChart } from '../api/coingecko';
import { LineChart } from 'react-native-chart-kit';

const CoinDetailScreen = ({ route }) => {
  const { coinId } = route.params;
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCoinDetails(coinId);
      if (!data) {
        setError('Unable to fetch coin details. Please try again later.');
      } else {
        setCoin(data);
        const historyData = await getCoinMarketChart(coinId, 7); // <-- CoinGecko!
        setHistory(historyData);
      }
    } catch (err) {
      setError('Unable to fetch coin details. Please try again later.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!coin) {
    return (
      <View style={styles.center}>
        <Text>No data available.</Text>
      </View>
    );
  }

  // CoinGecko returns: [[timestamp, price], ...]
  const chartData =
    history && Array.isArray(history) && history.length > 0
      ? {
          labels: history.map((p, i) =>
            i === 0 || i === history.length - 1
              ? new Date(p[0]).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : ''
          ),
          datasets: [{ data: history.map((p) => p[1]) }],
        }
      : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: coin.image.large }} style={styles.logo} />
        <Text style={styles.title}>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Text>
      </View>
      <Text style={styles.price}>
        ${coin.market_data.current_price.usd.toLocaleString()}
      </Text>
      <Text style={styles.rank}>Rank #{coin.market_cap_rank}</Text>
      <Text style={styles.desc}>
        {coin.description.en
          ? coin.description.en.split('. ')[0]
          : 'No description available.'}
      </Text>
      <View style={styles.meta}>
        <Text>
          Market Cap: ${coin.market_data.market_cap.usd.toLocaleString()}
        </Text>
        <Text>24h High: ${coin.market_data.high_24h.usd.toLocaleString()}</Text>
        <Text>24h Low: ${coin.market_data.low_24h.usd.toLocaleString()}</Text>
        <Text>
          Circulating Supply:{' '}
          {coin.market_data.circulating_supply.toLocaleString()}
        </Text>
      </View>
      {chartData && (
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              marginBottom: 6,
              textAlign: 'center',
            }}
          >
            Price (Last 7 Days)
          </Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 32}
            height={180}
            withDots={false}
            withShadow={false}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      )}
      {history && Array.isArray(history) && history.length === 0 && (
        <Text style={{ color: 'gray', marginTop: 24, textAlign: 'center' }}>
          No chart data available for this coin.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logo: { width: 50, height: 50, marginRight: 14 },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1, flexWrap: 'wrap' },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 8,
  },
  rank: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', marginBottom: 14 },
  meta: { marginTop: 10 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});

export default CoinDetailScreen;
