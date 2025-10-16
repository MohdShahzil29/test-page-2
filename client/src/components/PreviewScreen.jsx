// export default function PreviewScreen({
//   layouts,
//   totalFrames,
//   getPhotosForFrames,
//   bgColor,
//   selectedRowIndex,
//   setSelectedRowIndex,
//   PRESET_BG_COLORS,
//   setBgColor,
//   filter,
//   setFilter,
//   applyFilterToAll,
//   handleProceedToPrintWholeSheet,
//   setPhotosTaken,
//   setFilter: resetFilter,
//   lastAppliedFilterRef,
//   setStep,
//   btnPrimary,
//   btnSecondary,
//   btnFilter,
//   btnFilterSelected,
//   COLORS,
// }) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         maxWidth: "1200px",
//         padding: "20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
//         Preview
//       </h2>

//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           gap: "40px",
//           width: "100%",
//         }}
//       >
//         <div
//           style={{
//             flex: "1",
//             minWidth: "300px",
//             maxWidth: "500px",
//             display: "flex",
//             justifyContent: "center",
//           }}
//         >
//           {(() => {
//             const usingLayout = layouts.vertical[totalFrames];
//             if (!usingLayout) return <div>Invalid layout</div>;
//             const expanded = getPhotosForFrames();
//             const numCols = usingLayout.numCols;
//             const numRows = usingLayout.numRows;
//             return (
//               <div
//                 style={{
//                   width: "100%",
//                   maxWidth: 500,
//                   aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
//                   backgroundColor: bgColor,
//                   padding: 20,
//                   boxSizing: "border-box",
//                   borderRadius: 10,
//                   boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: `repeat(${numCols}, 1fr)`,
//                     gridTemplateRows: `repeat(${numRows}, 1fr)`,
//                     gap: 20,
//                     width: "100%",
//                     height: "100%",
//                   }}
//                 >
//                   {Array.from({ length: totalFrames }).map((_, i) => {
//                     const src = expanded[i];
//                     const row = Math.floor(i / numCols);
//                     const isSelected = selectedRowIndex === row;
//                     return (
//                       <div
//                         key={i}
//                         onClick={() => setSelectedRowIndex(row)}
//                         style={{
//                           width: "100%",
//                           height: "100%",
//                           backgroundColor: COLORS.LIGHT_GREY,
//                           borderRadius: 5,
//                           overflow: "hidden",
//                           boxSizing: "border-box",
//                           border: isSelected
//                             ? `4px solid ${COLORS.DEEP_BLUE}`
//                             : "4px solid transparent",
//                           transition: "border 140ms ease",
//                           cursor: "pointer",
//                         }}
//                       >
//                         {src ? (
//                           <img
//                             src={src}
//                             alt={`Photo ${i + 1}`}
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               objectFit: "cover",
//                               pointerEvents: "none",
//                             }}
//                           />
//                         ) : (
//                           <div
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               color: "#9aa0a6",
//                             }}
//                           >
//                             Empty
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })()}
//         </div>

//         <div
//           style={{
//             flex: "1",
//             minWidth: "250px",
//             maxWidth: "300px",
//             padding: "20px",
//             backgroundColor: COLORS.LIGHT_GREY,
//             borderRadius: "10px",
//             boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
//           }}
//         >
//           <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
//             Customize
//           </h3>

//           <div style={{ marginBottom: "20px" }}>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "8px",
//                 color: COLORS.TEXT_BLACK,
//               }}
//             >
//               Background Color
//             </label>
//             <div
//               style={{
//                 display: "flex",
//                 gap: "8px",
//                 flexWrap: "wrap",
//                 marginBottom: "10px",
//               }}
//             >
//               {PRESET_BG_COLORS.map((c) => (
//                 <button
//                   key={c.value}
//                   aria-label={`Set background ${c.name}`}
//                   title={c.name}
//                   onClick={() => setBgColor(c.value)}
//                   className={`bg-preset-btn ${
//                     bgColor.toLowerCase() === c.value.toLowerCase()
//                       ? "selected"
//                       : ""
//                   }`}
//                   style={{ background: c.value }}
//                 />
//               ))}
//             </div>
//             <input
//               type="color"
//               value={bgColor}
//               onChange={(e) => setBgColor(e.target.value)}
//               style={{
//                 width: "100%",
//                 height: "40px",
//                 borderRadius: "5px",
//                 border: "1px solid #ccc",
//               }}
//             />
//             <div style={{ marginTop: "8px", fontSize: "12px", color: "#555" }}>
//               Tip: tap a preset for quick look — use the color picker for
//               fine-tuning.
//             </div>
//           </div>

//           <div style={{ marginBottom: "20px", color: COLORS.TEXT_BLACK }}>
//             <label
//               style={{
//                 display: "block",
//                 marginBottom: "8px",
//                 color: COLORS.TEXT_BLACK,
//               }}
//             >
//               Filter
//             </label>
//             <div style={{ display: "flex", flexWrap: "wrap" }}>
//               <button
//                 onClick={() => setFilter("none")}
//                 style={filter === "none" ? btnFilterSelected : btnFilter}
//               >
//                 None
//               </button>
//               <button
//                 onClick={() => setFilter("burnt-coffee")}
//                 style={
//                   filter === "burnt-coffee" ? btnFilterSelected : btnFilter
//                 }
//               >
//                 Burnt Coffee
//               </button>
//               <button
//                 onClick={() => setFilter("ocean-wave")}
//                 style={filter === "ocean-wave" ? btnFilterSelected : btnFilter}
//               >
//                 Ocean Wave
//               </button>
//               <button
//                 onClick={() => setFilter("old-wood")}
//                 style={filter === "old-wood" ? btnFilterSelected : btnFilter}
//               >
//                 Old Wood
//               </button>
//               <button
//                 onClick={() => setFilter("vintage-may")}
//                 style={filter === "vintage-may" ? btnFilterSelected : btnFilter}
//               >
//                 Vintage May
//               </button>
//               <button
//                 onClick={() => setFilter("bw")}
//                 style={filter === "bw" ? btnFilterSelected : btnFilter}
//               >
//                 B & W
//               </button>
//             </div>
//           </div>

//           <button
//             onClick={applyFilterToAll}
//             style={{ ...btnSecondary, width: "100%", marginBottom: "15px" }}
//           >
//             Apply Filter
//           </button>

//           <button
//             onClick={handleProceedToPrintWholeSheet}
//             style={{ ...btnPrimary, width: "100%", marginBottom: "15px" }}
//           >
//             Proceed to Print (whole sheet)
//           </button>

//           <button
//             onClick={() => {
//               setPhotosTaken([]);
//               resetFilter("none");
//               lastAppliedFilterRef.current = {
//                 filter: null,
//                 photosCount: 0,
//               };
//               setStep("capture");
//               setSelectedRowIndex(null);
//             }}
//             style={{ ...btnSecondary, width: "100%" }}
//           >
//             Retake Photos
//           </button>

//           <button
//             onClick={handleProceedToPrintWholeSheet}
//             style={{ ...btnPrimary, width: "100%", marginTop: "12px" }}
//           >
//             Download
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { uploadWithTransform } from "../../utils/cloudinaryApi";

export default function PreviewScreen({
  layouts,
  totalFrames,
  getPhotosForFrames,
  bgColor,
  selectedRowIndex,
  setSelectedRowIndex,
  PRESET_BG_COLORS,
  setBgColor,
  filter,
  setFilter,
  applyFilterToAll,
  handleProceedToPrintWholeSheet,
  setPhotosTaken,
  photosTaken, // ✅ Add this prop
  setFilter: resetFilter,
  lastAppliedFilterRef,
  setStep,
  btnPrimary,
  btnSecondary,
  btnFilter,
  btnFilterSelected,
  COLORS,
}) {
  const [uploadStatus, setUploadStatus] = useState("");
  const [filterUploadQueue, setFilterUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Apply Filter + Upload Filtered Images
  const handleApplyFilterAndUpload = async () => {
    setIsUploading(true);
    setUploadStatus("Applying filter...");

    // Pehle filter apply karo locally
    await applyFilterToAll();

    // Ab filtered images ko Cloudinary pe upload karo
    try {
      setUploadStatus("☁️ Uploading filtered photos...");
      console.log(`📤 Uploading ${photosTaken.length} filtered images...`);

      const uploadPromises = photosTaken.map(async (photo, index) => {
        try {
          const base64Image = photo.filtered || photo.raw;

          const result = await uploadWithTransform(base64Image, {
            folder: "photo-booth/filtered",
            filter: filter === "none" ? undefined : filter,
            width: 1280,
            height: 720,
          });

          if (result.success) {
            console.log(
              `✅ Filtered photo ${index + 1} uploaded:`,
              result.data.url
            );
            setFilterUploadQueue((prev) => [...prev, index]);
            return result.data;
          }
        } catch (error) {
          console.error(
            `❌ Filtered upload failed for photo ${index + 1}:`,
            error
          );
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successCount = results.filter((r) => r !== null).length;

      setUploadStatus(
        `✓ ${successCount}/${photosTaken?.length} filtered photos uploaded`
      );
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("❌ Filtered upload error:", error);
      setUploadStatus("❌ Filtered upload failed");
      setTimeout(() => setUploadStatus(""), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Upload Status Toast */}
      {uploadStatus && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 24px",
            background: `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`,
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "700",
            color: COLORS.TEXT_BLACK,
            boxShadow: `0 8px 24px ${COLORS.ACCENT_YELLOW}40`,
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {uploadStatus}
        </div>
      )}

      <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
        Preview
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "40px",
          width: "100%",
        }}
      >
        {/* Preview Section */}
        <div
          style={{
            flex: "1",
            minWidth: "300px",
            maxWidth: "500px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {(() => {
            const usingLayout = layouts.vertical[totalFrames];
            if (!usingLayout) return <div>Invalid layout</div>;
            const expanded = getPhotosForFrames();
            const numCols = usingLayout.numCols;
            const numRows = usingLayout.numRows;
            return (
              <div
                style={{
                  width: "100%",
                  maxWidth: 500,
                  aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
                  backgroundColor: bgColor,
                  padding: 20,
                  boxSizing: "border-box",
                  borderRadius: 10,
                  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${numCols}, 1fr)`,
                    gridTemplateRows: `repeat(${numRows}, 1fr)`,
                    gap: 20,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {Array.from({ length: totalFrames }).map((_, i) => {
                    const src = expanded[i];
                    const row = Math.floor(i / numCols);
                    const isSelected = selectedRowIndex === row;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedRowIndex(row)}
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: COLORS.LIGHT_GREY,
                          borderRadius: 5,
                          overflow: "hidden",
                          boxSizing: "border-box",
                          border: isSelected
                            ? `4px solid ${COLORS.DEEP_BLUE}`
                            : "4px solid transparent",
                          transition: "border 140ms ease",
                          cursor: "pointer",
                        }}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={`Photo ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              pointerEvents: "none",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#9aa0a6",
                            }}
                          >
                            Empty
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Customize Section */}
        <div
          style={{
            flex: "1",
            minWidth: "250px",
            maxWidth: "300px",
            padding: "20px",
            backgroundColor: COLORS.LIGHT_GREY,
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
            Customize
          </h3>

          {/* Background Color Section */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: COLORS.TEXT_BLACK,
              }}
            >
              Background Color
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginBottom: "10px",
              }}
            >
              {PRESET_BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  aria-label={`Set background ${c.name}`}
                  title={c.name}
                  onClick={() => setBgColor(c.value)}
                  className={`bg-preset-btn ${
                    bgColor.toLowerCase() === c.value.toLowerCase()
                      ? "selected"
                      : ""
                  }`}
                  style={{ background: c.value }}
                />
              ))}
            </div>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#555" }}>
              Tip: tap a preset for quick look — use the color picker for
              fine-tuning.
            </div>
          </div>

          {/* Filter Section */}
          <div style={{ marginBottom: "20px", color: COLORS.TEXT_BLACK }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: COLORS.TEXT_BLACK,
              }}
            >
              Filter
            </label>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <button
                onClick={() => setFilter("none")}
                style={filter === "none" ? btnFilterSelected : btnFilter}
              >
                None
              </button>
              <button
                onClick={() => setFilter("burnt-coffee")}
                style={
                  filter === "burnt-coffee" ? btnFilterSelected : btnFilter
                }
              >
                Burnt Coffee
              </button>
              <button
                onClick={() => setFilter("ocean-wave")}
                style={filter === "ocean-wave" ? btnFilterSelected : btnFilter}
              >
                Ocean Wave
              </button>
              <button
                onClick={() => setFilter("old-wood")}
                style={filter === "old-wood" ? btnFilterSelected : btnFilter}
              >
                Old Wood
              </button>
              <button
                onClick={() => setFilter("vintage-may")}
                style={filter === "vintage-may" ? btnFilterSelected : btnFilter}
              >
                Vintage May
              </button>
              <button
                onClick={() => setFilter("bw")}
                style={filter === "bw" ? btnFilterSelected : btnFilter}
              >
                B & W
              </button>
            </div>
          </div>

          {/* ✅ UPDATED: Apply Filter + Upload Button */}
          <button
            onClick={handleApplyFilterAndUpload}
            disabled={isUploading}
            style={{
              ...btnSecondary,
              width: "100%",
              marginBottom: "15px",
              opacity: isUploading ? 0.6 : 1,
              cursor: isUploading ? "not-allowed" : "pointer",
            }}
          >
            {isUploading ? "Processing..." : "Apply Filter & Upload"}
          </button>

          {/* Upload Progress Indicator */}
          {filterUploadQueue?.length > 0 && (
            <div
              style={{
                padding: "8px 12px",
                background: `${COLORS.PRIMARY_BLUE}20`,
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                textAlign: "center",
                marginBottom: "15px",
                color: COLORS.DEEP_BLUE,
              }}
            >
              ☁️ {filterUploadQueue?.length}/{photosTaken?.length} filtered
              photos saved
            </div>
          )}

          {/* Other Buttons */}
          <button
            onClick={handleProceedToPrintWholeSheet}
            style={{ ...btnPrimary, width: "100%", marginBottom: "15px" }}
          >
            Proceed to Print (whole sheet)
          </button>

          <button
            onClick={() => {
              setPhotosTaken([]);
              resetFilter("none");
              lastAppliedFilterRef.current = {
                filter: null,
                photosCount: 0,
              };
              setStep("capture");
              setSelectedRowIndex(null);
              setFilterUploadQueue([]); // ✅ Reset filter upload queue
            }}
            style={{ ...btnSecondary, width: "100%" }}
          >
            Retake Photos
          </button>

          <button
            onClick={handleProceedToPrintWholeSheet}
            style={{ ...btnPrimary, width: "100%", marginTop: "12px" }}
          >
            Download
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}
