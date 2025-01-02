import mongoose from 'mongoose';
import projectModel from '../models/project.model.js';

export const createProject = async ({
  name,
  userId
}) => {
  if (!name) {
    throw new Error('Name is required')
  }
  if (!userId) {
    throw new Error('User Id is required')
  }

  const project = await projectModel.create({
    name,
    users : [userId]
  });

  return project;
}

export const getAllProjectByUserId = async (userId) => {
  if(!userId){
    throw new Error('UserId is required')
  }

  const allUserProjects = await projectModel.find({users : userId});

  return allUserProjects;
}


export const addUsersToProjects = async({projectId, users, userId}) => {
  if(!projectId){
    throw new Error('Project Id is required')
  }

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new Error('Invalid Project Id')
  }

  if(!users){
    throw new Error('Users are required')
  }

  if(!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))){
    throw new Error('Invalid UserId(s) in users array');
  }

  if(!userId){
    throw new Error('User Id is required')
  }

  if(!mongoose.Types.ObjectId.isValid(userId)){
    throw new Error('Invalid User Id')
  }

  const project = await projectModel.findOne({
    _id : projectId,
    users: userId
  })

  if(!project){
    throw new Error('User is not a member of the project')
  }
  const updatedProject = await projectModel.findOneAndUpdate({
    _id : projectId
  }, {
    $addToSet : {
      users : {
        $each : users
      }
    }
  }, {
    new : true
  })

  return updatedProject;
}

export const getProjectById = async({projectId}) => {
  if(!projectId){
    throw new Error('Project Id is required')
  }

  if(!mongoose.Types.ObjectId.isValid(projectId)){
    throw new Error('Invalid Project Id')
  }
  const project = await projectModel.findOne({
    _id : projectId
  }).populate('users');

  return project;
}