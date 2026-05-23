import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, minlength: 4 },
  securityQuestion: { type: String, required: true },
  securityAnswer: { type: String, required: true },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  this.securityAnswer = await bcrypt.hash(this.securityAnswer.toLowerCase().trim(), 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.compareSecurityAnswer = function (candidate) {
  return bcrypt.compare(candidate.toLowerCase().trim(), this.securityAnswer)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.securityAnswer
  delete obj.__v
  return obj
}

export default mongoose.model('User', userSchema)
