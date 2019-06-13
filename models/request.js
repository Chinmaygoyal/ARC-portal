const mongoose = require("mongoose");

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
