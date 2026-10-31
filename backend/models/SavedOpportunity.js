
const mongoose = require("mongoose");

const savedOpportunitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        opportunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Opportunity",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent the same user from saving an opportunity multiple times.
savedOpportunitySchema.index(
    { user: 1, opportunity: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "SavedOpportunity",
    savedOpportunitySchema
);
