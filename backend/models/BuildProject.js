
const mongoose = require("mongoose");

const buildTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    description: {
        type: String,
        default: "",
        maxlength: 2000
    },

    completed: {
        type: Boolean,
        default: false
    },

    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const buildProjectSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    idea: {
        type: String,
        required: true,
        maxlength: 1500
    },

    duration: {
        type: Number,
        enum: [7, 15, 30, 60],
        default: 30
    },

    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner"
    },

    technologies: [{
        type: String,
        trim: true,
        maxlength: 50
    }],

    plan: {
        type: String,
        default: "",
        maxlength: 15000
    },

    tasks: {
        type: [buildTaskSchema],
        default: []
    },

    generatedCode: {
        type: String,
        default: "",
        maxlength: 100000
    },

    codeRequest: {
        type: String,
        default: "",
        maxlength: 2000
    },

    status: {
        type: String,
        enum: ["active", "completed"],
        default: "active"
    }
}, {
    timestamps: true
});

buildProjectSchema.index({
    userId: 1,
    updatedAt: -1
});

module.exports = mongoose.model(
    "BuildProject",
    buildProjectSchema
);
