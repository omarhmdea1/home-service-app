/**
 * AuthProvider - Simple, Reliable Authentication
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../../firebase';
import { getCurrentUserProfile, createUserProfile } from '../../services/userService';
import { getIdToken, removeAuthToken } from '../../utils/authToken';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [pendingUserData, setPendingUserData] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        await checkUserProfile(firebaseUser);
      } else {
        clearAuthState();
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const clearAuthState = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setUserRole(null);
    setNeedsRoleSelection(false);
    setPendingUserData(null);
    removeAuthToken();
  };

  const checkUserProfile = async (firebaseUser) => {
    try {
      await getIdToken();
      const profile = await getCurrentUserProfile();
      
      if (profile && profile.role) {
        // User has complete profile
        setUserProfile(profile);
        setUserRole(profile.role);
        setNeedsRoleSelection(false);
      } else {
        // Profile exists but incomplete
        showRoleSelection(firebaseUser);
      }
    } catch (error) {
      if (error.message.includes('404')) {
        // New user - needs profile creation
        showRoleSelection(firebaseUser);
      }
    }
  };

  const showRoleSelection = (firebaseUser) => {
    setNeedsRoleSelection(true);
    setPendingUserData({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      photoURL: firebaseUser.photoURL || ''
    });
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Email/Password Sign Up
  const signUp = async (email, password, additionalData = {}) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (additionalData.name) {
      await updateProfile(result.user, { displayName: additionalData.name });
    }
    
    return result;
  };

  // Email/Password Sign In
  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Complete profile with role
  const completeProfile = async (selectedRole) => {
    if (!pendingUserData) {
      throw new Error('No pending user data');
    }

    const profileData = {
      ...pendingUserData,
      role: selectedRole,
      isVerified: selectedRole === 'provider' ? false : true
    };

    const profile = await createUserProfile(profileData);
    
    setUserProfile(profile);
    setUserRole(selectedRole);
    setNeedsRoleSelection(false);
    setPendingUserData(null);
    
    return profile;
  };

  // Send email verification
  const sendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
      return true;
    }
    return false;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Computed properties for backward compatibility
  const emailVerified = currentUser?.emailVerified || false;

  const value = {
    currentUser,
    userProfile,
    userRole,
    emailVerified,
    loading,
    needsRoleSelection,
    pendingUserData,
    signInWithGoogle,
    signUp,
    signIn,
    logout,
    completeProfile,
    sendVerificationEmail,
    // Aliases for backward compatibility
    login: signIn,
    signup: signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
