import userModel from '../models/user.model.js'

export const createUser = async ({ 
  email, password }) => {

    if(!email || !password) {
      throw new Error('Missing email or password')
    }

    const hashedpassword = await userModel.hashPassword(password);
    
    const existingUser = await userModel.create({ 
      email,
      password: hashedpassword
    });

    return existingUser ;

  }

  export const getAllUsers = async(userId) => {
    console.log(userId)
    const users = await userModel.find({
      _id: { $ne: userId }  // exclude the current user
    });
    return users;
  }