import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { getMarketData } from '../api/coingecko';

const HomeScreen = ({ navigation }) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    setLoading(true);
    const data = await getMarketData();
    setCoins(data);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Top 20 Cryptos</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={coins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CoinDetail', { coinId: item.id })
              }
            >
              <View style={styles.item}>
                <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  ${item.current_price.toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          onRefresh={fetchCoins}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 10 },
  header: { fontSize: 24, fontWeight: 'bold', marginVertical: 15 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  symbol: { fontWeight: 'bold', fontSize: 18 },
  name: { fontSize: 16 },
  price: { fontWeight: 'bold', color: '#228B22' },
});

export default HomeScreen;
