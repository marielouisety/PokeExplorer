import auth from '@react-native-firebase/auth';
import { User } from './types';

const mapFirebaseUserToAppUser = (firebaseUser: FirebaseAuthTypes.User): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Explorer',
  };
};

class AuthService {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser) {
      throw new Error("Sign-in failed: User not found after successful authentication.");
    }

    return mapFirebaseUserToAppUser(firebaseUser);
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) {
          throw new Error("Sign-up failed: User not found after successful creation.");
      }

      return mapFirebaseUserToAppUser(firebaseUser);
  }

  async signOut(): Promise<void> {
    await auth().signOut();
  }

  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    if (!firebaseUser) return null;
    
    return mapFirebaseUserToAppUser(firebaseUser);
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUserToAppUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();