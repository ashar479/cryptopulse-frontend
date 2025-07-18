// screens/SettingsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // Centralized colors for the button
  const btnBg = isDark ? '#ffe082' : '#23272f';
  const btnText = isDark ? '#23272f' : '#ffe082';
  const bg = isDark ? '#23272f' : '#fff';
  const titleColor = isDark ? '#ffe082' : '#222';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.title, { color: titleColor }]}>Settings</Text>

      <TouchableOpacity
        style={[styles.toggleBtn, { backgroundColor: btnBg }]}
        onPress={toggleTheme}
        activeOpacity={0.88}
      >
        <Text style={[styles.toggleText, { color: btnText }]}>
          {isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 36,
    letterSpacing: 0.5,
  },
  toggleBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    elevation: 2,
    marginTop: 16,
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});

export default SettingsScreen;
