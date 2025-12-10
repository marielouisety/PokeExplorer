import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from './store';
import { LoginScreen } from './LoginScreen';
import { PokedexScreen } from './PokedexScreen';
import { PokemonDetailScreen } from './PokemonDetailScreen';
import { HuntScreen } from './HuntScreen';
import { CameraScreen } from './CameraScreen';
import { AR3DScreen } from './AR3DScreen';
import { ProfileScreen } from './ProfileScreen';
import { VRLiteHabitatScreen } from './VRLiteHabitatScreen';
import { Pokemon } from './types';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from './auth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

GoogleSignin.configure({
  webClientId: "1060774015394-diitt134tfleu3krfo7tjrir6tdiugul.apps.googleusercontent.com",
});

const PokedexStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PokedexList" component={PokedexScreen} />
            <Stack.Screen name="PokemonDetail" component={PokemonDetailScreen} />
        </Stack.Navigator>
    );
};

const MainTabs = () => {
  return (
    <Tab.Navigator
        initialRouteName="PokedexFlow"
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2c5aa0',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: styles.bottomNav,
            tabBarLabelStyle: styles.navText,
        }}
    >
        <Tab.Screen
            name="PokedexFlow"
            component={PokedexStack}
            options={{
                tabBarLabel: '📚 Pokedex',
                tabBarIcon: () => null,
            }}
        />
        <Tab.Screen
            name="Hunt"
            component={HuntScreen}
            options={{
                tabBarLabel: '🗺️ Hunt',
                tabBarIcon: () => null,
            }}
        />
        <Tab.Screen
            name="AR"
            component={AR3DScreen}
            options={{
                tabBarLabel: '📷 AR',
                tabBarIcon: () => null,
            }}
        />
        <Tab.Screen
            name="VR"
            component={VRLiteHabitatScreen}
            options={{
                tabBarLabel: '🥽 VR',
                tabBarIcon: () => null,
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
                tabBarLabel: '👤 Profile',
                tabBarIcon: () => null,
            }}
        />
    </Tab.Navigator>
  );
};

function AppContent() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const subscriber = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      // We no longer need isAuthenticated state, we check 'user' directly

      if (initializing) {
        setInitializing(false);
      }
    });

    return subscriber;
  }, [initializing]);

  // Loading screen while Firebase checks auth status
  if (initializing) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2c5aa0" />
          <Text>Loading App...</Text>
        </View>
      );
    }

  // authentication switch
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />
      {/* If 'user' exists, show the main tabs; otherwise, show login */}
      {user ? (
        <MainTabs />
      ) : (
        <LoginScreen onLogin={() => {}} />
      )}
    </NavigationContainer>
  );
}

// --- ROOT COMPONENT ---

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  bottomNav: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    height: 70,
  },
  navText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default App;