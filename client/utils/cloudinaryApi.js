// utils/cloudinaryApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 seconds for large uploads
});

// Single image upload
export const uploadImage = async (
  base64Image,
  folder = "photo-booth",
  filename = null
) => {
  try {
    const response = await api.post("/api/upload-image", {
      image: base64Image,
      folder,
      filename,
    });
    return response.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
};

// Multiple images upload
export const uploadMultipleImages = async (
  base64Images,
  folder = "photo-booth",
  sessionId = null
) => {
  try {
    const response = await api.post("/api/upload-multiple", {
      images: base64Images,
      folder,
      sessionId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Batch upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Upload with transformations
export const uploadWithTransform = async (base64Image, options = {}) => {
  try {
    const response = await api.post("/api/upload-with-transform", {
      image: base64Image,
      folder: options.folder || "photo-booth",
      filter: options.filter,
      bgColor: options.bgColor,
      width: options.width,
      height: options.height,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Transform upload failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete image
export const deleteImage = async (publicId) => {
  try {
    const encodedPublicId = publicId.replace(/\//g, "--");
    const response = await api.delete(`/api/delete-image/${encodedPublicId}`);
    return response.data;
  } catch (error) {
    console.error("Delete failed:", error.response?.data || error.message);
    throw error;
  }
};

// Delete multiple images
export const deleteMultipleImages = async (publicIds) => {
  try {
    const response = await api.post("/api/delete-multiple", {
      publicIds,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Batch delete failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default api;
