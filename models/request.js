// const Joi = require("joi");
const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");
// const config = require("config");

const requestSchema = new mongoose.Schema({
  project:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor'
  },
  student:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  status: {
      type: Boolean,
      default: null
  },  
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Request = mongoose.model("Request", requestSchema);

exports.Request = Request;
