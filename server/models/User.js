import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: false, // Optional for Google authenticated users
      minlength: [6, 'Password must be at least 6 characters'],
      // Never ship the hash in query results unless explicitly asked for
      // via .select('+password') (used only when verifying a login).
      select: false,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // Extended profile fields (populated from Settings modal)
    age: {
      type: Number,
      default: null,
    },
    mobile: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    avatarColor: {
      type: String,
      default: '#7c5cfc',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving — only when it has changed, so profile
// updates that don't touch the password don't re-hash an already-hashed value.
//
// ⚠️  Mongoose v9 + async pre-hooks: do NOT call next() — returning the
// resolved promise is what signals completion to Mongoose. In Mongoose 9,
// the argument is SaveOptions (an object), NOT a function; calling next()
// throws "TypeError: next is not a function" which surfaces as HTTP 500.
userSchema.pre('save', async function hashPassword() {
  console.log('[User.pre-save] triggered. isNew:', this.isNew, '| isModified(password):', this.isModified('password'));
  if (!this.isModified('password') || !this.password) {
    console.log('[User.pre-save] password unchanged or absent — skipping hash');
    return;
  }
  console.log('[User.pre-save] hashing password...');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('[User.pre-save] password hashed OK');
  // No next() call — the returned Promise is the signal in Mongoose v9.
});

// Compare a plaintext candidate against the stored hash.
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// MongoDB will automatically create the 'users' collection when the first user is inserted
const User = mongoose.model('User', userSchema);

export default User;
