import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import formidable from "formidable";
import fs from "fs";

const app = express();

// env config
dotenv.config();

// middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// mongoDB connect
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// Define schema for print data
const printSchema = new mongoose.Schema({
  copies: Number,
  filter: String,
  templateId: String,
  backgroundColor: String,
  createdAt: { type: Date, default: Date.now },
  // We could also store the image data if needed
  sheetImagePath: String,
});

const Print = mongoose.model("Print", printSchema);

// test route
app.get("/", (req, res) => {
  res.send("Hello, Express + MongoDB is working 🚀");
});

// Route for handling print data with Formidable
app.post("/api/print", (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = "./uploads";
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error processing request" });
    }

    // Extract data from fields
    const { copies, filter, templateId, backgroundColor } = fields;

    // Create new print record
    const newPrint = new Print({
      copies: parseInt(copies),
      filter: filter,
      templateId: templateId,
      backgroundColor: backgroundColor,
      sheetImagePath: files.sheetImage ? files.sheetImage.path : null,
    });

    // Save to MongoDB
    newPrint
      .save()
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.error("Error saving print data:", err);
        res.status(500).json({ error: "Error saving print data" });
      });
  });
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});
