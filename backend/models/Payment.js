import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true, trim: true },
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicePackage', required: true },
  amountPaid: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
}, { timestamps: true })

paymentSchema.pre('save', async function (next) {
  if (!this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments()
    this.paymentNumber = `PAY-${String(count + 1).padStart(3, '0')}`
  }
  next()
})

export default mongoose.model('Payment', paymentSchema)
