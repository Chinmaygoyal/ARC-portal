const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 1024
    }
});

// Generate login auth token
studentSchema.methods.generateAuthToken = function() {
    // TODO: Add an expiration time to the token 
    const token = jwt.sign({ _id: this._id, rollNumber: this.rollNumber, email: this.email }, config.get("authTokenKey"));
    return token;
};

// Validate student login info
function validate(studentLoginInfo) {
    const schema = {
        email: Joi.string().required().email(),
    }
    return Joi.validate(studentLoginInfo, schema);
};

const Student = mongoose.model('Student', studentSchema);
exports.Student = Student;
exports.validateStudent = validate;