// screens/FavoritesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '../ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMarketData } from '../api/coingecko';

const FAV_STORAGE_KEY = 'favorites';

const FavoritesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = isDark
    ? {
        background: '#23272f',
        text: '#ffe082',
        sub: '#bbb',
        card: '#232b3a',
        border: '#2a3750',
        muted: '#bbb',
      }
    : {
        background: '#fff',
        text: '#222',
        sub: '#666',
        card: '#fff',
        border: '#e0e6f7',
        muted: '#666',
      };

  const [favorites, setFavorites] = useState([]);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await AsyncStorage.getItem(FAV_STORAGE_KEY);
    const favArr = favs ? JSON.parse(favs) : [];
    setFavorites(favArr);
    if (favArr.length > 0) {
      const allCoins = await getMarketData();
      setCoins(allCoins.filter((c) => favArr.includes(c.id)));
    } else {
      setCoins([]);
    }
    setLoading(false);
  };

  const removeFavorite = async (coinId) => {
    const updated = favorites.filter((id) => id !== coinId);
    setFavorites(updated);
    setCoins(coins.filter((c) => c.id !== coinId));
    await AsyncStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(updated));
    // (Optional) Inform HomeScreen to reload, or rely on HomeScreen reloading on focus
  };

  const renderFavItem = ({ item }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Image source={{ uri: item.image }} style={styles.logo} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.symbol, { color: isDark ? '#ffe082' : '#222' }]}>
          {item.symbol.toUpperCase()}
        </Text>
        <Text style={[styles.name, { color: colors.muted }]}>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFavorite(item.id)}
        style={styles.bookmarkBtn}
        activeOpacity={0.7}
      >
        <Ionicons
          name="bookmark"
          size={26}
          color="#ff4a57"
          style={styles.bookmarkIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Ionicons
        name="bookmark-outline"
        size={46}
        color={isDark ? '#ffe082' : '#d1b12a'}
        style={{ marginBottom: 16, alignSelf: 'center' }}
      />
      <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
      {loading ? (
        <Text style={{ color: colors.sub, marginTop: 30 }}>Loading...</Text>
      ) : coins.length === 0 ? (
        <Text style={[styles.subtext, { color: colors.sub }]}>
          Your favorited coins will show up here.
        </Text>
      ) : (
        <FlatList
          data={coins}
          keyExtractor={(item) => item.id}
          renderItem={renderFavItem}
          style={{ marginTop: 12, width: '100%' }}
          contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 26 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 14 },
  subtext: { fontSize: 16, marginTop: 4, textAlign: 'center', maxWidth: 270 },
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
    width: '100%',
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

export default FavoritesScreen;
