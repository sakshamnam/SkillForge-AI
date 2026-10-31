
const mongoose = require("mongoose");

// Learning progress schema
const learningProgressSchema = new mongoose.Schema(
    {
        skill: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["not-started", "in-progress", "completed"],
            default: "not-started"
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        startedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        }
    },
    { _id: true }
);

// Main user schema
const userSchema = new mongoose.Schema(
    {
        // User name
        name: {
            type: String,
            required: true,
            trim: true
        },

        // Email address
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Password is required for local accounts only
        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            }
        },

        // Authentication provider
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        // Verified Google account ID
       googleId: {
    type: String
},

        // Career information
        careerGoal: {
            type: String,
            required: true,
            trim: true,
            default: "Web Developer"
        },

        branch: {
            type: String,
            default: "CSE",
            trim: true
        },

        year: {
            type: String,
            default: "1st Year",
            trim: true
        },

        // User skills
        skills: {
            type: [String],
            default: []
        },

        // Learning progress
        learningProgress: {
            type: [learningProgressSchema],
            default: []
        },

        // Application Tracker data
        applications: {
            type: [
                {
                    company: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    role: {
                        type: String,
                        required: true,
                        trim: true
                    },
                    link: {
                        type: String,
                        default: ""
                    },
                    status: {
                        type: String,
                        enum: [
                            "Applied",
                            "Interview",
                            "Selected",
                            "Rejected"
                        ],
                        default: "Applied"
                    },
                    appliedAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        },
// Profile information
profile: {
    bio: {
        type: String,
        default: "",
        maxlength: 500
    },
    githubUrl: {
        type: String,
        default: ""
    },
    linkedinUrl: {
        type: String,
        default: ""
    },
    profilePhoto: {
        url: {
            type: String,
            default: ""
        },
        publicId: {
            type: String,
            default: ""
        }
    }
},
        // Resume Builder data
        resume: {
            fullName: {
                type: String,
                default: ""
            },
            email: {
                type: String,
                default: ""
            },
            phone: {
                type: String,
                default: ""
            },
            career: {
                type: String,
                default: ""
            },
            education: {
                type: String,
                default: ""
            },
            skills: {
                type: String,
                default: ""
            },
            projects: {
                type: String,
                default: ""
            },
            experience: {
                type: String,
                default: ""
            }
        }
    },
    {
        timestamps: true
    }
);

// Google ID should be unique when present
userSchema.index(
    { googleId: 1 },
    {
        unique: true,
        sparse: true
    }
);

module.exports = mongoose.model("User", userSchema);
