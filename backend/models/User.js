const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const options = { discriminatorKey: 'role', timestamps: true };

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Child', 'SchoolPsychologist', 'Admin'] },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, options);

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

const Child = User.discriminator('Child', new mongoose.Schema({
  age: { type: Number, required: true, min: 10, max: 17 },
  isFlagged: { type: Boolean, default: false },
}));

const SchoolPsychologist = User.discriminator('SchoolPsychologist', new mongoose.Schema({}));

const Admin = User.discriminator('Admin', new mongoose.Schema({}));

module.exports = { User, Child, SchoolPsychologist, Admin };
