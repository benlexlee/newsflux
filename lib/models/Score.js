import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
  game: { type: String, enum: ['chess', 'sudoku', 'runner'], required: true },
  nickname: { type: String, required: true, trim: true },
  score: { type: Number, required: true },
  time: { type: Number, default: null },
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Score || mongoose.model('Score', ScoreSchema);