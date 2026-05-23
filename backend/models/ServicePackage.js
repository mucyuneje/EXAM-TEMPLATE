import mongoose from 'mongoose'

const servicePackageSchema = new mongoose.Schema({
  recordNumber: { type: String, unique: true, trim: true },
  serviceDate: { type: Date, required: true, default: Date.now },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
}, { timestamps: true })

servicePackageSchema.pre('save', async function (next) {
  if (!this.recordNumber) {
    const count = await mongoose.model('ServicePackage').countDocuments()
    this.recordNumber = `SP-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

export default mongoose.model('ServicePackage', servicePackageSchema)
