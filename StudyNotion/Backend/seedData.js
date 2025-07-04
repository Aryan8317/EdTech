const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Category = require("./models/Category");
const Course = require("./models/Course");
const User = require("./models/User");

// Connect to database
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("DB Connected Successfully"))
    .catch((error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    });

const seedData = async () => {
    try {
        // Clear existing data
        await Category.deleteMany({});
        await Course.deleteMany({});
        console.log("Cleared existing data");

        // Create sample categories
        const categories = [
            {
                name: "Web Development",
                description: "Learn modern web development technologies and frameworks"
            },
            {
                name: "Data Science",
                description: "Master data analysis, machine learning, and AI"
            },
            {
                name: "Mobile Development",
                description: "Build mobile apps for iOS and Android"
            },
            {
                name: "Programming Fundamentals",
                description: "Learn the basics of programming and computer science"
            }
        ];

        const createdCategories = await Category.insertMany(categories);
        console.log("Created categories:", createdCategories.map(cat => ({ name: cat.name, id: cat._id })));

        // Find or create a sample instructor user
        let instructor = await User.findOne({ accountType: "Instructor" });
        if (!instructor) {
            instructor = await User.create({
                firstName: "John",
                lastName: "Doe",
                email: "instructor@example.com",
                password: "Password123!",
                accountType: "Instructor",
                image: "https://via.placeholder.com/150",
                additionalDetails: {
                    dateOfBirth: "1990-01-01",
                    gender: "Male",
                    contactNumber: "1234567890",
                    about: "Experienced instructor with 5+ years of teaching experience"
                }
            });
            console.log("Created instructor user");
        }

        // Create sample courses
        const sampleCourses = [
            {
                courseName: "Complete Web Development Bootcamp",
                courseDescription: "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack web developer",
                instructor: instructor._id,
                whatYouWillLearn: "Build responsive websites, create dynamic web applications, understand modern web development practices",
                price: 99.99,
                tag: ["Web Development", "JavaScript", "React", "Node.js"],
                category: createdCategories[0]._id, // Web Development
                status: "Published",
                instructions: ["Basic computer knowledge", "No programming experience required", "Dedication to learn"]
            },
            {
                courseName: "Python for Data Science",
                courseDescription: "Master Python programming for data analysis, visualization, and machine learning",
                instructor: instructor._id,
                whatYouWillLearn: "Data manipulation with pandas, data visualization with matplotlib, machine learning basics",
                price: 79.99,
                tag: ["Python", "Data Science", "Machine Learning", "Pandas"],
                category: createdCategories[1]._id, // Data Science
                status: "Published",
                instructions: ["Basic math knowledge", "No programming experience required", "Curiosity about data"]
            },
            {
                courseName: "React Native Mobile App Development",
                courseDescription: "Build cross-platform mobile apps using React Native",
                instructor: instructor._id,
                whatYouWillLearn: "Create mobile apps for iOS and Android, understand React Native components, implement navigation",
                price: 89.99,
                tag: ["React Native", "Mobile Development", "JavaScript", "Cross-platform"],
                category: createdCategories[2]._id, // Mobile Development
                status: "Published",
                instructions: ["Basic JavaScript knowledge", "React fundamentals", "Mobile development interest"]
            },
            {
                courseName: "JavaScript Fundamentals",
                courseDescription: "Learn the fundamentals of JavaScript programming language",
                instructor: instructor._id,
                whatYouWillLearn: "Variables, functions, objects, arrays, DOM manipulation, asynchronous programming",
                price: 49.99,
                tag: ["JavaScript", "Programming", "Web Development", "Fundamentals"],
                category: createdCategories[3]._id, // Programming Fundamentals
                status: "Published",
                instructions: ["Basic computer knowledge", "No programming experience required", "Willingness to practice"]
            },
            {
                courseName: "Advanced React Development",
                courseDescription: "Master advanced React concepts and build complex applications",
                instructor: instructor._id,
                whatYouWillLearn: "Hooks, Context API, Redux, performance optimization, testing",
                price: 119.99,
                tag: ["React", "JavaScript", "Advanced", "Web Development"],
                category: createdCategories[0]._id, // Web Development
                status: "Published",
                instructions: ["Basic React knowledge", "JavaScript fundamentals", "Understanding of web development"]
            }
        ];

        const createdCourses = await Course.insertMany(sampleCourses);
        console.log("Created courses:", createdCourses.map(course => ({ name: course.courseName, id: course._id })));

        // Add courses to their respective categories
        for (const course of createdCourses) {
            const category = await Category.findById(course.category);
            if (category && !category.courses.includes(course._id)) {
                category.courses.push(course._id);
                await category.save();
            }
        }

        console.log("Successfully seeded database with sample data!");
        console.log("Categories created:", createdCategories.length);
        console.log("Courses created:", createdCourses.length);
        
        // Log the specific category ID that the frontend is looking for
        const webDevCategory = createdCategories.find(cat => cat.name === "Web Development");
        if (webDevCategory) {
            console.log("Web Development category ID:", webDevCategory._id);
            console.log("Update this ID in src/pages/Home.jsx line 22");
        }

    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedData(); 