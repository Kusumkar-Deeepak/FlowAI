import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import {validationResult} from 'express-validator';
import redisClient from '../services/redis.service.js';

export const createUserController = async(req,res) => {
  const error = validationResult(req);

  if(!error.isEmpty()) {
    return res.status(400).json({errors: error.array()});
  }

  try {
    const newUser = await userService.createUser(req.body);
    const token = await newUser.generateToken();
    // console.log(token);
    delete newUser._doc.password;
    res.status(200).json({newUser, token});
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const loginUserController = async(req,res) => {
  const error = validationResult(req);

  if(!error.isEmpty()) {
    return res.status(400).json({errors: error.array()});
  }

  try {
    const {email, password}  = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
      return res.status(401).json({message: 'User not found'});
    }

    const isMatch = await user.validatePassword(password);
    
    if(!isMatch){
      return res.status(401).json({message: 'Invalid password'});
    }
    
    const token = await user.generateToken();
    delete user._doc.password;
    res.status(200).json({user, token});

  } catch (error) {
    res.status(400).send(error.message);
  }
}

export const getUserProfileController = async(req,res) => {
  console.log(req.user);

  res.status(200).json({
    user: req.user
  })
}

export const logoutUserController = async(req,res)  => {
  try{
    const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

    redisClient.set(token, 'logout', 'EX', 60*60*24);

    res.status(200).json({
      message: 'Logged out successfully'
    });

  }catch(error){
    res.status(400).send(error.message);
  }

}

export const getAllUsersController = async(req,res) => {
  try{
    const loggedInUser = await userModel.findOne({email: req.user.email});
    const allUsers = await userService.getAllUsers(loggedInUser._id);

    res.status(200).json(allUsers);
  }
  catch(err){
    console.log(err);
    res.status(400).json({error: err.message});
  }
}