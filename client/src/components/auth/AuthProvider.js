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
import { auth } from '../../firebase';
import { getCurrentUserProfile, updateUserProfile, setupAuthListener } from '../../services/userService';
import { getIdToken, setAuthToken, removeAuthToken } from '../../utils/authToken';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);
  const [tempUserCredential, setTempUserCredential] = useState(null);

  // Function to ensure user role is set correctly
  const ensureUserRole = async (uid, email, isGoogleSignIn = false) => {
    console.log('Ensuring user role is set for:', email, 'Google Sign In:', isGoogleSignIn);
    try {
      // Try to get user profile from our backend API
      try {
        const userProfile = await getCurrentUserProfile();
        console.log('User profile from API:', userProfile);
        setUserRole(userProfile.role);
        return userProfile.role;
      } catch (apiError) {
        console.warn('Could not fetch user from API:', apiError.message);
        
        // If this is a Google sign-in, we should trigger role selection instead of creating a default profile
        if (isGoogleSignIn) {
          console.log('New Google user detected - will trigger role selection');
          // Don't create a profile yet - we'll do that after role selection
          return null; // Return null to indicate role selection is needed
        } else {
          console.log('Creating new profile with default customer role');
          // For non-Google sign-ins, create with default customer role
          const userData = {
            firebaseUid: uid, 
            email: email,
            name: email.split('@')[0],
            photoURL: '',
            role: 'customer' // Default role
          };
          
          await updateUserProfile(userData);
          setUserRole('customer');
          return 'customer';
        }
      }
    } catch (error) {
      console.error('Error in ensureUserRole:', error);
      if (isGoogleSignIn) {
        return null; // Trigger role selection for Google users even on error
      }
      // Default to customer role in case of error for non-Google users
      setUserRole('customer');
      return 'customer';
    }
  };

  useEffect(() => {
    // Setup auth listener to handle token management
    setupAuthListener();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        setEmailVerified(user.emailVerified);
        try {
          // Get fresh token for API calls
          await getIdToken();
          
          try {
            const userProfile = await getCurrentUserProfile();
            setUserRole(userProfile.role);
            setUserProfile(userProfile);
            // If we have a user profile, we don't need role selection
            setNeedsRoleSelection(false);
          } catch (apiError) {
            console.warn('Could not fetch user from API:', apiError.message);
            
            // Check if this is a Google sign-in by looking at the auth provider
            const isGoogleSignIn = user.providerData && 
              user.providerData.length > 0 && 
              user.providerData[0].providerId === 'google.com';
            
            console.log('Is Google Sign In:', isGoogleSignIn);
            
            // Try to ensure user role, passing the Google sign-in flag
            const role = await ensureUserRole(user.uid, user.email, isGoogleSignIn);
            
            // If role is null, it means we need role selection for a Google user
            if (role === null && isGoogleSignIn) {
              console.log('Setting up for role selection');
              setTempUserCredential({
                user,
                additionalData: {}
              });
              setNeedsRoleSelection(true);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Attempt to fix the issue by ensuring role
          // For errors, don't pass Google flag to ensure we get a default role
          await ensureUserRole(user.uid, user.email, false);
        }
      } else {
        // User is signed out
        removeAuthToken();
        setUserRole(null);
        setUserProfile(null);
        setNeedsRoleSelection(false);
        setTempUserCredential(null);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const createUserProfile = async (user, additionalData = {}) => {
    try {
      // Create user profile using the API
      const userData = {
        firebaseUid: user.uid, // Changed from uid to firebaseUid to match backend schema
        email: user.email,
        name: user.displayName || additionalData.name || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        role: additionalData.role || 'customer',
        isVerified: additionalData.role === 'provider' ? false : true,
        phoneNumber: additionalData.phoneNumber || '',
        address: additionalData.address || ''
      };
      
      // Update user profile through API
      const createdProfile = await updateUserProfile(userData);
      setUserRole(createdProfile.role);
      setUserProfile(createdProfile);
      return createdProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };
  
  const signup = async (email, password, additionalData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Set display name if provided
    if (additionalData.name) {
      await updateProfile(user, { displayName: additionalData.name });
    }
    
    // Send email verification only for providers
    if (additionalData.role === 'provider') {
      await sendEmailVerification(user);
    }
    
    // Create user profile in our backend database
    await createUserProfile(user, additionalData);
    
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
      
      try {
        // Try to get existing user profile from API
        const userProfile = await getCurrentUserProfile();
        console.log('Existing user profile found for Google user');
        setUserRole(userProfile.role);
        setUserProfile(userProfile);
      } catch (error) {
        // User doesn't exist in our backend
        console.log('New Google user - needs role selection');
        
        // Store the user credential temporarily - we'll create the profile after role selection
        setTempUserCredential({
          user,
          additionalData
        });
        
        // Set a flag to show role selection UI
        setNeedsRoleSelection(true);
        return { needsRoleSelection: true, userCredential };
      }
      
      return userCredential;
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };
  
  // Function to complete profile creation after role selection
  const completeProfileWithRole = async (selectedRole) => {
    try {
      if (!tempUserCredential) {
        throw new Error('No temporary user credential found');
      }
      
      const { user, additionalData } = tempUserCredential;
      
      // Create user profile with selected role
      await createUserProfile(user, { ...additionalData, role: selectedRole });
      
      // Clear temporary storage
      setTempUserCredential(null);
      setNeedsRoleSelection(false);
      
      return true;
    } catch (error) {
      console.error('Error completing profile with role:', error);
      throw error;
    }
  };

  // Function to update user role
  const updateUserRole = async (uid, newRole) => {
    try {
      // Update role through API
      const updatedProfile = await updateUserProfile({
        role: newRole,
        isVerified: newRole === 'provider' ? false : true
      });
      
      // Update local state
      setUserRole(newRole);
      setUserProfile(updatedProfile);
      
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
      
      // Delete user data from backend API
      // Note: We would need to add a delete endpoint in the API
      // For now, we'll just delete the Firebase auth account
      
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
    userProfile,
    userRole,
    loading,
    needsRoleSelection,
    signup,
    login,
    logout,
    signInWithGoogle,
    updateUserRole,
    updateProfile,
    deleteAccount,
    createUserProfile,
    ensureUserRole,
    completeProfileWithRole,
    sendVerificationEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
