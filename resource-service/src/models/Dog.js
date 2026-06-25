import mongoose from 'mongoose';

const dogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    breed: { type: String, required: true },
    subBreed: { type: String },
    imageUrl: { type: String },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Dog', dogSchema);
