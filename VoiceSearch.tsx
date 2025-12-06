import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Pokemon } from './types';
import { pokeAPI } from './api';

interface VoiceSearchProps {
  onPokemonFound: (pokemon: Pokemon) => void;
  onClose: () => void;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onPokemonFound, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchPokemon = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await pokeAPI.searchPokemon(query);
      if (results.length > 0) {
        onPokemonFound(results[0]);
      }
    } catch (error) {
      console.log('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Search Pokemon</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter Pokemon name..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchPokemon}
        />
        
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={searchPokemon}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});