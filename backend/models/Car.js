import mongoose from 'mongoose'

const carSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
  carType: { type: String, required: true, trim: true },
  carSize: { type: String, required: true, trim: true },
  driverName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
}, { timestamps: true })

export default mongoose.model('Car', carSchema)
