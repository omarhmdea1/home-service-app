import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  updateProfile,
  sendEmailVerification,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  // Function to ensure user role is set correctly
  const ensureUserRole = async (uid, email) => {
    console.log('Ensuring user role is set for:', email);
    try {
      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if role exists
        if (!userData.role) {
          console.log('No role found in Firestore, setting default role: customer');
          
          // Update Firestore with default role
          await updateDoc(userDocRef, { role: 'customer' });
          
          // Update state
          setUserRole('customer');
          return 'customer';
        } else {
          // Role exists, just return it
          console.log('User role found in Firestore:', userData.role);
          setUserRole(userData.role);
          return userData.role;
        }
      } else {
        // No user document exists, create one with default role
        console.log('No user document found, creating one with default role');
        await setDoc(userDocRef, { 
          uid: uid, 
          email, 
          role: 'customer',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
        
        // Update state
        setUserRole('customer');
        return 'customer';
      }
    } catch (error) {
      console.error('Error in ensureUserRole:', error);
      
      // Default to customer role in case of error
      console.log('Using default role as fallback: customer');
      setUserRole('customer');
      return 'customer';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        setEmailVerified(user.emailVerified);
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', { 
              email: user.email, 
              role: userData.role,
              uid: user.uid
            });
            
            // If role is missing, ensure it's set
            if (!userData.role) {
              await ensureUserRole(user.uid, user.email);
            } else {
              setUserRole(userData.role);
            }
            
            setUserProfile(userData);
            
            // Update lastLogin
            await updateDoc(userDocRef, {
              lastLogin: serverTimestamp()
            });
          } else {
            console.warn('No user document found for:', user.email, user.uid);
            // Ensure user role is set
            await ensureUserRole(user.uid, user.email);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Attempt to fix the issue by ensuring role
          await ensureUserRole(user.uid, user.email);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();
      
      try {
        // Log the additionalData to debug
        console.log('Creating user profile with data:', additionalData);
        
        // Ensure role is properly set
        const userRole = additionalData.role || 'customer';
        console.log('Setting user role to:', userRole);
        
        // Create user document in Firestore
        await setDoc(userRef, {
          uid: user.uid,
          email,
          name: displayName || additionalData.name || email.split('@')[0],
          photoURL: photoURL || '',
          role: userRole,
          createdAt,
          lastLogin: createdAt,
          phone: additionalData.phone || '',
          isVerified: userRole === 'provider' ? false : true,
          serviceArea: additionalData.serviceArea || '',
          providerDescription: additionalData.providerDescription || ''
        });
        
        // Update user role state
        setUserRole(userRole);
        console.log('User role state updated to:', userRole);
        
        // Save to local storage as backup
        saveUserToLocalStorage(user.uid, {
          uid: user.uid,
          email,
          name: displayName || additionalData.name || email.split('@')[0],
          role: userRole
        });
        
        // Fetch the newly created profile
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error creating user profile', error);
      }
    }
  };
  
  const signup = async (email, password, additionalData = {}) => {
    console.log('Signing up user with data:', { email, ...additionalData });
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Set display name if provided
    if (additionalData.name) {
      await updateProfile(user, { displayName: additionalData.name });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Make sure role is explicitly set
    if (!additionalData.role) {
      console.warn('No role specified during signup, defaulting to customer');
      additionalData.role = 'customer';
    } else {
      console.log('User role during signup:', additionalData.role);
    }
    
    // Set user role in state immediately
    setUserRole(additionalData.role);
    
    // Create user profile in Firestore
    await createUserProfile(user, additionalData);
    
    console.log('User signup completed with role:', additionalData.role);
    
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  };

  const logout = () => {
    return signOut(auth);
  };

  const signInWithGoogle = async (additionalData = {}) => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      
      console.log('Google sign-in successful in AuthProvider');
      
      // Check if user already exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      
      // If user doesn't exist, create profile with provided role
      // Otherwise, keep existing role
      if (!snapshot.exists()) {
        console.log('Creating new user profile for Google user');
        await createUserProfile(user, additionalData);
      } else {
        console.log('Updating existing Google user');
        // Update lastLogin for existing user
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        });
        
        // Update local state with user role from Firestore
        const userData = snapshot.data();
        setUserRole(userData.role);
        setUserProfile(userData);
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };

  // Function to update user role
  const updateUserRole = async (uid, newRole) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        role: newRole,
        isVerified: newRole === 'provider' ? false : true,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserRole(newRole);
      
      // Refresh user profile
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  };
  
  // Function to send verification email
  const sendVerificationEmail = async () => {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
      return true;
    }
    return false;
  };

  // Function to delete user account
  const deleteAccount = async (password = null) => {
    if (!currentUser) {
      console.error('No user is currently logged in');
      throw new Error('No user is currently logged in');
    }

    try {
      // For email/password users, we need to reauthenticate before deletion
      if (password && currentUser.providerData[0].providerId === 'password') {
        // Create the credential
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          password
        );
        
        // Reauthenticate
        await reauthenticateWithCredential(currentUser, credential);
      }
      
      // Delete user data from Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userRef);
      
      // Delete the user authentication account
      await deleteUser(currentUser);
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    emailVerified,
    signup,
    login,
    logout,
    signInWithGoogle,
    createUserProfile,
    updateUserRole,
    ensureUserRole,
    sendVerificationEmail,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
