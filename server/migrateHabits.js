/**
 * Migration Script: Assign userId to orphaned habits.
 *
 * Usage:
 *   node migrateHabits.js              — Run the migration
 *   node migrateHabits.js --dry-run    — Preview changes without writing
 *
 * This script finds all habits without a `userId` field and assigns them
 * to a target user. By default it picks the first user in the database.
 * Set the TARGET_USER_EMAIL env var to assign to a specific user instead.
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Habit from './models/Habit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const isDryRun = process.argv.includes('--dry-run');

async function migrate() {
  console.log('🔄 Momentum Habit Migration — Assign userId to orphaned habits');
  console.log(`   Mode: ${isDryRun ? 'DRY RUN (no changes will be written)' : 'LIVE'}`);
  console.log('');

  // ── Connect ──
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set. Add it to server/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Find orphaned habits ──
  const orphanedHabits = await Habit.find({
    $or: [{ userId: { $exists: false } }, { userId: null }],
  });

  if (orphanedHabits.length === 0) {
    console.log('✅ No orphaned habits found — nothing to migrate.');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log(`📋 Found ${orphanedHabits.length} orphaned habit(s):`);
  orphanedHabits.forEach((h) => {
    console.log(`   • "${h.title}" (id: ${h._id}, category: ${h.category})`);
  });

  // ── Find target user ──
  let targetUser;
  if (process.env.TARGET_USER_EMAIL) {
    targetUser = await User.findOne({ email: process.env.TARGET_USER_EMAIL });
    if (!targetUser) {
      console.error(`❌ No user found with email: ${process.env.TARGET_USER_EMAIL}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  } else {
    targetUser = await User.findOne({}).sort({ createdAt: 1 });
    if (!targetUser) {
      console.error('❌ No users found in the database. Create a user first.');
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`\n🎯 Target user: ${targetUser.name} (${targetUser.email}, id: ${targetUser._id})`);

  // ── Assign ──
  if (isDryRun) {
    console.log('\n🏁 DRY RUN — would assign all orphaned habits to the target user.');
    console.log('   Run without --dry-run to apply changes.');
  } else {
    const result = await Habit.updateMany(
      { $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: targetUser._id } }
    );
    console.log(`\n✅ Migration complete. Updated ${result.modifiedCount} habit(s).`);
  }

  // ── Verify ──
  const remainingOrphans = await Habit.countDocuments({
    $or: [{ userId: { $exists: false } }, { userId: null }],
  });
  if (!isDryRun) {
    console.log(`   Remaining orphans: ${remainingOrphans}`);
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
