// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { getMarketData } from '../api/coingecko';
import { useTheme } from '../ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_STORAGE_KEY = 'favorites';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const colors =
    theme === 'dark'
      ? {
          background: '#181c23',
          card: '#232b3a',
          border: '#2a3750',
          accent: '#ffe082',
          text: '#f3f4f6',
          muted: '#aeb1b8',
          symbol: '#b0d1ff',
          name: '#c5c9d3',
          price: '#e9f4fc',
        }
      : {
          background: '#f6f8fa',
          card: '#fff',
          border: '#e0e6f7',
          accent: '#d1b12a',
          text: '#232e3b',
          muted: '#7589a8',
          symbol: '#3575ec',
          name: '#7589a8',
          price: '#232e3b',
        };

  useEffect(() => {
    fetchCoins();
    loadFavorites();
  }, []);

  // Call this after removing favorite from other screens to update local state
  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem(FAV_STORAGE_KEY);
    setFavorites(favs ? JSON.parse(favs) : []);
  };

  const fetchCoins = async () => {
    setLoading(true);
    const data = await getMarketData();
    setCoins(data);
    setLoading(false);
  };

  const isFavorite = (coinId) => favorites.includes(coinId);

  const toggleFavorite = async (coinId) => {
    let favArr = [];
    if (favorites.includes(coinId)) {
      favArr = favorites.filter((id) => id !== coinId);
    } else {
      favArr = [...favorites, coinId];
    }
    setFavorites(favArr);
    await AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favArr));
  };

  const renderItem = ({ item }) => {
    const priceChange = item.price_change_percentage_24h ?? 0;
    const isUp = priceChange >= 0;
    const fav = isFavorite(item.id);

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('CoinDetail', { coinId: item.id })}
          activeOpacity={0.87}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          <Image source={{ uri: item.image }} style={styles.logo} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.symbol, { color: colors.symbol }]}>
              {item.symbol.toUpperCase()}
            </Text>
            <Text style={[styles.name, { color: colors.name }]}>
              {item.name}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', marginRight: 4 }}>
            <Text style={[styles.price, { color: colors.price }]}>
              ${item.current_price.toLocaleString()}
            </Text>
            <Text
              style={[
                styles.priceChange,
                { color: isUp ? '#2ed47a' : '#f45d48' },
              ]}
            >
              {isUp ? '+' : ''}
              {priceChange.toFixed(2)}%
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavorite(item.id)}
          style={styles.bookmarkBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={fav ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={
              fav ? (theme === 'dark' ? '#ffe082' : '#d1b12a') : colors.muted
            }
            style={styles.bookmarkIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 10,
      }}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={[styles.header, { color: colors.accent }]}>
          Top 20 Cryptos
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} />
        ) : (
          <FlatList
            data={coins}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onRefresh={fetchCoins}
            refreshing={loading}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 18,
    alignSelf: 'center',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#a3b8e4',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8ebf5',
  },
  symbol: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.7,
  },
  name: {
    fontSize: 15,
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  price: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  priceChange: {
    fontSize: 15,
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  bookmarkBtn: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 14,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  bookmarkIcon: {
    textShadowColor: '#0003',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;
