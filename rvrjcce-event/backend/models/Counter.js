import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export async function getNextSequence(sequenceName = 'registrationId') {
  try {
    const counter = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqNum = counter.seq;
    // Format CD26 + 6 digit zero padding (e.g. CD26000001)
    return `CD26${String(seqNum).padStart(6, '0')}`;
  } catch (err) {
    // Fallback if Mongo unavailable
    const fallbackSeq = Math.floor(1000 + Math.random() * 9000);
    return `CD26${String(fallbackSeq).padStart(6, '0')}`;
  }
}
