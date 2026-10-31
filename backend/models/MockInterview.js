
const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },
        answer: {
            type: String,
            default: ""
        },
        score: {
            type: Number,
            min: 0,
            max: 10,
            default: null
        },
        feedback: {
            type: String,
            default: ""
        },
        strengths: {
            type: [String],
            default: []
        },
        improvements: {
            type: [String],
            default: []
        }
    },
    { _id: true }
);

const mockInterviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        role: {
            type: String,
            required: true,
            trim: true
        },
        interviewType: {
            type: String,
            enum: ["Technical", "Behavioral", "Mixed"],
            default: "Mixed"
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        },
        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress"
        },
        questions: {
            type: [interviewQuestionSchema],
            default: []
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        summary: {
            type: String,
            default: ""
        },
        recommendations: {
            type: [String],
            default: []
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "MockInterview",
    mockInterviewSchema
);
