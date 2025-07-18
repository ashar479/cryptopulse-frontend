import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  FlatList,
  Button,
  TextInput,
  StyleSheet,
} from 'react-native';
import { getCoinDetails } from '../api/coingecko'; // To fetch current price

const InvestmentsScreen = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [totalPL, setTotalPL] = useState(0);

  // --- Form state (for new investment entry) ---
  const [coinId, setCoinId] = useState('');
  const [coinName, setCoinName] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('buy');

  // --- 1. Load investments from AsyncStorage on mount ---
  useEffect(() => {
    const loadInvestments = async () => {
      try {
        const saved = await AsyncStorage.getItem('investments');
        if (saved) {
          setRecords(JSON.parse(saved));
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    loadInvestments();
  }, []);

  // --- 2. Save investments to AsyncStorage whenever records change ---
  useEffect(() => {
    const saveInvestments = async () => {
      try {
        await AsyncStorage.setItem('investments', JSON.stringify(records));
      } catch (e) {
        // Optionally handle error
      }
    };
    saveInvestments();
  }, [records]);

  // --- 3. Calculate profit/loss whenever records change ---
  useEffect(() => {
    calculateSummary();
    // eslint-disable-next-line
  }, [records]);

  // --- Function to add a new record ---
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

  // --- Calculate summary & profit/loss ---
  const calculateSummary = async () => {
    const sums = {};
    for (const rec of records) {
      if (!sums[rec.coinId]) {
        // Fetch current price for this coin (one call per coin)
        const details = await getCoinDetails(rec.coinId);
        const currentPrice = details?.market_data?.current_price?.usd || 0;
        sums[rec.coinId] = {
          coin: rec.coinName || rec.coinId,
          net: 0,
          invested: 0,
          currentPrice,
        };
      }
      // Calculate net holdings and invested
      sums[rec.coinId].net += rec.type === 'buy' ? rec.amount : -rec.amount;
      sums[rec.coinId].invested +=
        (rec.type === 'buy' ? 1 : -1) * rec.amount * rec.price;
    }
    // Now, compute profit/loss
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

  // --- UI ---
  return (
    <View style={styles.container}>
      {/* Add investment form */}
      <Text style={styles.header}>Add Investment</Text>
      <TextInput
        style={styles.input}
        placeholder="Coin ID (e.g., bitcoin)"
        value={coinId}
        onChangeText={setCoinId}
      />
      <TextInput
        style={styles.input}
        placeholder="Coin Name (optional)"
        value={coinName}
        onChangeText={setCoinName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Price (USD)"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <View style={{ flexDirection: 'row', marginVertical: 6 }}>
        <Button
          title="Buy"
          onPress={() => setType('buy')}
          color={type === 'buy' ? 'green' : 'gray'}
        />
        <Button
          title="Sell"
          onPress={() => setType('sell')}
          color={type === 'sell' ? 'red' : 'gray'}
        />
      </View>
      <Button title="Add Investment" onPress={addInvestment} />

      {/* Investments list */}
      <Text style={styles.header}>Investments</Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>
              [{item.type === 'buy' ? 'Buy' : 'Sell'}]{' '}
              {item.coinName || item.coinId} - {item.amount} @ ${item.price} on{' '}
              {new Date(item.date).toLocaleDateString()}{' '}
              {new Date(item.date).toLocaleTimeString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>
            No investments yet.
          </Text>
        }
      />

      {/* Summary & profit/loss */}
      <Text style={styles.header}>Summary & Profit/Loss</Text>
      {Object.keys(summary).length === 0 ? (
        <Text style={{ color: '#888', textAlign: 'center' }}>
          No coins yet.
        </Text>
      ) : (
        Object.values(summary).map((sum) => (
          <View key={sum.coin} style={styles.summaryRow}>
            <Text style={{ flex: 1 }}>
              {sum.coin} ({sum.net} coins)
            </Text>
            <Text>
              P/L: {sum.profit >= 0 ? '+' : ''}${sum.profit.toFixed(2)}
            </Text>
          </View>
        ))
      )}
      <Text style={[styles.header, { fontSize: 16 }]}>
        Total Portfolio P/L: {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
      </Text>

      {/* Export to S3 Button */}
      <View style={{ marginVertical: 20 }}>
        <Button
          title="Export to S3"
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
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 6,
    borderRadius: 5,
  },
  record: {
    backgroundColor: '#fafafa',
    padding: 8,
    marginVertical: 4,
    borderRadius: 5,
    borderColor: '#eee',
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
});

export default InvestmentsScreen;
