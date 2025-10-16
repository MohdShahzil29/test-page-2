// export default function CaptureScreen({
//   videoRef,
//   selectedAspectRatio,
//   computedVideoFilter,
//   previewOverlayStyleFor,
//   filter,
//   flash,
//   showCaptureNumber,
//   photosTaken,
//   photosToCapture,
//   capturePhoto,
//   webcamStarted,
//   autoCapturing,
//   startSequence,
//   stopSequence,
//   setStep,
//   btnPrimary,
//   btnSecondary,
//   COLORS,
// }) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         maxWidth: "1000px",
//         padding: "20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
//         Take Photos
//       </h2>

//       <div
//         style={{
//           padding: 14,
//           background: COLORS.BASE_WHITE,
//           borderRadius: 14,
//           boxShadow: "0 18px 50px rgba(5,10,30,0.12)",
//           border: `6px solid rgba(0,0,0,0.06)`,
//           width: "400px",
//           boxSizing: "border-box",
//           marginBottom: 20,
//         }}
//       >
//         <div
//           style={{
//             width: "100%",
//             aspectRatio: selectedAspectRatio,
//             overflow: "hidden",
//             borderRadius: 8,
//             position: "relative",
//             background: "#000",
//           }}
//         >
//           <video
//             ref={videoRef}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//               transform: "scaleX(-1)",
//               filter: computedVideoFilter(),
//             }}
//             playsInline
//             autoPlay
//             muted
//           />
//           <div style={previewOverlayStyleFor(filter)} />

//           <div className={`camera-flash ${flash ? "show" : ""}`} />
//           {showCaptureNumber && (
//             <div className="capture-number">{showCaptureNumber}</div>
//           )}
//           <div
//             style={{
//               position: "absolute",
//               bottom: 12,
//               left: "50%",
//               transform: "translateX(-50%)",
//               color: COLORS.BASE_WHITE,
//               backgroundColor: "rgba(0,0,0,0.45)",
//               padding: "6px 12px",
//               borderRadius: 6,
//             }}
//           >
//             {photosTaken.length} / {photosToCapture}
//           </div>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
//         <button
//           onClick={capturePhoto}
//           disabled={!webcamStarted || photosTaken.length >= photosToCapture}
//           style={{
//             ...btnPrimary,
//             opacity:
//               !webcamStarted || photosTaken.length >= photosToCapture ? 0.5 : 1,
//           }}
//         >
//           {photosTaken.length >= photosToCapture ? "Done" : "Take Photo"}
//         </button>

//         {!autoCapturing ? (
//           <button
//             onClick={startSequence}
//             disabled={!webcamStarted || photosTaken.length >= photosToCapture}
//             style={btnSecondary}
//           >
//             Start Sequence
//           </button>
//         ) : (
//           <button onClick={stopSequence} style={btnSecondary}>
//             Stop Sequence
//           </button>
//         )}

//         <button onClick={() => setStep("select")} style={btnSecondary}>
//           Back
//         </button>
//       </div>

//       <p style={{ color: "#666", textAlign: "center" }}>
//         Press Space to capture • {photosTaken.length} of {photosToCapture}{" "}
//         photos taken
//         <br />
//         {autoCapturing ? "Auto sequence running..." : ""}
//       </p>
//     </div>
//   );
// }

// // CaptureScreen.jsx - Minimal changes
// import { useState, useEffect } from "react";
// import { uploadImage } from "../../utils/cloudinaryApi";

// export default function CaptureScreen({
//   videoRef,
//   selectedAspectRatio,
//   computedVideoFilter,
//   previewOverlayStyleFor,
//   filter,
//   flash,
//   setFlash,
//   showCaptureNumber,
//   photosTaken,
//   photosToCapture,
//   setPhotosTaken,
//   capturePhoto,
//   webcamStarted,
//   autoCapturing,
//   startSequence,
//   stopSequence,
//   setStep,
//   btnPrimary,
//   btnSecondary,
//   COLORS,
// }) {
//   const [uploadQueue, setUploadQueue] = useState([]);
//   const [uploadStatus, setUploadStatus] = useState("");

//   // ✅ Auto-upload when new photo is taken
//   useEffect(() => {
//     if (photosTaken.length === 0) return;

//     const lastPhoto = photosTaken[photosTaken.length - 1];
//     const photoIndex = photosTaken.length - 1;

//     // Check if already uploaded
//     if (uploadQueue.includes(photoIndex)) return;

//     const uploadPhoto = async () => {
//       try {
//         setUploadStatus(`Uploading photo ${photoIndex + 1}...`);
//         console.log(`📤 Uploading photo ${photoIndex + 1} to Cloudinary...`);

//         const base64Image = lastPhoto.filtered || lastPhoto.raw;

//         const result = await uploadImage(
//           base64Image,
//           "photo-booth",
//           `photo_${Date.now()}_${photoIndex}`
//         );

//         if (result.success) {
//           console.log(`✅ Photo ${photoIndex + 1} uploaded:`, result.data.url);
//           setUploadQueue((prev) => [...prev, photoIndex]);
//           setUploadStatus(`Photo ${photoIndex + 1} uploaded ✓`);
//         }
//       } catch (error) {
//         console.error(`❌ Upload failed for photo ${photoIndex + 1}:`, error);
//         setUploadStatus(`Upload failed for photo ${photoIndex + 1}`);
//       } finally {
//         setTimeout(() => setUploadStatus(""), 2000);
//       }
//     };

//     uploadPhoto();
//   }, [photosTaken.length]);

//   return (
//     <div
//       style={{
//         width: "100%",
//         maxWidth: "1000px",
//         padding: "20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
//         Take Photos
//       </h2>

//       {/* Upload Status */}
//       {uploadStatus && (
//         <div
//           style={{
//             padding: "10px 20px",
//             background: COLORS.ACCENT_YELLOW,
//             borderRadius: "8px",
//             marginBottom: "12px",
//             fontSize: "14px",
//             fontWeight: "600",
//           }}
//         >
//           {uploadStatus}
//         </div>
//       )}

//       {/* Rest of the component remains same */}
//       <div
//         style={{
//           padding: 14,
//           background: COLORS.BASE_WHITE,
//           borderRadius: 14,
//           boxShadow: "0 18px 50px rgba(5,10,30,0.12)",
//           border: `6px solid rgba(0,0,0,0.06)`,
//           width: "400px",
//           boxSizing: "border-box",
//           marginBottom: 20,
//         }}
//       >
//         <div
//           style={{
//             width: "100%",
//             aspectRatio: selectedAspectRatio,
//             overflow: "hidden",
//             borderRadius: 8,
//             position: "relative",
//             background: "#000",
//           }}
//         >
//           <video
//             ref={videoRef}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//               transform: "scaleX(-1)",
//               filter: computedVideoFilter(),
//             }}
//             playsInline
//             autoPlay
//             muted
//           />
//           <div style={previewOverlayStyleFor(filter)} />

//           <div className={`camera-flash ${flash ? "show" : ""}`} />
//           {showCaptureNumber && (
//             <div className="capture-number">{showCaptureNumber}</div>
//           )}
//           <div
//             style={{
//               position: "absolute",
//               bottom: 12,
//               left: "50%",
//               transform: "translateX(-50%)",
//               color: COLORS.BASE_WHITE,
//               backgroundColor: "rgba(0,0,0,0.45)",
//               padding: "6px 12px",
//               borderRadius: 6,
//             }}
//           >
//             {photosTaken.length} / {photosToCapture}
//             {uploadQueue.length > 0 && ` (${uploadQueue.length} uploaded)`}
//           </div>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
//         <button
//           onClick={capturePhoto}
//           disabled={!webcamStarted || photosTaken.length >= photosToCapture}
//           style={{
//             ...btnPrimary,
//             opacity:
//               !webcamStarted || photosTaken.length >= photosToCapture ? 0.5 : 1,
//           }}
//         >
//           {photosTaken.length >= photosToCapture ? "Done" : "Take Photo"}
//         </button>

//         {!autoCapturing ? (
//           <button
//             onClick={startSequence}
//             disabled={!webcamStarted || photosTaken.length >= photosToCapture}
//             style={btnSecondary}
//           >
//             Start Sequence
//           </button>
//         ) : (
//           <button onClick={stopSequence} style={btnSecondary}>
//             Stop Sequence
//           </button>
//         )}

//         <button onClick={() => setStep("select")} style={btnSecondary}>
//           Back
//         </button>
//       </div>

//       <p style={{ color: "#666", textAlign: "center" }}>
//         Press Space to capture • {photosTaken.length} of {photosToCapture}{" "}
//         photos taken
//         <br />
//         {autoCapturing ? "Auto sequence running..." : ""}
//         {uploadQueue.length > 0 &&
//           ` • ${uploadQueue.length} photos uploaded to cloud`}
//       </p>
//     </div>
//   );
// }

// CaptureScreen.jsx - Enhanced UI
import { useState, useEffect } from "react";
import { uploadImage } from "../../utils/cloudinaryApi";

export default function CaptureScreen({
  videoRef,
  selectedAspectRatio,
  computedVideoFilter,
  previewOverlayStyleFor,
  filter,
  flash,
  setFlash,
  showCaptureNumber,
  photosTaken,
  photosToCapture,
  setPhotosTaken,
  capturePhoto,
  webcamStarted,
  autoCapturing,
  startSequence,
  stopSequence,
  setStep,
  btnPrimary,
  btnSecondary,
  COLORS,
}) {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [capturing, setCapturing] = useState(false);

  // Auto-upload when new photo is taken
  useEffect(() => {
    if (photosTaken.length === 0) return;

    const lastPhoto = photosTaken[photosTaken.length - 1];
    const photoIndex = photosTaken.length - 1;

    if (uploadQueue.includes(photoIndex)) return;

    const uploadPhoto = async () => {
      try {
        setUploadStatus(`Uploading photo ${photoIndex + 1}...`);
        console.log(`📤 Uploading photo ${photoIndex + 1} to Cloudinary...`);

        const base64Image = lastPhoto.filtered || lastPhoto.raw;

        const result = await uploadImage(
          base64Image,
          "photo-booth",
          `photo_${Date.now()}_${photoIndex}`
        );

        if (result.success) {
          console.log(`✅ Photo ${photoIndex + 1} uploaded:`, result.data.url);
          setUploadQueue((prev) => [...prev, photoIndex]);
          setUploadStatus(`Photo ${photoIndex + 1} uploaded ✓`);
        }
      } catch (error) {
        console.error(`❌ Upload failed for photo ${photoIndex + 1}:`, error);
        setUploadStatus(`Upload failed for photo ${photoIndex + 1}`);
      } finally {
        setTimeout(() => setUploadStatus(""), 2000);
      }
    };

    uploadPhoto();
  }, [photosTaken.length]);

  const handleCapture = () => {
    setCapturing(true);
    capturePhoto();
    setTimeout(() => setCapturing(false), 300);
  };

  const progress = (photosTaken.length / photosToCapture) * 100;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Background gradient accent */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "300px",
          background: `radial-gradient(circle, ${COLORS.PRIMARY_BLUE}15 0%, transparent 70%)`,
          filter: "blur(60px)",
          zIndex: -1,
          animation: "breathe 4s ease-in-out infinite",
        }}
      />

      {/* Header with gradient */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2
          style={{
            background: `linear-gradient(135deg, ${COLORS.DEEP_BLUE} 0%, ${COLORS.PRIMARY_BLUE} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
          }}
        >
          Capture Your Moments
        </h2>
        <p
          style={{
            color: "#5a6c7d",
            fontSize: "15px",
            fontWeight: "500",
            margin: 0,
          }}
        >
          {autoCapturing
            ? "🔴 Auto sequence running..."
            : "Position yourself and smile!"}
        </p>
      </div>

      {/* Upload Status Toast */}
      {uploadStatus && (
        <div
          style={{
            padding: "12px 24px",
            background: `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`,
            borderRadius: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "700",
            color: COLORS.TEXT_BLACK,
            boxShadow: `0 8px 24px ${COLORS.ACCENT_YELLOW}40,
                        inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
            animation: "slideDown 0.3s ease-out",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: COLORS.DEEP_BLUE,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          {uploadStatus}
        </div>
      )}

      {/* Camera Preview Container */}
      <div
        style={{
          position: "relative",
          padding: "20px",
          background: `linear-gradient(145deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_BACKGROUND}40 100%)`,
          borderRadius: "24px",
          boxShadow: `0 24px 60px rgba(5, 10, 30, 0.15),
                      0 0 0 1px ${COLORS.PRIMARY_BLUE}10,
                      inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
          marginBottom: "24px",
          width: "420px",
          boxSizing: "border-box",
          border: `2px solid ${COLORS.PRIMARY_BLUE}15`,
        }}
      >
        {/* Recording indicator */}
        {webcamStarted && (
          <div
            style={{
              position: "absolute",
              top: "32px",
              left: "32px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              background: "rgba(0, 0, 0, 0.7)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 12px #22c55e80",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                color: COLORS.BASE_WHITE,
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              LIVE
            </span>
          </div>
        )}

        {/* Video Preview */}
        <div
          style={{
            width: "100%",
            aspectRatio: selectedAspectRatio,
            overflow: "hidden",
            borderRadius: "16px",
            position: "relative",
            background: "#000",
            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              filter: computedVideoFilter(),
            }}
            playsInline
            autoPlay
            muted
          />
          <div style={previewOverlayStyleFor(filter)} />

          {/* Flash Effect */}
          <div
            className={`camera-flash ${flash ? "show" : ""}`}
            style={{
              position: "absolute",
              inset: 0,
              background: COLORS.BASE_WHITE,
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.15s ease-out",
            }}
          />

          {/* Countdown Number */}
          {showCaptureNumber && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "120px",
                fontWeight: "900",
                color: COLORS.BASE_WHITE,
                textShadow: `0 4px 20px rgba(0, 0, 0, 0.8),
                            0 0 40px ${COLORS.ACCENT_YELLOW}`,
                animation: "scaleIn 0.5s ease-out",
                zIndex: 20,
              }}
            >
              {showCaptureNumber}
            </div>
          )}

          {/* Progress Bar & Counter */}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
              padding: "16px",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Progress Bar */}
            <div
              style={{
                width: "100%",
                height: "6px",
                background: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`,
                  borderRadius: "10px",
                  transition: "width 0.3s ease-out",
                  boxShadow: `0 0 12px ${COLORS.ACCENT_YELLOW}80`,
                }}
              />
            </div>

            {/* Counter */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: COLORS.BASE_WHITE,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "15px",
                  fontWeight: "700",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>
                  {photosTaken.length} / {photosToCapture}
                </span>
              </div>

              {uploadQueue.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "4px 10px",
                    background: `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW}40 0%, ${COLORS.ACCENT_YELLOW}20 100%)`,
                    borderRadius: "12px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>{uploadQueue.length} uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Capture Ring Animation */}
        {capturing && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "200px",
              height: "200px",
              border: `4px solid ${COLORS.ACCENT_YELLOW}`,
              borderRadius: "50%",
              animation: "ripple 0.6s ease-out",
              pointerEvents: "none",
              zIndex: 30,
            }}
          />
        )}
      </div>

      {/* Control Buttons */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Main Capture Button */}
        <button
          onClick={handleCapture}
          disabled={!webcamStarted || photosTaken.length >= photosToCapture}
          style={{
            position: "relative",
            padding: "16px 40px",
            fontSize: "16px",
            fontWeight: "700",
            borderRadius: "14px",
            border: "none",
            background:
              !webcamStarted || photosTaken.length >= photosToCapture
                ? "#d5d5d5"
                : `linear-gradient(135deg, ${COLORS.DEEP_BLUE} 0%, ${COLORS.PRIMARY_BLUE} 100%)`,
            color: COLORS.BASE_WHITE,
            cursor:
              !webcamStarted || photosTaken.length >= photosToCapture
                ? "not-allowed"
                : "pointer",
            opacity:
              !webcamStarted || photosTaken.length >= photosToCapture ? 0.5 : 1,
            boxShadow:
              !webcamStarted || photosTaken.length >= photosToCapture
                ? "none"
                : `0 12px 28px ${COLORS.DEEP_BLUE}35,
                   0 0 0 1px ${COLORS.DEEP_BLUE}20,
                   inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: capturing ? "scale(0.95)" : "scale(1)",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            if (webcamStarted && photosTaken.length < photosToCapture) {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = `0 16px 36px ${COLORS.DEEP_BLUE}40,
                                                  0 0 0 1px ${COLORS.DEEP_BLUE}30,
                                                  inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
            }
          }}
          onMouseLeave={(e) => {
            if (webcamStarted && photosTaken.length < photosToCapture) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = `0 12px 28px ${COLORS.DEEP_BLUE}35,
                                                  0 0 0 1px ${COLORS.DEEP_BLUE}20,
                                                  inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
            }
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>
            {photosTaken.length >= photosToCapture
              ? "✓ Complete"
              : "📸 Capture"}
          </span>
        </button>

        {/* Sequence Button */}
        {!autoCapturing ? (
          <button
            onClick={startSequence}
            disabled={!webcamStarted || photosTaken.length >= photosToCapture}
            style={{
              ...btnSecondary,
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_GREY} 100%)`,
              border: `2px solid ${COLORS.PRIMARY_BLUE}30`,
              boxShadow: `0 6px 16px rgba(0, 0, 0, 0.08),
                          inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (webcamStarted && photosTaken.length < photosToCapture) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 10px 24px rgba(0, 0, 0, 0.12),
                                                    inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 6px 16px rgba(0, 0, 0, 0.08),
                                                  inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
            }}
          >
            ▶ Start Auto
          </button>
        ) : (
          <button
            onClick={stopSequence}
            style={{
              ...btnSecondary,
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              borderRadius: "14px",
              background: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`,
              border: "2px solid #dc2626",
              color: COLORS.BASE_WHITE,
              boxShadow: `0 8px 20px rgba(239, 68, 68, 0.3),
                          inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 12px 28px rgba(239, 68, 68, 0.4),
                                                  inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 8px 20px rgba(239, 68, 68, 0.3),
                                                  inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
            }}
          >
            ■ Stop Auto
          </button>
        )}

        {/* Back Button */}
        <button
          onClick={() => setStep("select")}
          style={{
            ...btnSecondary,
            padding: "16px 32px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_GREY} 100%)`,
            border: `2px solid ${COLORS.PRIMARY_BLUE}20`,
            boxShadow: `0 6px 16px rgba(0, 0, 0, 0.08),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 10px 24px rgba(0, 0, 0, 0.12),
                                                inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = `0 6px 16px rgba(0, 0, 0, 0.08),
                                                inset 0 1px 0 rgba(255, 255, 255, 0.8)`;
          }}
        >
          ← Back
        </button>
      </div>

      {/* Info Text */}
      <div
        style={{
          padding: "16px 28px",
          background: `linear-gradient(135deg, ${COLORS.LIGHT_BACKGROUND}40 0%, ${COLORS.PRIMARY_BLUE}08 100%)`,
          borderRadius: "12px",
          border: `2px solid ${COLORS.PRIMARY_BLUE}15`,
          backdropFilter: "blur(10px)",
        }}
      >
        <p
          style={{
            color: "#5a6c7d",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "500",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          <strong style={{ color: COLORS.DEEP_BLUE }}>Tip:</strong> Press{" "}
          <kbd
            style={{
              padding: "2px 8px",
              background: COLORS.BASE_WHITE,
              border: `1px solid ${COLORS.PRIMARY_BLUE}30`,
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            Space
          </kbd>{" "}
          to capture photos quickly
        </p>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.15);
            }
          }
          
          @keyframes breathe {
            0%, 100% {
              opacity: 0.3;
              transform: translateX(-50%) scale(1);
            }
            50% {
              opacity: 0.5;
              transform: translateX(-50%) scale(1.1);
            }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
          
          @keyframes ripple {
            from {
              opacity: 1;
              transform: translate(-50%, -50%) scale(0.5);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -50%) scale(2);
            }
          }
          
          .camera-flash.show {
            opacity: 1 !important;
          }
        `}
      </style>
    </div>
  );
}
