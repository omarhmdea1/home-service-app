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
      // Try to get user profile from our MongoDB backend API
      try {
        const userProfile = await getCurrentUserProfile();
        console.log('User profile from MongoDB API:', userProfile);
        
        // Set user role and profile in state
        setUserRole(userProfile.role);
        setUserProfile(userProfile);
        setNeedsRoleSelection(false); // Ensure role selection is not needed
        
        return userProfile.role;
      } catch (apiError) {
        console.warn('Could not fetch user from MongoDB API:', apiError.message);
        
        // For all new users, create a default profile with customer role
        // This prevents unnecessary role selection prompts
        console.log('Creating new profile with default customer role in MongoDB');
        const userData = {
          firebaseUid: uid, 
          email: email,
          name: email.split('@')[0] || 'User',
          photoURL: '',
          role: 'customer', // Default role
          isVerified: true
        };
        
        // Create user profile in MongoDB
        const newProfile = await updateUserProfile(userData);
        console.log('Created new user profile:', newProfile);
        
        // Update state with new profile
        setUserRole('customer');
        setUserProfile(newProfile);
        setNeedsRoleSelection(false); // Ensure role selection is not needed
        
        return 'customer';
      }
    } catch (error) {
      console.error('Error in ensureUserRole:', error);
      
      // Even on error, create a default profile to prevent role selection issues
      try {
        const userData = {
          firebaseUid: uid, 
          email: email,
          name: email.split('@')[0] || 'User',
          photoURL: '',
          role: 'customer', // Default role
          isVerified: true
        };
        
        const newProfile = await updateUserProfile(userData);
        setUserRole('customer');
        setUserProfile(newProfile);
        setNeedsRoleSelection(false);
      } catch (profileError) {
        console.error('Failed to create fallback profile:', profileError);
      }
      
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
          
          // Always ensure user has a role in MongoDB
          const role = await ensureUserRole(user.uid, user.email, false);
          console.log('User role ensured:', role);
          
          // We should never need role selection now as ensureUserRole creates a default profile
          setNeedsRoleSelection(false);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          
          try {
            // Create a default user profile with customer role
            const userData = {
              firebaseUid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              photoURL: user.photoURL || '',
              role: 'customer' // Default role
            };
            
            await updateUserProfile(userData);
            setUserRole('customer');
            setNeedsRoleSelection(false);
          } catch (profileError) {
            console.error('Error creating default profile:', profileError);
            // If we still can't create a profile, show role selection as fallback
            setTempUserCredential({
              user,
              additionalData: {}
            });
            setNeedsRoleSelection(true);
          }
        }
      } else {
        // User is signed out
        removeAuthToken();
        setUserRole('');
        setUserProfile({});
        setNeedsRoleSelection(false);
        setTempUserCredential(undefined);
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

  // Google Sign In
  const signInWithGoogle = async (additionalData = {}) => {
    try {
      const provider = new GoogleAuthProvider();
      console.log('DEBUG: Starting Google sign-in process');
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      
      console.log('DEBUG: Google sign-in successful for:', user.email);
      console.log('DEBUG: User UID:', user.uid);
      console.log('DEBUG: Provider data:', JSON.stringify(user.providerData));
      
      try {
        console.log('DEBUG: Checking for existing user profile in our backend');
        const userProfile = await getCurrentUserProfile();
        console.log('DEBUG: User profile found:', userProfile);
        setUserRole(userProfile.role);
        setUserProfile(userProfile);
        console.log('DEBUG: User role set to:', userProfile.role);
      } catch (error) {
        console.log('DEBUG: No existing user profile found, error:', error.message);
        console.log('DEBUG: Setting up for role selection');
        setTempUserCredential({ user, additionalData });
        setNeedsRoleSelection(true);
        console.log('DEBUG: needsRoleSelection set to true, tempUserCredential stored');
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
    console.log('DEBUG: completeProfileWithRole called with role:', selectedRole);
    
    if (!tempUserCredential) {
      console.error('DEBUG: Error - No temporary user credential found');
      throw new Error('No temporary user credential found');
    }
    
    const { user, additionalData } = tempUserCredential;
    console.log('DEBUG: Using tempUserCredential for user:', user.email);
    
    try {
      console.log('DEBUG: Creating user profile with role:', selectedRole);
      
      // Create user profile data
      const userData = {
        firebaseUid: user.uid,
        email: user.email,
        name: user.displayName || additionalData.name || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        role: selectedRole,
        isVerified: selectedRole === 'provider' ? false : true,
        phoneNumber: additionalData.phoneNumber || '',
        address: additionalData.address || ''
      };
      
      // Update user profile in MongoDB through API
      const profile = await updateUserProfile(userData);
      console.log('DEBUG: User profile created successfully in MongoDB:', profile);
      
      // If this is a provider, create a provider profile as well
      if (selectedRole === 'provider' && additionalData.businessName) {
        try {
          // Create a basic provider profile
          const providerProfileData = {
            userId: user.uid,
            businessName: additionalData.businessName || `${userData.name}'s Business`,
            description: additionalData.description || 'Professional service provider',
            yearsOfExperience: additionalData.yearsOfExperience || 1,
            serviceArea: additionalData.serviceArea || ['Tel Aviv'],
            isVerified: false
          };
          
          // Make API call to create provider profile
          await fetch('/api/provider-profiles', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getIdToken()}`
            },
            body: JSON.stringify(providerProfileData)
          });
          
          console.log('DEBUG: Provider profile created successfully');
        } catch (providerProfileError) {
          console.error('DEBUG: Error creating provider profile:', providerProfileError);
          // Continue even if provider profile creation fails
        }
      }
      
      // Update the user role state
      setUserRole(selectedRole);
      setUserProfile(profile);
      console.log('DEBUG: User role state updated to:', selectedRole);
      
      // Clear the temporary credential and role selection flag
      setTempUserCredential(null);
      setNeedsRoleSelection(false);
      console.log('DEBUG: Cleared tempUserCredential and needsRoleSelection');
      
      return profile;
    } catch (error) {
      console.error('DEBUG: Error creating user profile:', error);
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
