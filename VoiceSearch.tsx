import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Pokemon } from './types';
import { pokeAPI } from './api';

let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (e) {
  console.log('Voice module not available');
}

interface VoiceSearchProps {
  onPokemonFound: (pokemon: Pokemon) => void;
  onClose: () => void;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onPokemonFound, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Voice) return;
    
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value[0]) {
        setRecognizedText(e.value[0]);
        searchPokemon(e.value[0]);
      }
    };
    Voice.onSpeechError = (e) => {
      console.log('Voice error:', e);
      setIsListening(false);
      Alert.alert('Error', 'Voice recognition failed. Please try again.');
    };

    return () => {
      if (Voice) Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    if (!Voice) {
      Alert.alert('Not Available', 'Voice recognition not available. Please type to search.');
      return;
    }

    try {
      await Voice.start('en-US');
      setRecognizedText('');
    } catch (error) {
      console.log('Start listening error:', error);
      Alert.alert('Error', 'Failed to start voice recognition');
    }
  };

  const stopListening = async () => {
    if (!Voice) return;
    try {
      await Voice.stop();
    } catch (error) {
      console.log('Stop listening error:', error);
    }
  };

  const searchPokemon = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const results = await pokeAPI.searchPokemon(query);
      if (results.length > 0) {
        onPokemonFound(results[0]);
      } else {
        Alert.alert('Not Found', `No Pokemon found for "${query}"`);
      }
    } catch (error) {
      console.log('Search error:', error);
      Alert.alert('Error', 'Failed to search Pokemon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <Text style={styles.title}>Search Pokemon</Text>
        
        {Voice ? (
          <>
            <View style={styles.micContainer}>
              <TouchableOpacity 
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={isListening ? stopListening : startListening}
                disabled={loading}
              >
                <Text style={styles.micIcon}>{isListening ? '🔴' : '🎤'}</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.statusText}>
              {loading ? 'Searching...' : isListening ? 'Listening...' : 'Tap microphone to speak'}
            </Text>
            
            {recognizedText ? (
              <Text style={styles.recognizedText}>"{recognizedText}"</Text>
            ) : null}
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Type Pokemon name..."
              value={recognizedText}
              onChangeText={setRecognizedText}
              onSubmitEditing={() => searchPokemon(recognizedText)}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => searchPokemon(recognizedText)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>
          </>
        )}
        
        {loading && <ActivityIndicator size="large" color="#2c5aa0" style={styles.loader} />}
        
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
    marginBottom: 30,
  },
  micContainer: {
    marginBottom: 20,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2c5aa0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#dc3545',
  },
  micIcon: {
    fontSize: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  recognizedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 15,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
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