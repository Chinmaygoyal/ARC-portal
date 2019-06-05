// const Joi = require("joi");
const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const config = require("config");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3
  },
  professor: {
  },
  no_openings: {
      type: Number,
      required: true
  },
  description: {
      type: String,
      required: true,
      minlength: 100
    //   maxlength: 
  },
  eligibility: {
      type: String,
  },
  pre_requisites: String,
  //Duration to be specifies in months
  duration: Number,
  available: {
      type: Boolean,
      default: true
  },

  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Project = mongoose.model("Project", projectSchema);
exports.Project = Project;
