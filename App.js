import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SettingsScreen from './screens/SettingsScreen';
import CoinDetailScreen from './screens/CoinDetailScreen';
import InvestmentsScreen from './screens/InvestmentsScreen';

import { ThemeProvider, useTheme } from './ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#23272f' : '#fff',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Investments')
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          else if (route.name === 'Favorites')
            iconName = focused ? 'star' : 'star-outline';
          else if (route.name === 'Settings')
            iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d1b12a',
        tabBarInactiveTintColor: theme === 'dark' ? '#aaa' : 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Investments" component={InvestmentsScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppWithThemeHeader() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    // <-- THIS IS THE IMPORTANT PART
    <NavigationContainer key={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#23272f' : '#fff',
            shadowColor: isDark ? '#000' : '#d1b12a',
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          },
          headerTintColor: isDark ? '#ffe082' : '#222',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: isDark ? '#ffe082' : '#222',
          },
          headerBackTitleStyle: { color: isDark ? '#ffe082' : '#222' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CoinDetail"
          component={CoinDetailScreen}
          options={{ title: 'Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppWithThemeHeader />
    </ThemeProvider>
  );
}
