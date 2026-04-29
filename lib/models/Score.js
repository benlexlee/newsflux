import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  game: { type: String, enum: ['chess', 'sudoku', 'runner', 'shooter'], required: true },
  nickname: { type: String, required: true, trim: true },
  score: { type: Number, default: 0 },
  time: { type: Number, default: null },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);