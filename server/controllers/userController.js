import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * Shape the user object we send back to the client. Never includes the
 * password hash, always includes a fresh JWT.
 */
const authResponse = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
  authProvider: user.authProvider,
  age: user.age ?? null,
  mobile: user.mobile || '',
  location: user.location || '',
  bio: user.bio || '',
  avatarColor: user.avatarColor || '#7c5cfc',
  token: generateToken(user.id),
});

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  console.log('[registerUser] hit. body keys:', Object.keys(req.body));
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      console.warn('[registerUser] missing field(s). name:', !!name, 'email:', !!email, 'password:', !!password);
      return res
        .status(400)
        .json({ message: 'Name, email and password are all required' });
    }
    if (password.length < 6) {
      console.warn('[registerUser] password too short:', password.length);
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    console.log('[registerUser] checking for existing user, email:', email);
    // Check if user exists
    const userExists = await User.findOne({ email });
    console.log('[registerUser] findOne done. exists:', !!userExists);
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    console.log('[registerUser] calling User.create...');
    // Create user — the model's pre-save hook hashes the password.
    const user = await User.create({ name, email, password });
    console.log('[registerUser] User.create OK. id:', user.id);

    console.log('[registerUser] generating JWT...');
    const response = authResponse(user);
    console.log('[registerUser] JWT generated OK. responding 201.');
    return res.status(201).json(response);
  } catch (error) {
    console.error('[registerUser] ERROR -------');
    console.error('  name   :', error.name);
    console.error('  message:', error.message);
    console.error('  code   :', error.code);
    if (error.keyPattern) console.error('  keyPattern:', JSON.stringify(error.keyPattern));
    if (error.errors)    console.error('  validation:', JSON.stringify(error.errors));
    console.error('  stack  :', error.stack);
    console.error('[registerUser] -------------------');

    // Surface Mongoose validation errors as 400 rather than a generic 500.
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Invalid input';
      return res.status(400).json({ message });
    }
    // Duplicate key (unique email constraint)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    return res.status(500).json({
      message: 'Registration failed',
      error: error.message,
      errorName: error.name,
    });
  }
};

/**
 * @desc    Authenticate a user and return a JWT
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  console.log('[loginUser] hit. body keys:', Object.keys(req.body));
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    console.log('[loginUser] looking up user, email:', email);
    // password is select:false on the schema, so we must ask for it here.
    const user = await User.findOne({ email }).select('+password');
    console.log('[loginUser] findOne done. found:', !!user);

    if (user) {
      console.log('[loginUser] comparing password...');
      const match = await user.matchPassword(password);
      console.log('[loginUser] password match:', match);
      if (match) {
        console.log('[loginUser] generating JWT...');
        const response = authResponse(user);
        console.log('[loginUser] login OK. responding 200.');
        return res.json(response);
      }
    }

    // Same message for "no such user" and "wrong password" — don't leak
    // which emails are registered.
    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('[loginUser] ERROR:', error.name, error.message);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/users/profile
 * @access  Private (requires `protect` middleware)
 */
export const getUserProfile = async (req, res) => {
  const u = req.user;
  return res.json({
    _id: u._id,
    name: u.name,
    email: u.email,
    profilePicture: u.profilePicture,
    authProvider: u.authProvider,
    age: u.age ?? null,
    mobile: u.mobile || '',
    location: u.location || '',
    bio: u.bio || '',
    avatarColor: u.avatarColor || '#7c5cfc',
  });
};

/**
 * @desc    Update the authenticated user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, age, mobile, location, bio, avatarColor, profilePicture } = req.body;

    if (name !== undefined)           user.name           = name.trim();
    if (email !== undefined)          user.email          = email.trim().toLowerCase();
    if (age !== undefined)            user.age            = age ? Number(age) : null;
    if (mobile !== undefined)         user.mobile         = mobile;
    if (location !== undefined)       user.location       = location;
    if (bio !== undefined)            user.bio            = bio;
    if (avatarColor !== undefined)    user.avatarColor    = avatarColor;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updated = await user.save();

    return res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      profilePicture: updated.profilePicture,
      authProvider: updated.authProvider,
      age: updated.age ?? null,
      mobile: updated.mobile || '',
      location: updated.location || '',
      bio: updated.bio || '',
      avatarColor: updated.avatarColor || '#7c5cfc',
    });
  } catch (error) {
    console.error('[updateUserProfile] ERROR:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'That email is already taken by another account' });
    }
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users/
 * @access  Private
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
