const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  no_openings: {
      type: Number,
      required: true
  },
  description: {
      type: String,
      required: true,
     // minlength: 100
    //   maxlength: 
  },
  eligibility: {
      type: String,
  },
  pre_requisites: String,
  //Duration to be specified in months
  duration: Number,
  available: {
      type: Boolean,
      default: true
  },
  no_requests: {
    type: Number,
    default: 0
  },
  department:{
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  students: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Student'
  },
});
const Project = mongoose.model("Project", projectSchema);


exports.Project = Project;
