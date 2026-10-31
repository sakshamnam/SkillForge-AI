
require("dotenv").config();

const mongoose = require("mongoose");
const Opportunity = require("./models/Opportunity");

const opportunities = [
    {
        title: "Frontend Web Developer Intern",
        company: "Internshala Opportunities",
        category: "web",
        type: "Internship",
        description: "Build responsive websites using HTML, CSS and JavaScript.",
        link: "https://internshala.com/internships/web-development-internship/",
        isActive: true
    },
    {
        title: "AI / Machine Learning Intern",
        company: "Internshala Opportunities",
        category: "ai",
        type: "Internship",
        description: "Explore machine learning, Python and AI projects.",
        link: "https://internshala.com/internships/machine-learning-internship/",
        isActive: true
    },
    {
        title: "Cybersecurity Intern",
        company: "Internshala Opportunities",
        category: "cyber",
        type: "Internship",
        description: "Explore security fundamentals and defensive cybersecurity.",
        link: "https://internshala.com/internships/cyber-security-internship/",
        isActive: true
    },
    {
        title: "Data Science Intern",
        company: "Internshala Opportunities",
        category: "data",
        type: "Internship",
        description: "Learn data analysis, Python and data visualization.",
        link: "https://internshala.com/internships/data-science-internship/",
        isActive: true
    },
    {
        title: "Cloud Computing Intern",
        company: "Internshala Opportunities",
        category: "cloud",
        type: "Internship",
        description: "Explore cloud infrastructure and deployment fundamentals.",
        link: "https://internshala.com/internships/cloud-computing-internship/",
        isActive: true
    },
    {
        title: "Android App Development Intern",
        company: "Internshala Opportunities",
        category: "app",
        type: "Internship",
        description: "Explore mobile application development opportunities.",
        link: "https://internshala.com/internships/android-app-development-internship/",
        isActive: true
    },
    {
        title: "Software Engineering Intern",
        company: "LinkedIn Jobs",
        category: "software",
        type: "Internship",
        description: "Find software engineering internship listings.",
        link: "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineering%20Intern",
        isActive: true
    }
];

async function seedOpportunities() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected.");

        // Avoid inserting the same seed records again on each run.
        for (const item of opportunities) {
            await Opportunity.updateOne(
                {
                    title: item.title,
                    company: item.company,
                    category: item.category
                },
                { $setOnInsert: item },
                { upsert: true, runValidators: true }
            );
        }

        console.log("Initial opportunities seeded successfully.");

        const count = await Opportunity.countDocuments({
            isActive: true
        });

        console.log("Total active opportunities in database:", count);
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedOpportunities();
