import mongoose from 'mongoose';

const momentumSnapshotSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  spEarned: { type: Number, default: 0 },
  meaningfulSp: { type: Number, default: 0 },
  attendanceFlag: { type: Boolean, default: false },
  pollFlag: { type: Boolean, default: false },
  streakDays: { type: Number, default: 0 },
  momentumScore: { type: Number, default: null },
  state: { type: String, enum: ['high', 'slowing', 'lost', null], default: null },
  computedAt: { type: Date, default: Date.now }
}, { timestamps: false });

momentumSnapshotSchema.index({ studentEmail: 1, date: 1 }, { unique: true });

const MomentumSnapshot = mongoose.model('MomentumSnapshot', momentumSnapshotSchema);
export default MomentumSnapshot;