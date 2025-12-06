import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from './types';

const BASE_URL = 'https://pokeapi.co/api/v2';

class PokeAPI {
  private cache = new Map<string, any>();

  async getPokemon(id: number): Promise<Pokemon> {
    const cacheKey = `pokemon_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check AsyncStorage
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const pokemon = JSON.parse(cached);
        this.cache.set(cacheKey, pokemon);
        return pokemon;
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }

    // Fetch from API
    try {
      const response = await axios.get(`${BASE_URL}/pokemon/${id}`);
      const pokemon = response.data;
      
      // Cache the result
      this.cache.set(cacheKey, pokemon);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(pokemon));
      
      return pokemon;
    } catch (error) {
      throw new Error(`Failed to fetch Pokemon ${id}`);
    }
  }

  async searchPokemon(query: string): Promise<Pokemon[]> {
    const results: Pokemon[] = [];
    
    // Try to find by name
    try {
      const pokemon = await this.getPokemonByName(query.toLowerCase());
      results.push(pokemon);
    } catch (error) {
      // Pokemon not found by name
    }

    // Try to find by ID if query is numeric
    if (!isNaN(Number(query))) {
      try {
        const pokemon = await this.getPokemon(Number(query));
        if (!results.find(p => p.id === pokemon.id)) {
          results.push(pokemon);
        }
      } catch (error) {
        // Pokemon not found by ID
      }
    }

    return results;
  }

  async getPokemonByName(name: string): Promise<Pokemon> {
    const cacheKey = `pokemon_name_${name}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const pokemon = JSON.parse(cached);
        this.cache.set(cacheKey, pokemon);
        return pokemon;
      }
    } catch (error) {
      console.log('Cache read error:', error);
    }

    try {
      const response = await axios.get(`${BASE_URL}/pokemon/${name}`);
      const pokemon = response.data;
      
      this.cache.set(cacheKey, pokemon);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(pokemon));
      
      return pokemon;
    } catch (error) {
      throw new Error(`Pokemon ${name} not found`);
    }
  }

  async getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 150) + 1; // First 150 Pokemon
    return this.getPokemon(randomId);
  }

  getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return colors[type] || '#68A090';
  }
}

export const pokeAPI = new PokeAPI();