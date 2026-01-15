import express from "express";
import router from "./routes/router.js";
import mongoose from "mongoose";

const app = express();

try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    // Middleware for JSON and URL-encoded form data
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/notes", router);

    app.listen(process.env.EXPRESS_PORT, () => {
        console.log(`Server is listening on port ${process.env.EXPRESS_PORT}`);
    });
} catch (e) {
    console.log(`Database connection failed: ${e.message}`);
}