import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import MapView, { Marker } from 'react-native-maps';
import { RootState, setCurrentLocation, addEncounter, addDiscoveredPokemon } from './store';
import { pokeAPI } from './api';
import { Pokemon, PokemonEncounter } from './types';

export const HuntScreen: React.FC = () => {
  const [hunting, setHunting] = useState(false);
  const [nearbyPokemon, setNearbyPokemon] = useState<PokemonEncounter[]>([]);
  const { currentLocation, encounters } = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        getCurrentLocation();
      } else {
        Alert.alert('Permission Denied', 'Location permission is required for Pokemon hunting');
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setCurrentLocation({ latitude, longitude }));
        generateNearbyPokemon(latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
        Alert.alert('Error', 'Unable to get current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const generateNearbyPokemon = async (lat: number, lng: number) => {
    const pokemon: PokemonEncounter[] = [];
    
    // Generate 3-5 random Pokemon near the user's location
    const count = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < count; i++) {
      try {
        const randomPokemon = await pokeAPI.getRandomPokemon();
        
        // Generate random location within 500m radius
        const offsetLat = (Math.random() - 0.5) * 0.01; // ~500m
        const offsetLng = (Math.random() - 0.5) * 0.01;
        
        const encounter: PokemonEncounter = {
          pokemon: randomPokemon,
          location: {
            latitude: lat + offsetLat,
            longitude: lng + offsetLng,
          },
          timestamp: Date.now(),
        };
        
        pokemon.push(encounter);
      } catch (error) {
        console.log('Error generating Pokemon:', error);
      }
    }
    
    setNearbyPokemon(pokemon);
  };

  const startHunt = () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }
    
    setHunting(true);
    getCurrentLocation();
  };

  const catchPokemon = (encounter: PokemonEncounter) => {
    Alert.alert(
      'Pokemon Found!',
      `You found a ${encounter.pokemon.name}! Do you want to catch it?`,
      [
        { text: 'Run Away', style: 'cancel' },
        {
          text: 'Catch!',
          onPress: () => {
            dispatch(addEncounter(encounter));
            dispatch(addDiscoveredPokemon(encounter.pokemon));
            setNearbyPokemon(prev => prev.filter(p => p !== encounter));
            Alert.alert('Success!', `${encounter.pokemon.name} has been added to your Pokedex!`);
          },
        },
      ]
    );
  };

  if (!currentLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5aa0" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokemon Hunt</Text>
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          {nearbyPokemon.map((encounter, index) => (
            <Marker
              key={index}
              coordinate={encounter.location}
              title={encounter.pokemon.name}
              description="Tap to catch!"
              onPress={() => catchPokemon(encounter)}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.huntButton, hunting && styles.huntingButton]}
          onPress={startHunt}
          disabled={hunting}
        >
          <Text style={styles.huntButtonText}>
            {hunting ? 'Hunting...' : 'Start Hunt'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          {nearbyPokemon.length} Pokemon nearby
        </Text>
        
        <Text style={styles.infoText}>
          Total caught: {encounters.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c5aa0',
    padding: 16,
    paddingTop: 50,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  huntButton: {
    backgroundColor: '#2c5aa0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  huntingButton: {
    backgroundColor: '#666',
  },
  huntButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});