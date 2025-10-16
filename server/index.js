// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();
const app = express();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary configured:", process.env.CLOUDINARY_CLOUD_NAME);

// Middleware
app.use(
  cors({
    origin: "*", // Development ke liye, production mei specific domain daalna
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); // Base64 images ke liye important
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

// Health endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Photo Booth API is working 🚀",
    cloudinary: cloudinary.config().cloud_name ? "Connected" : "Not Connected",
  });
});

// 1. Single Image Upload (Base64)
app.post("/api/upload-image", async (req, res) => {
  try {
    const { image, folder = "photo-booth", filename } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "No image data provided",
      });
    }

    console.log("📤 Uploading single image to Cloudinary...");

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: "auto",
      public_id: filename || undefined,
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    });

    console.log("✅ Image uploaded:", result.public_id);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    res.status(500).json({
      success: false,
      error: "Upload failed",
      message: error.message,
    });
  }
});

// 2. Multiple Images Upload (Batch)
app.post("/api/upload-multiple", async (req, res) => {
  try {
    const { images, folder = "photo-booth", sessionId } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No images array provided or array is empty",
      });
    }

    console.log(`📤 Uploading ${images.length} images to Cloudinary...`);

    // Upload all images in parallel
    const uploadPromises = images.map((image, index) =>
      cloudinary.uploader
        .upload(image, {
          folder: sessionId ? `${folder}/${sessionId}` : folder,
          resource_type: "auto",
          public_id: `photo_${Date.now()}_${index}`,
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
        })
        .catch((err) => {
          console.error(`❌ Failed to upload image ${index}:`, err.message);
          return { error: true, message: err.message, index };
        })
    );

    const results = await Promise.all(uploadPromises);

    // Filter successful uploads
    const successfulUploads = results.filter((r) => !r.error);
    const failedUploads = results.filter((r) => r.error);

    console.log(
      `✅ Successfully uploaded ${successfulUploads.length}/${images.length} images`
    );

    const urls = successfulUploads.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    }));

    res.json({
      success: true,
      message: `Uploaded ${successfulUploads.length} images successfully`,
      count: urls.length,
      images: urls,
      failed: failedUploads.length,
    });
  } catch (error) {
    console.error("❌ Batch upload error:", error.message);
    res.status(500).json({
      success: false,
      error: "Batch upload failed",
      message: error.message,
    });
  }
});

// 3. Upload with Custom Transformations
app.post("/api/upload-with-transform", async (req, res) => {
  try {
    const {
      image,
      folder = "photo-booth",
      filter,
      bgColor,
      width,
      height,
    } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "No image data provided",
      });
    }

    console.log("📤 Uploading image with transformations...");

    // Build transformations array
    const transformations = [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ];

    if (width || height) {
      transformations.push({
        width: width || undefined,
        height: height || undefined,
        crop: "limit",
      });
    }

    if (filter === "bw" || filter === "grayscale") {
      transformations.push({ effect: "grayscale" });
    } else if (filter === "sepia") {
      transformations.push({ effect: "sepia" });
    }

    if (bgColor) {
      transformations.push({ background: bgColor });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: "auto",
      transformation: transformations,
    });

    console.log("✅ Image uploaded with transformations:", result.public_id);

    res.json({
      success: true,
      message: "Image uploaded with transformations",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    console.error("❌ Transform upload error:", error.message);
    res.status(500).json({
      success: false,
      error: "Transform upload failed",
      message: error.message,
    });
  }
});

// 4. Delete Single Image
app.delete("/api/delete-image/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/--/g, "/");

    console.log("🗑️ Deleting image:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      console.log("✅ Image deleted successfully");
      res.json({
        success: true,
        message: "Image deleted successfully",
        result: result,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Image not found",
        result: result,
      });
    }
  } catch (error) {
    console.error("❌ Delete error:", error.message);
    res.status(500).json({
      success: false,
      error: "Delete failed",
      message: error.message,
    });
  }
});

// 5. Delete Multiple Images
app.post("/api/delete-multiple", async (req, res) => {
  try {
    const { publicIds } = req.body;

    if (!publicIds || !Array.isArray(publicIds)) {
      return res.status(400).json({
        success: false,
        error: "No publicIds array provided",
      });
    }

    console.log(`🗑️ Deleting ${publicIds.length} images...`);

    const deletePromises = publicIds.map((id) =>
      cloudinary.uploader.destroy(id).catch((err) => ({
        error: true,
        id,
        message: err.message,
      }))
    );

    const results = await Promise.all(deletePromises);
    const successful = results.filter((r) => r.result === "ok").length;

    console.log(`✅ Deleted ${successful}/${publicIds.length} images`);

    res.json({
      success: true,
      message: `Deleted ${successful} images`,
      deleted: successful,
      total: publicIds.length,
      results: results,
    });
  } catch (error) {
    console.error("❌ Batch delete error:", error.message);
    res.status(500).json({
      success: false,
      error: "Batch delete failed",
      message: error.message,
    });
  }
});

// 6. Get Image Info
app.get("/api/image-info/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId.replace(/--/g, "/");

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Get info error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get image info",
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`⚡ Server running on http://localhost:${PORT}`);
});
