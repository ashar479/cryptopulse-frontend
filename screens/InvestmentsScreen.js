import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { getCoinDetails } from '../api/coingecko';
import { useTheme } from '../ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const InvestmentsScreen = () => {
  const { theme } = useTheme();

  // Modern color palette
  const colors =
    theme === 'dark'
      ? {
          background: '#181c23',
          card: 'rgba(28,32,40,0.98)',
          border: '#23272e',
          inputBg: '#242933',
          inputBorder: '#353c46',
          accent: '#ffe082',
          text: '#f3f4f6',
          muted: '#aeb1b8',
          plPlus: '#47dc9b',
          plMinus: '#ff6e76',
          button: '#ffe082',
          buttonText: '#23272f',
        }
      : {
          background: '#f6f8fa',
          card: '#fff',
          border: '#e2e6ea',
          inputBg: '#f4f5f8',
          inputBorder: '#d1d5db',
          accent: '#d1b12a',
          text: '#24292f',
          muted: '#7b7e86',
          plPlus: '#15803d',
          plMinus: '#c41d2f',
          button: '#d1b12a',
          buttonText: '#fff',
        };

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [totalPL, setTotalPL] = useState(0);

  // Form state
  const [coinId, setCoinId] = useState('');
  const [coinName, setCoinName] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('buy');

  // 1. Load investments
  useEffect(() => {
    AsyncStorage.getItem('investments').then((saved) => {
      if (saved) setRecords(JSON.parse(saved));
    });
  }, []);

  // 2. Save investments
  useEffect(() => {
    AsyncStorage.setItem('investments', JSON.stringify(records));
  }, [records]);

  // 3. Calculate profit/loss
  useEffect(() => {
    calculateSummary();
    // eslint-disable-next-line
  }, [records]);

  const addInvestment = () => {
    if (!coinId || !amount || !price) return;
    const newRecord = {
      id: Date.now().toString(),
      coinId,
      coinName,
      amount: parseFloat(amount),
      price: parseFloat(price),
      type,
      date: new Date().toISOString(),
    };
    setRecords([...records, newRecord]);
    setCoinId('');
    setCoinName('');
    setAmount('');
    setPrice('');
  };

  const calculateSummary = async () => {
    const sums = {};
    for (const rec of records) {
      if (!sums[rec.coinId]) {
        const details = await getCoinDetails(rec.coinId);
        const currentPrice = details?.market_data?.current_price?.usd || 0;
        sums[rec.coinId] = {
          coin: rec.coinName || rec.coinId,
          net: 0,
          invested: 0,
          currentPrice,
        };
      }
      sums[rec.coinId].net += rec.type === 'buy' ? rec.amount : -rec.amount;
      sums[rec.coinId].invested +=
        (rec.type === 'buy' ? 1 : -1) * rec.amount * rec.price;
    }
    let total = 0;
    Object.keys(sums).forEach((cid) => {
      const { net, invested, currentPrice } = sums[cid];
      const currentValue = net * currentPrice;
      const profit = currentValue - invested;
      sums[cid].profit = profit;
      total += profit;
    });
    setSummary(sums);
    setTotalPL(total);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 18,
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons
            name="wallet-outline"
            size={26}
            color={colors.accent}
            style={{ marginRight: 7 }}
          />
          <Text style={[styles.header, { color: colors.accent, fontSize: 22 }]}>
            Investments
          </Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.accent }]}>
            Add New
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Coin ID (e.g., bitcoin)"
            placeholderTextColor={colors.muted}
            value={coinId}
            onChangeText={setCoinId}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Coin Name (optional)"
            placeholderTextColor={colors.muted}
            value={coinName}
            onChangeText={setCoinName}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Amount"
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            value={amount}
            onChangeText={setAmount}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            placeholder="Price (USD)"
            keyboardType="numeric"
            placeholderTextColor={colors.muted}
            value={price}
            onChangeText={setPrice}
          />
          <View style={{ flexDirection: 'row', marginVertical: 6 }}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {
                  backgroundColor:
                    type === 'buy' ? colors.plPlus : colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
              onPress={() => setType('buy')}
            >
              <Text
                style={{
                  color: type === 'buy' ? '#fff' : colors.text,
                  fontWeight: 'bold',
                }}
              >
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                {
                  backgroundColor:
                    type === 'sell' ? colors.plMinus : colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
              onPress={() => setType('sell')}
            >
              <Text
                style={{
                  color: type === 'sell' ? '#fff' : colors.text,
                  fontWeight: 'bold',
                }}
              >
                Sell
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.button }]}
            onPress={addInvestment}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: colors.buttonText,
                fontWeight: 'bold',
                fontSize: 15.5,
              }}
            >
              Add Investment
            </Text>
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.sectionLabel, { color: colors.accent, marginTop: 16 }]}
        >
          Your Records
        </Text>
        <View style={{ marginBottom: 24 }}>
          {records.length === 0 ? (
            <Text
              style={{
                color: colors.muted,
                textAlign: 'center',
                marginTop: 24,
                fontSize: 15,
              }}
            >
              No investments yet.
            </Text>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.record,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text, fontSize: 15 }}>
                    [{item.type === 'buy' ? 'Buy' : 'Sell'}]{' '}
                    {item.coinName || item.coinId} - {item.amount} @ $
                    {item.price}{' '}
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      on {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </Text>
                </View>
              )}
              scrollEnabled={false}
            />
          )}
        </View>

        <Text
          style={[styles.sectionLabel, { color: colors.accent, marginTop: 10 }]}
        >
          Summary & Profit/Loss
        </Text>
        {Object.keys(summary).length === 0 ? (
          <Text
            style={{ color: colors.muted, textAlign: 'center', fontSize: 15 }}
          >
            No coins yet.
          </Text>
        ) : (
          Object.values(summary).map((sum) => (
            <View key={sum.coin} style={styles.summaryRow}>
              <Text style={{ flex: 1, color: colors.text, fontWeight: '600' }}>
                {sum.coin}{' '}
                <Text style={{ color: colors.muted }}>({sum.net} coins)</Text>
              </Text>
              <Text
                style={{
                  color: sum.profit >= 0 ? colors.plPlus : colors.plMinus,
                  fontWeight: 'bold',
                }}
              >
                {sum.profit >= 0 ? '+' : ''}${sum.profit.toFixed(2)}
              </Text>
            </View>
          ))
        )}
        <Text
          style={[
            styles.sectionLabel,
            { fontSize: 16, color: colors.accent, marginTop: 12 },
          ]}
        >
          Total Portfolio P/L: {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
        </Text>

        {/* Export to S3 Button */}
        <View style={{ marginVertical: 24, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: colors.button }]}
            onPress={async () => {
              try {
                await fetch(
                  'https://cryptopulse-backend-bsz3.onrender.com/upload',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ records }),
                  }
                );
                alert('Uploaded investments to S3!');
              } catch (e) {
                alert('Export failed: ' + e.message);
              }
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: colors.buttonText,
                fontWeight: 'bold',
                fontSize: 15.5,
              }}
            >
              Export to S3
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
    marginBottom: 8,
    marginLeft: 3,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    elevation: 2,
  },
  input: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 7,
    fontSize: 15.5,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.3,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  addBtn: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 1,
  },
  exportBtn: {
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 30,
    alignItems: 'center',
    elevation: 2,
  },
  record: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 7,
    borderWidth: 1.2,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
    alignItems: 'center',
    paddingHorizontal: 7,
  },
});

export default InvestmentsScreen;
