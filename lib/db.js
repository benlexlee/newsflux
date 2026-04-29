import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

// Schemas
const AdSettingsSchema = new mongoose.Schema({
  topBannerCode: { type: String, default: '' },
  middleBannerCode: { type: String, default: '' },
  bottomBannerCode: { type: String, default: '' },
  videoAdCode: { type: String, default: '' },
  interstitialAdCode: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

const NewsSchema = new mongoose.Schema({
  originalUrl: { type: String, unique: true },
  title: String,
  summary: String,
  source: String,
  category: String,
  imageUrl: String,
  publishedAt: Date,
  updatedAt: Date,
});

export const AdSettings = mongoose.models.AdSettings || mongoose.model('AdSettings', AdSettingsSchema);
export const News = mongoose.models.News || mongoose.model('News', NewsSchema);