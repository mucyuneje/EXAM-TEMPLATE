import mongoose from 'mongoose'

const packageSchema = new mongoose.Schema({
  packageNumber: { type: String, unique: true, trim: true },
  packageName: { type: String, required: true, trim: true },
  packageDescription: { type: String, default: '', trim: true },
  packagePrice: { type: Number, required: true, min: 0 },
}, { timestamps: true })

packageSchema.pre('save', async function (next) {
  if (!this.packageNumber) {
    const count = await mongoose.model('Package').countDocuments()
    this.packageNumber = `PKG-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

export default mongoose.model('Package', packageSchema)
