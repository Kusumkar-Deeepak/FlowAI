import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: [true,'Project name already exists'],
  },
  users:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})


const Project = mongoose.model('project', projectSchema);

export default Project;