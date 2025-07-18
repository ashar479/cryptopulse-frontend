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
import { useTheme } from '../ThemeContext';

const CoinDetailScreen = ({ route }) => {
  const { coinId } = route.params;
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
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

  // Prepare chart data
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

  // Chart configuration
  const chartConfig = {
    backgroundColor: isDark ? '#232b3a' : '#fff',
    backgroundGradientFrom: isDark ? '#232b3a' : '#fff',
    backgroundGradientTo: isDark ? '#232b3a' : '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) =>
      isDark
        ? `rgba(225, 206, 90, ${opacity})` // subtle yellow for line
        : `rgba(34, 139, 34, ${opacity})`, // green for line
    labelColor: (opacity = 1) =>
      isDark ? `rgba(220,220,220,${opacity})` : `rgba(36,41,47,${opacity})`,
    propsForDots: { r: '0' },
    propsForBackgroundLines: {
      stroke: isDark ? '#2a3750' : '#eee',
      strokeDasharray: '', // solid
    },
    style: { borderRadius: 16 },
  };

  // Loading, error, or no coin state
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

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#181c23' : '#fff' },
      ]}
      contentContainerStyle={{ paddingBottom: 34 }}
    >
      <View style={styles.header}>
        <Image source={{ uri: coin.image.large }} style={styles.logo} />
        <Text style={[styles.title, { color: isDark ? '#ffe082' : '#23272f' }]}>
          {coin.name} ({coin.symbol.toUpperCase()})
        </Text>
      </View>
      <Text style={[styles.price, { color: isDark ? '#7cf2b7' : '#2ecc71' }]}>
        ${coin.market_data.current_price.usd.toLocaleString()}
      </Text>
      <Text style={[styles.rank, { color: isDark ? '#f1c96d' : '#555' }]}>
        Rank #{coin.market_cap_rank}
      </Text>
      <Text style={[styles.desc, { color: isDark ? '#c5c9d3' : '#666' }]}>
        {coin.description.en
          ? coin.description.en.split('. ')[0]
          : 'No description available.'}
      </Text>
      <View style={styles.meta}>
        <Text style={{ color: isDark ? '#fff' : '#111' }}>
          Market Cap: ${coin.market_data.market_cap.usd.toLocaleString()}
        </Text>
        <Text style={{ color: isDark ? '#fff' : '#111' }}>
          24h High: ${coin.market_data.high_24h.usd.toLocaleString()}
        </Text>
        <Text style={{ color: isDark ? '#fff' : '#111' }}>
          24h Low: ${coin.market_data.low_24h.usd.toLocaleString()}
        </Text>
        <Text style={{ color: isDark ? '#fff' : '#111' }}>
          Circulating Supply:{' '}
          {coin.market_data.circulating_supply.toLocaleString()}
        </Text>
      </View>
      {chartData && (
        <View
          style={{
            marginTop: 28,
            backgroundColor: isDark ? '#232b3a' : '#fff',
            borderRadius: 18,
            padding: 10,
            shadowColor: isDark ? '#000' : '#d1b12a',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.13,
            shadowRadius: 9,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              marginBottom: 7,
              textAlign: 'center',
              color: isDark ? '#ffe082' : '#228b22',
              letterSpacing: 0.2,
            }}
          >
            Price (Last 7 Days)
          </Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 48}
            height={200}
            withDots={false}
            withShadow={false}
            withInnerLines={true}
            withOuterLines={false}
            bezier
            yAxisLabel="$"
            chartConfig={chartConfig}
            style={{
              borderRadius: 14,
              marginHorizontal: 4,
            }}
          />
        </View>
      )}
      {history && Array.isArray(history) && history.length === 0 && (
        <Text
          style={{
            color: isDark ? '#aaa' : 'gray',
            marginTop: 24,
            textAlign: 'center',
          }}
        >
          No chart data available for this coin.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
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
    marginBottom: 8,
  },
  rank: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  desc: { fontSize: 14, marginBottom: 14 },
  meta: { marginTop: 10 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});

export default CoinDetailScreen;
