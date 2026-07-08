import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserSchema } from '../auth/schemas/user.schema';

async function seedUser() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before running this script',
    );
  }

  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/techmagnate';
  await mongoose.connect(uri);

  const UserModel = mongoose.model('User', UserSchema);
  const passwordHash = await bcrypt.hash(password, 10);

  await UserModel.updateOne(
    { username },
    { $set: { username, passwordHash } },
    { upsert: true },
  );

  console.log(`Admin user "${username}" is ready.`);

  await mongoose.disconnect();
}

seedUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
