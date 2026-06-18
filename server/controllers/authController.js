import { auth } from '../config/firebase.js';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

const authResponse = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
  authProvider: user.authProvider,
  token: generateToken(user.id),
});

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ message: 'No ID token provided' });
    }
    
    if (!auth || !auth.verifyIdToken) {
      return res.status(500).json({ message: 'Firebase Admin not configured on server' });
    }
    
    // Verify token with Firebase
    const decodedToken = await auth.verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;
    
    if (!email) {
      return res.status(400).json({ message: 'Google account has no email associated' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (user) {
      // Merge strategy: Update lastLogin and authProvider.
      // Set profilePicture if the user doesn't already have one.
      user.lastLogin = Date.now();
      user.authProvider = 'google';
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }
      await user.save();
    } else {
      // Create new user
      isNewUser = true;
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        profilePicture: picture || '',
        authProvider: 'google',
        lastLogin: Date.now(),
      });
    }
    
    return res.status(isNewUser ? 201 : 200).json(authResponse(user));
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ message: 'Invalid Google token', error: error.message });
  }
};
