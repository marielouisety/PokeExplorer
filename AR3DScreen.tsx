import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addDiscoveredPokemon } from './store';
import { pokeAPI } from './api';

// Safely import ViroReact components
let ViroARSceneNavigator: any = null;
let ViroARScene: any = null;
let ViroText: any = null;
let ViroSphere: any = null;
let ViroAmbientLight: any = null;
let ViroNode: any = null;
let ViroAnimations: any = null;

try {
  const ViroReact = require('@viro-community/react-viro');
  ViroARSceneNavigator = ViroReact.ViroARSceneNavigator;
  ViroARScene = ViroReact.ViroARScene;
  ViroText = ViroReact.ViroText;
  ViroSphere = ViroReact.ViroSphere;
  ViroAmbientLight = ViroReact.ViroAmbientLight;
  ViroNode = ViroReact.ViroNode;
  ViroAnimations = ViroReact.ViroAnimations;
  
  // Define animations
  ViroAnimations.registerAnimations({
    bounce: {
      properties: { positionY: "+=0.2" },
      easing: "EaseInEaseOut",
      duration: 1000,
    },
  });
} catch (error) {
  console.log('ViroReact not available:', error);
}

interface Pokemon3D {
  id: number;
  name: string;
  color: string;
  position: [number, number, number];
}

let globalPokemon: Pokemon3D[] = [];
let globalDispatch: any = null;

const ARScene = () => {
  const dispatch = useDispatch();
  globalDispatch = dispatch;

  const catchPokemon = async (pokemonId: number) => {
    const pokemonToCatch = globalPokemon.find(p => p.id === pokemonId);
    if (!pokemonToCatch) return;

    try {
      const pokemonData = await pokeAPI.getPokemon(pokemonId);
      dispatch(addDiscoveredPokemon(pokemonData));
      
      globalPokemon = globalPokemon.filter(p => p.id !== pokemonId);
      
      Alert.alert(
        'Pokemon Caught!',
        `You caught ${pokemonToCatch.name}! Added to your Pokedex.`
      );
    } catch (error) {
      console.log('Failed to catch Pokemon:', error);
    }
  };

  if (!ViroARScene) {
    return null;
  }

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" intensity={0.5} />
      
      {globalPokemon.map((poke) => (
        <ViroNode key={poke.id} position={poke.position}>
          <ViroSphere
            radius={0.3}
            position={[0, 0, 0]}
            materials={[{
              diffuseColor: poke.color,
              shininess: 2.0,
            }]}
            onClick={() => catchPokemon(poke.id)}
            animation={{
              name: "bounce",
              run: true,
              loop: true,
            }}
          />
          
          <ViroSphere
            radius={0.05}
            position={[-0.1, 0.1, 0.25]}
            materials={[{ diffuseColor: "#000000" }]}
          />
          <ViroSphere
            radius={0.05}
            position={[0.1, 0.1, 0.25]}
            materials={[{ diffuseColor: "#000000" }]}
          />
          
          <ViroText
            text={poke.name.toUpperCase()}
            scale={[0.5, 0.5, 0.5]}
            position={[0, 0.6, 0]}
            style={{
              fontFamily: "Arial",
              fontSize: 30,
              color: "#FFFFFF",
              textAlignVertical: "center",
              textAlign: "center",
            }}
          />
        </ViroNode>
      ))}
      
      <ViroText
        text="Tap Pokemon to catch them!"
        scale={[0.3, 0.3, 0.3]}
        position={[0, -2, -3]}
        style={{
          fontFamily: "Arial",
          fontSize: 20,
          color: "#FFFFFF",
          textAlignVertical: "center",
          textAlign: "center",
        }}
      />
    </ViroARScene>
  );
};

const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    fire: '#FF6B6B', water: '#4ECDC4', grass: '#45B7D1',
    electric: '#FFA07A', psychic: '#DDA0DD', ice: '#87CEEB',
    dragon: '#9370DB', dark: '#696969', fairy: '#FFB6C1',
    fighting: '#CD5C5C', poison: '#BA55D3', ground: '#F4A460',
    flying: '#87CEFA', bug: '#9ACD32', rock: '#A0522D',
    ghost: '#8A2BE2', steel: '#B0C4DE', normal: '#D3D3D3',
  };
  return colors[type] || '#D3D3D3';
};

const spawnPokemon = async () => {
  try {
    const pokemonData = await pokeAPI.getRandomPokemon();
    
    const newPokemon: Pokemon3D = {
      id: Date.now(), // Use timestamp for unique ID
      name: pokemonData.name,
      color: getTypeColor(pokemonData.types[0]?.type.name || 'normal'),
      position: [
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        -2 - Math.random() * 3
      ]
    };
    
    globalPokemon.push(newPokemon);
    console.log('Spawned Pokemon:', newPokemon.name);
    
    setTimeout(() => {
      globalPokemon = globalPokemon.filter(p => p.id !== newPokemon.id);
    }, 10000);
    
  } catch (error) {
    console.log('Failed to spawn Pokemon:', error);
  }
};

export const AR3DScreen: React.FC = () => {
  const [showAR, setShowAR] = useState(false);

  if (!ViroARSceneNavigator) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>3D AR Not Available</Text>
        <Text style={styles.description}>
          ViroReact is not properly configured. 3D AR features require additional setup.
        </Text>
        <Text style={styles.description}>
          Use the 2D AR camera for now!
        </Text>
      </View>
    );
  }

  if (!showAR) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>3D AR Pokemon</Text>
        <Text style={styles.description}>
          Experience Pokemon in full 3D augmented reality!
        </Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => setShowAR(true)}
        >
          <Text style={styles.buttonText}>Start AR Experience</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.arContainer}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARScene,
        }}
        style={styles.arView}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.spawnButton}
          onPress={spawnPokemon}
        >
          <Text style={styles.buttonText}>Spawn Pokemon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.exitButton}
          onPress={() => setShowAR(false)}
        >
          <Text style={styles.buttonText}>Exit AR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  arContainer: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  spawnButton: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exitButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});