import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, database, ref, set, get } from '../firebase/config';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  async function signup(email, password, name) {
    try {
      setOperationLoading(true);
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user document in Realtime Database
      await set(ref(database, `users/${userCredential.user.uid}`), {
        name,
        email,
        createdAt: Date.now(),
        cars: {},
      });

      return userCredential.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setOperationLoading(true);
      setAuthError(null);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }

  async function logout() {
    try {
      setOperationLoading(true);
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setOperationLoading(false);
    }
  }

  async function getUserProfile() {
    if (!currentUser) return null;

    try {
      const userRef = ref(database, `users/${currentUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return snapshot.val();
      } else {
        return null;
      }
    } catch (error) {
      setAuthError(error.message);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    getUserProfile,
    authError,
    operationLoading,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
