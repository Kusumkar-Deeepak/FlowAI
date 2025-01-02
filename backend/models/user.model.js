import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [6, 'Email must be at least 6 characters long'],
    maxlength: [50, 'Email must not be more than 50 characters long'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
}

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return token;
}

const User = mongoose.model('User', userSchema);
export default User;