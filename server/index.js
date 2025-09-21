// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import formidable from "formidable";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();

/**
 * CORS configuration:
 * - If ALLOWED_ORIGINS is set (comma separated), we allow only those origins and enable credentials.
 * - Otherwise we allow all origins (*) but disable credentials (browsers won't allow credentials with *).
 *
 * To enable cookies/credentials, set ALLOWED_ORIGINS e.g.
 * ALLOWED_ORIGINS=https://your-frontend.example.com,http://localhost:3000
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : null;

if (allowedOrigins && allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like curl or server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error("CORS policy: Origin not allowed"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
} else {
  // wildcard, no credentials
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false,
    })
  );
}

// Basic logging middleware
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} Origin: ${
      req.headers.origin || "-"
    }`
  );
  next();
});

// MongoDB connect
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // optional: keep these for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// Ensure uploads dir exists (absolute)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically so they can be previewed if needed
app.use("/uploads", express.static(uploadsDir));

// Mongoose schema & model
const printSchema = new mongoose.Schema({
  // each document represents a single physical printed copy (so copies: 1)
  copies: { type: Number, default: 1 },
  copyIndex: { type: Number, default: 1 }, // which copy (1..N)
  filter: String,
  templateId: String,
  backgroundColor: String,
  sheetImagePath: String, // local file path on server
  originalFilename: String,
  mimetype: String,
  size: Number,
  createdAt: { type: Date, default: Date.now },
});
const Print = mongoose.model("Print", printSchema);

// Health endpoint
app.get("/", (req, res) => res.send("Hello, Express + MongoDB is working 🚀"));

// Optional: list recent prints (for debug)
app.get("/prints", async (req, res) => {
  try {
    const prints = await Print.find().sort({ createdAt: -1 }).limit(50).lean();
    // attach public URL for the uploaded file if present
    const hostBase = `${req.protocol}://${req.get("host")}`;
    const mapped = prints.map((p) => ({
      ...p,
      sheetImageUrl: p.sheetImagePath
        ? `${hostBase}/uploads/${path.basename(p.sheetImagePath)}`
        : null,
    }));
    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (err) {
    console.error("Error fetching prints:", err);
    res.status(500).json({ success: false, error: "Error fetching prints" });
  }
});

/**
 * POST /api/print
 * Expects multipart/form-data with fields:
 * - copies (number) : how many printed copies desired (N)
 * - filter, templateId, backgroundColor (strings)
 * - sheetImage  : can be appended multiple times (one image per copy ideally)
 *
 * Behavior:
 * - Accepts multiple uploaded files (formidable 'multiples: true').
 * - If uploaded files < copies, it repeats last uploaded file for remaining copies.
 * - Inserts N documents into MongoDB (one per copy) using insertMany.
 */
app.post("/api/print", (req, res) => {
  const form = formidable({
    uploadDir: uploadsDir,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB limit (adjust as needed)
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "Error processing request" });
    }

    // helper: if field arrived as array -> take first element
    const asScalar = (v) => (v == null ? v : Array.isArray(v) ? v[0] : v);

    const copiesRequested = Math.max(
      1,
      parseInt(asScalar(fields.copies) || "1", 10)
    );
    const MAX_COPIES = parseInt(process.env.MAX_COPIES || "200", 10); // safety cap
    const copies = Math.min(copiesRequested, MAX_COPIES);

    const filter = asScalar(fields.filter) || "";
    const templateId = asScalar(fields.templateId) || "";
    const backgroundColor = asScalar(fields.backgroundColor) || "";

    // Normalize files -> ensure array
    let sheetFiles = files?.sheetImage || [];
    if (!Array.isArray(sheetFiles)) sheetFiles = [sheetFiles];
    // Filter out any undefined/null produced by parse
    sheetFiles = sheetFiles.filter(Boolean);

    if (sheetFiles.length === 0) {
      // No files uploaded: return error (frontend should send the clicked photos)
      return res
        .status(400)
        .json({ error: "No sheet images uploaded. Please attach images." });
    }

    try {
      const docs = [];
      for (let i = 0; i < copies; i++) {
        // choose corresponding file if provided, otherwise reuse last file
        const fileObj = sheetFiles[i] || sheetFiles[sheetFiles.length - 1];
        const filepath = fileObj.filepath || fileObj.path || null;
        const originalFilename =
          fileObj.originalFilename ||
          fileObj.newFilename ||
          fileObj.name ||
          null;
        const mimetype = fileObj.mimetype || fileObj.type || null;
        const size = fileObj.size || null;

        docs.push({
          copies: 1,
          copyIndex: i + 1,
          filter,
          templateId,
          backgroundColor,
          sheetImagePath: filepath,
          originalFilename,
          mimetype,
          size,
          createdAt: new Date(),
        });
      }

      const inserted = await Print.insertMany(docs, { ordered: true });

      // Prepare friendly response including public URLs to uploaded images
      const hostBase = `${req.protocol}://${req.get("host")}`;
      const result = inserted.map((d) => ({
        _id: d._id,
        copyIndex: d.copyIndex,
        sheetImageUrl: d.sheetImagePath
          ? `${hostBase}/uploads/${path.basename(d.sheetImagePath)}`
          : null,
      }));

      return res.json({
        success: true,
        insertedCount: inserted.length,
        items: result,
      });
    } catch (saveErr) {
      console.error("Error inserting print documents:", saveErr);
      return res.status(500).json({ error: "Error saving print data" });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});
