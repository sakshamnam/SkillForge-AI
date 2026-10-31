
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            enum: [
                "web",
                "ai",
                "cyber",
                "data",
                "cloud",
                "app",
                "software"
            ]
        },
        type: {
            type: String,
            default: "Internship"
        },
        description: {
            type: String,
            default: ""
        },
        link: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
