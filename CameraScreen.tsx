import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addDiscoveredPokemon } from './store';
import { pokeAPI } from './api';

export const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [overlayPokemon, setOverlayPokemon] = useState<any>(null);
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const dispatch = useDispatch();

  React.useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
      
      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
    } catch (error) {
      console.log('Camera permission error:', error);
    }
  };

  const spawnRandomPokemon = async () => {
    try {
      const pokemon = await pokeAPI.getRandomPokemon();
      setOverlayPokemon(pokemon);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setOverlayPokemon(null);
      }, 5000);
    } catch (error) {
      Alert.alert('Error', 'Failed to spawn Pokemon');
    }
  };

  const capturePhoto = async () => {
    if (!camera.current) return;
    
    try {
      const photo = await camera.current.takePhoto({
        quality: 0.8,
        enableAutoRedEyeReduction: true,
      });
      
      setCapturedPhoto(`file://${photo.path}`);
      
      if (overlayPokemon) {
        dispatch(addDiscoveredPokemon(overlayPokemon));
        Alert.alert(
          'Pokemon Captured!',
          `You captured ${overlayPokemon.name} in a photo! It has been added to your Pokedex.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsActive(true);
  };

  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No camera device found</Text>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} />
        <View style={styles.captureControls}>
          <TouchableOpacity style={styles.button} onPress={retakePhoto}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={isActive}
        photo={true}
      />
      
      {overlayPokemon && (
        <View style={styles.pokemonOverlay}>
          <Image 
            source={{ uri: overlayPokemon.sprites.front_default }}
            style={styles.overlayImage}
          />
          <Text style={styles.overlayText}>
            A wild {overlayPokemon.name} appeared!
          </Text>
        </View>
      )}
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.spawnButton}
          onPress={spawnRandomPokemon}
        >
          <Text style={styles.buttonText}>Spawn Pokemon</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.captureButton}
          onPress={capturePhoto}
        >
          <Text style={styles.captureButtonText}>📷</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  camera: {
    flex: 1,
  },
  pokemonOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -75 }],
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
  },
  overlayImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  spawnButton: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2c5aa0',
  },
  captureButtonText: {
    fontSize: 24,
  },
  button: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  capturedImage: {
    flex: 1,
    width: '100%',
  },
  captureControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});