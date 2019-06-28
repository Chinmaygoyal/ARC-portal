const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const professorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  department: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  password: {
    type: String,
    // Password required only when email is verified
    required: function() {
      return this.isVerified;
    },
    minlength: 8,
    maxlength: 1024
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// Delete unverified accounts after 24 hrs
// professorSchema.index({ createdAt: 1 }, { expires: '24h' });

// Generate login auth token
professorSchema.methods.generateAuthToken = function(
  options = { useMailKey: true }
) {
  const key = options.useMailKey
    ? config.get("mailTokenKey")
    : config.get("authTokenKey");
  const jwtOptions = options.useMailKey ? { expiresIn: "30m" } : undefined;
  const token = jwt.sign(
    {
      _id: this._id,
      department: this.department,
      email: this.email,
      is_prof: true
    },
    key,
    jwtOptions
  );
  return token;
};

// Validate professor login info
function validate(professorLoginInfo) {
  const schema = {
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
  };
  return Joi.validate(professorLoginInfo, schema);
}

const Professor = mongoose.model("Professor", professorSchema);
exports.Professor = Professor;
exports.validateProfessor = validate;
