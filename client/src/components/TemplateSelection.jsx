// export default function TemplateSelection({
//   templates,
//   selectedTemplate,
//   setSelectedTemplate,
//   setTotalFrames,
//   setPhotosToCapture,
//   setPrintCopies,
//   setSelectedAspectRatio,
//   photosToCapture,
//   printCopies,
//   layouts,
//   setStep,
//   btnPrimary,
//   btnTemplate,
//   COLORS,
//   manualCopies,
//   setManualCopies,
// }) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         maxWidth: "900px",
//         padding: "30px 20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//       }}
//     >
//       {/* Header */}
//       <h2
//         style={{
//           color: COLORS.TEXT_BLACK,
//           marginBottom: "12px",
//           fontSize: "28px",
//           fontWeight: "700",
//           letterSpacing: "-0.5px",
//         }}
//       >
//         Select Template
//       </h2>
//       <p
//         style={{
//           color: "#666",
//           marginBottom: "30px",
//           fontSize: "15px",
//         }}
//       >
//         Choose your photo booth layout style
//       </p>

//       {/* Templates Grid */}
//       <div
//         style={{
//           display: "flex",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           gap: "24px",
//           marginBottom: "32px",
//           width: "100%",
//         }}
//       >
//         {templates.map((template) => {
//           const isSelected = selectedTemplate?.id === template.id;

//           return (
//             <div
//               key={template.id}
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 width: "220px",
//                 cursor: "pointer",
//                 transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
//               }}
//               onClick={() => {
//                 setSelectedTemplate(template);
//                 setTotalFrames(template.frames);

//                 const usingLayout = layouts.vertical[template.frames];
//                 if (usingLayout) {
//                   setPhotosToCapture(usingLayout.numRows);

//                   if (!manualCopies) {
//                     setPrintCopies(usingLayout.numRows);
//                   }

//                   setSelectedAspectRatio(
//                     usingLayout.photoWidth / usingLayout.photoHeight
//                   );
//                 } else {
//                   setPhotosToCapture(template.frames);
//                   if (!manualCopies) {
//                     setPrintCopies(2);
//                   }
//                 }
//               }}
//               onMouseEnter={(e) => {
//                 if (!isSelected) {
//                   e.currentTarget.style.transform = "translateY(-6px)";
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 if (!isSelected) {
//                   e.currentTarget.style.transform = "translateY(0)";
//                 }
//               }}
//             >
//               {/* Template Preview Box */}
//               <div
//                 style={{
//                   position: "relative",
//                   width: "180px",
//                   height: "240px",
//                   marginBottom: "14px",
//                   background: isSelected
//                     ? "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)"
//                     : "#ffffff",
//                   borderRadius: "12px",
//                   padding: "16px",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   boxSizing: "border-box",
//                   border: isSelected
//                     ? `3px solid ${COLORS.ACCENT_YELLOW}`
//                     : "3px solid transparent",
//                   boxShadow: isSelected
//                     ? `0 12px 28px rgba(0, 0, 0, 0.15), 0 0 0 1px ${COLORS.ACCENT_YELLOW}`
//                     : "0 4px 12px rgba(0, 0, 0, 0.1)",
//                   transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
//                   transform: isSelected ? "translateY(-4px)" : "translateY(0)",
//                 }}
//               >
//                 {/* Selected Badge */}
//                 {isSelected && (
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "8px",
//                       right: "8px",
//                       background: COLORS.ACCENT_YELLOW,
//                       borderRadius: "50%",
//                       width: "28px",
//                       height: "28px",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: "0 4px 12px rgba(250, 204, 11, 0.4)",
//                       zIndex: 10,
//                     }}
//                   >
//                     <svg
//                       width="14"
//                       height="14"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke={COLORS.TEXT_BLACK}
//                       strokeWidth="3"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <polyline points="20 6 9 17 4 12" />
//                     </svg>
//                   </div>
//                 )}

//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(2, 1fr)",
//                     gridTemplateRows: `repeat(${Math.ceil(
//                       template.frames / 2
//                     )}, 1fr)`,
//                     gap: "8px",
//                     height: "100%",
//                     width: "100%",
//                   }}
//                 >
//                   {Array.from({ length: template.frames }).map((_, i) => (
//                     <div
//                       key={i}
//                       style={{
//                         background: isSelected
//                           ? "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)"
//                           : "#f8f8f8",
//                         borderRadius: "6px",
//                         border: `2px solid ${
//                           isSelected ? COLORS.PRIMARY_BLUE + "30" : "#e8e8e8"
//                         }`,
//                         padding: "8px 8px 12px 8px",
//                         display: "flex",
//                         flexDirection: "column",
//                         boxShadow: isSelected
//                           ? "0 3px 8px rgba(82, 139, 173, 0.15)"
//                           : "0 2px 4px rgba(0, 0, 0, 0.08)",
//                         position: "relative",
//                         overflow: "hidden",
//                         transition: "all 0.3s ease",
//                       }}
//                     >
//                       {/* Polaroid Image Area */}
//                       <div
//                         style={{
//                           flex: 1,
//                           background: isSelected
//                             ? `linear-gradient(135deg, ${COLORS.LIGHT_BACKGROUND} 0%, #f0f4f8 100%)`
//                             : "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
//                           borderRadius: "4px",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           position: "relative",
//                         }}
//                       >
//                         {/* Camera Icon */}
//                         <svg
//                           width="18"
//                           height="18"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke={isSelected ? COLORS.PRIMARY_BLUE : "#999"}
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           style={{ opacity: 0.4 }}
//                         >
//                           <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
//                           <circle cx="12" cy="13" r="4" />
//                         </svg>
//                       </div>
//                       {/* Polaroid White Space Bottom */}
//                       <div
//                         style={{
//                           height: "6px",
//                           background: "#fff",
//                           marginTop: "4px",
//                           borderRadius: "0 0 2px 2px",
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Template Label Button */}
//               <button
//                 style={{
//                   ...btnTemplate,
//                   backgroundColor: isSelected
//                     ? COLORS.ACCENT_YELLOW
//                     : COLORS.LIGHT_GREY,
//                   border: `2px solid ${
//                     isSelected ? COLORS.ACCENT_YELLOW : "transparent"
//                   }`,
//                   padding: "10px 20px",
//                   borderRadius: "8px",
//                   fontSize: "14px",
//                   fontWeight: isSelected ? "600" : "500",
//                   transition: "all 0.3s ease",
//                   boxShadow: isSelected
//                     ? "0 6px 16px rgba(250, 204, 11, 0.3)"
//                     : "0 2px 6px rgba(0, 0, 0, 0.08)",
//                   color: COLORS.TEXT_BLACK,
//                   width: "100%",
//                 }}
//               >
//                 {template.label}
//               </button>
//             </div>
//           );
//         })}
//       </div>

//       {/* Number of Copies Selection */}
//       {selectedTemplate && (
//         <div
//           style={{
//             marginTop: "10px",
//             marginBottom: "32px",
//             padding: "24px",
//             background: `linear-gradient(135deg, ${COLORS.LIGHT_GREY} 0%, #ffffff 100%)`,
//             borderRadius: "12px",
//             width: "100%",
//             maxWidth: "500px",
//             boxShadow:
//               "0 8px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
//             border: `2px solid ${COLORS.PRIMARY_BLUE}15`,
//           }}
//         >
//           <h3
//             style={{
//               color: COLORS.TEXT_BLACK,
//               marginBottom: "18px",
//               fontSize: "20px",
//               fontWeight: "600",
//               textAlign: "center",
//               letterSpacing: "-0.3px",
//             }}
//           >
//             How many copies do you want?
//           </h3>
//           <div
//             style={{
//               display: "flex",
//               gap: "12px",
//               justifyContent: "center",
//               flexWrap: "wrap",
//               marginBottom: "16px",
//             }}
//           >
//             {[2, 3, 4, 5, 6].map((num) => {
//               const isSelectedNum = printCopies === num;

//               return (
//                 <button
//                   key={num}
//                   onClick={() => {
//                     setPrintCopies(num);
//                     setManualCopies(true);
//                   }}
//                   onMouseEnter={(e) => {
//                     if (!isSelectedNum) {
//                       e.currentTarget.style.transform =
//                         "translateY(-3px) scale(1.05)";
//                       e.currentTarget.style.boxShadow =
//                         "0 8px 20px rgba(0, 0, 0, 0.12)";
//                     }
//                   }}
//                   onMouseLeave={(e) => {
//                     if (!isSelectedNum) {
//                       e.currentTarget.style.transform =
//                         "translateY(0) scale(1)";
//                       e.currentTarget.style.boxShadow = isSelectedNum
//                         ? "0 8px 20px rgba(3, 120, 181, 0.25)"
//                         : "0 3px 10px rgba(0, 0, 0, 0.08)";
//                     }
//                   }}
//                   style={{
//                     padding: "16px 28px",
//                     borderRadius: "10px",
//                     border: `3px solid ${
//                       isSelectedNum ? COLORS.DEEP_BLUE : "#d8dde6"
//                     }`,
//                     backgroundColor: isSelectedNum
//                       ? COLORS.ACCENT_YELLOW
//                       : COLORS.BASE_WHITE,
//                     color: COLORS.TEXT_BLACK,
//                     fontSize: "20px",
//                     fontWeight: isSelectedNum ? "700" : "600",
//                     cursor: "pointer",
//                     transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                     boxShadow: isSelectedNum
//                       ? "0 8px 20px rgba(250, 204, 11, 0.3)"
//                       : "0 3px 10px rgba(0, 0, 0, 0.08)",
//                     transform: isSelectedNum
//                       ? "translateY(-2px) scale(1.05)"
//                       : "translateY(0) scale(1)",
//                     minWidth: "65px",
//                   }}
//                 >
//                   {num}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Selection Indicator */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               padding: "12px 20px",
//               background: `linear-gradient(135deg, ${COLORS.LIGHT_BACKGROUND} 0%, #f0f4f8 100%)`,
//               borderRadius: "10px",
//               border: `2px solid ${COLORS.PRIMARY_BLUE}30`,
//             }}
//           >
//             <svg
//               width="18"
//               height="18"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke={COLORS.DEEP_BLUE}
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//               <polyline points="14 2 14 8 20 8" />
//               <line x1="16" y1="13" x2="8" y2="13" />
//               <line x1="16" y1="17" x2="8" y2="17" />
//               <polyline points="10 9 9 9 8 9" />
//             </svg>
//             <p
//               style={{
//                 margin: 0,
//                 fontSize: "15px",
//                 color: COLORS.TEXT_BLACK,
//                 fontWeight: "600",
//               }}
//             >
//               Selected: <strong>{printCopies}</strong>{" "}
//               {printCopies === 1 ? "copy" : "copies"}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Info Cards - existing code */}
//       <div
//         style={{
//           display: "flex",
//           gap: "20px",
//           marginBottom: "32px",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           width: "100%",
//           maxWidth: "600px",
//         }}
//       >
//         {/* Info cards remain same */}
//       </div>

//       {/* Next Button */}
//       <button
//         onClick={() => setStep("capture")}
//         disabled={!selectedTemplate}
//         onMouseEnter={(e) => {
//           if (selectedTemplate) {
//             e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
//             e.currentTarget.style.boxShadow =
//               "0 12px 28px rgba(3, 120, 181, 0.3)";
//           }
//         }}
//         onMouseLeave={(e) => {
//           if (selectedTemplate) {
//             e.currentTarget.style.transform = "scale(1.02)";
//             e.currentTarget.style.boxShadow =
//               "0 6px 18px rgba(3, 120, 181, 0.25)";
//           }
//         }}
//         style={{
//           ...btnPrimary,
//           opacity: !selectedTemplate ? 0.5 : 1,
//           cursor: !selectedTemplate ? "not-allowed" : "pointer",
//           padding: "14px 40px",
//           fontSize: "16px",
//           fontWeight: "600",
//           borderRadius: "10px",
//           border: "none",
//           boxShadow: !selectedTemplate
//             ? "none"
//             : "0 6px 18px rgba(3, 120, 181, 0.25)",
//           transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//           transform: !selectedTemplate ? "scale(1)" : "scale(1.02)",
//           letterSpacing: "0.3px",
//         }}
//       >
//         Next →
//       </button>
//     </div>
//   );
// }

export default function TemplateSelection({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  setTotalFrames,
  setPhotosToCapture,
  setPrintCopies,
  setSelectedAspectRatio,
  photosToCapture,
  printCopies,
  layouts,
  setStep,
  btnPrimary,
  btnTemplate,
  COLORS,
  manualCopies,
  setManualCopies,
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "900px",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Subtle animated background */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "200px",
          background: `linear-gradient(180deg, ${COLORS.LIGHT_BACKGROUND}40 0%, transparent 100%)`,
          borderRadius: "0 0 50% 50%",
          filter: "blur(30px)",
          zIndex: -1,
          animation: "breathe 4s ease-in-out infinite",
        }}
      />

      {/* Header with gradient text */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2
          style={{
            background: `linear-gradient(135deg, ${COLORS.DEEP_BLUE} 0%, ${COLORS.PRIMARY_BLUE} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "12px",
            fontSize: "28px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            textShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          Select Template
        </h2>
        <p
          style={{
            color: "#5a6c7d",
            marginBottom: "0",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          Choose your photo booth layout style
        </p>
      </div>

      {/* Templates Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "32px",
          width: "100%",
        }}
      >
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;

          return (
            <div
              key={template.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "220px",
                cursor: "pointer",
                transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
              }}
              onClick={() => {
                setSelectedTemplate(template);
                setTotalFrames(template.frames);

                const usingLayout = layouts.vertical[template.frames];
                if (usingLayout) {
                  setPhotosToCapture(usingLayout.numRows);

                  if (!manualCopies) {
                    setPrintCopies(usingLayout.numRows);
                  }

                  setSelectedAspectRatio(
                    usingLayout.photoWidth / usingLayout.photoHeight
                  );
                } else {
                  setPhotosToCapture(template.frames);
                  if (!manualCopies) {
                    setPrintCopies(2);
                  }
                }
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "translateY(-8px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {/* Glow effect for selected */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "190px",
                    height: "250px",
                    background: `radial-gradient(circle, ${COLORS.ACCENT_YELLOW}40 0%, transparent 70%)`,
                    filter: "blur(25px)",
                    zIndex: -1,
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              )}

              {/* Template Preview Box */}
              <div
                style={{
                  position: "relative",
                  width: "180px",
                  height: "240px",
                  marginBottom: "14px",
                  background: isSelected
                    ? `linear-gradient(145deg, #ffffff 0%, ${COLORS.LIGHT_BACKGROUND}30 100%)`
                    : "#ffffff",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  border: isSelected
                    ? `3px solid ${COLORS.ACCENT_YELLOW}`
                    : "3px solid #f0f0f0",
                  boxShadow: isSelected
                    ? `0 16px 32px rgba(0, 0, 0, 0.12), 
                       0 0 0 1px ${COLORS.ACCENT_YELLOW}80,
                       inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                    : `0 6px 16px rgba(0, 0, 0, 0.08),
                       inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                  overflow: "hidden",
                }}
              >
                {/* Shimmer effect */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                    animation: isSelected ? "shimmer 2s infinite" : "none",
                    pointerEvents: "none",
                  }}
                />

                {/* Selected Badge with bounce */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`,
                      borderRadius: "50%",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 16px ${COLORS.ACCENT_YELLOW}60,
                                  0 0 20px ${COLORS.ACCENT_YELLOW}30`,
                      zIndex: 10,
                      animation: "bounceIn 0.5s ease-out",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={COLORS.TEXT_BLACK}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridTemplateRows: `repeat(${Math.ceil(
                      template.frames / 2
                    )}, 1fr)`,
                    gap: "10px",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  {Array.from({ length: template.frames }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_GREY}80 100%)`
                          : `linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)`,
                        borderRadius: "8px",
                        border: `2px solid ${
                          isSelected ? COLORS.PRIMARY_BLUE + "40" : "#e5e5e5"
                        }`,
                        padding: "8px 8px 12px 8px",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: isSelected
                          ? `0 4px 12px ${COLORS.PRIMARY_BLUE}15,
                             inset 0 1px 0 rgba(255, 255, 255, 0.9)`
                          : `0 2px 6px rgba(0, 0, 0, 0.06),
                             inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Polaroid Image Area */}
                      <div
                        style={{
                          flex: 1,
                          background: isSelected
                            ? `linear-gradient(135deg, ${COLORS.LIGHT_BACKGROUND}60 0%, ${COLORS.PRIMARY_BLUE}10 100%)`
                            : "linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%)",
                          borderRadius: "5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {/* Camera Icon with filter */}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={isSelected ? COLORS.PRIMARY_BLUE : "#999"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            opacity: 0.5,
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                          }}
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                      {/* Polaroid White Space Bottom */}
                      <div
                        style={{
                          height: "6px",
                          background: "#fff",
                          marginTop: "4px",
                          borderRadius: "0 0 3px 3px",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Label Button */}
              <button
                style={{
                  ...btnTemplate,
                  background: isSelected
                    ? `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`
                    : `linear-gradient(135deg, ${COLORS.LIGHT_GREY} 0%, #e8e8e8 100%)`,
                  border: `2px solid ${
                    isSelected ? COLORS.ACCENT_YELLOW : "transparent"
                  }`,
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: isSelected ? "700" : "600",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected
                    ? `0 8px 20px ${COLORS.ACCENT_YELLOW}30,
                       inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                    : `0 3px 8px rgba(0, 0, 0, 0.08),
                       inset 0 1px 0 rgba(255, 255, 255, 0.5)`,
                  color: COLORS.TEXT_BLACK,
                  width: "100%",
                  letterSpacing: "0.3px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {template.label}
                {isSelected && (
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "12px",
                      animation: "fadeIn 0.3s ease-out",
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Number of Copies Selection - Enhanced */}
      {selectedTemplate && (
        <div
          style={{
            marginTop: "10px",
            marginBottom: "32px",
            padding: "28px",
            background: `linear-gradient(145deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_BACKGROUND}50 100%)`,
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            boxShadow: `0 12px 28px rgba(0, 0, 0, 0.1),
                        0 0 0 1px ${COLORS.PRIMARY_BLUE}15,
                        inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
            border: `2px solid ${COLORS.PRIMARY_BLUE}20`,
            backdropFilter: "blur(10px)",
            animation: "slideUp 0.4s ease-out",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative corner accent */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              right: "-30px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.ACCENT_YELLOW}20 0%, transparent 70%)`,
              filter: "blur(20px)",
              pointerEvents: "none",
            }}
          />

          <h3
            style={{
              color: COLORS.TEXT_BLACK,
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "700",
              textAlign: "center",
              letterSpacing: "-0.3px",
              position: "relative",
            }}
          >
            How many copies do you want?
          </h3>

          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            {[2, 3, 4].map((num) => {
              const isSelectedNum = printCopies === num;

              return (
                <button
                  key={num}
                  onClick={() => {
                    setPrintCopies(num);
                    setManualCopies(true);
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelectedNum) {
                      e.currentTarget.style.transform =
                        "translateY(-4px) scale(1.08)";
                      e.currentTarget.style.boxShadow = `0 10px 24px rgba(0, 0, 0, 0.15),
                                                          inset 0 1px 0 rgba(255, 255, 255, 0.6)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelectedNum) {
                      e.currentTarget.style.transform =
                        "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = isSelectedNum
                        ? `0 10px 24px ${COLORS.ACCENT_YELLOW}30,
                           inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                        : `0 4px 12px rgba(0, 0, 0, 0.08),
                           inset 0 1px 0 rgba(255, 255, 255, 0.6)`;
                    }
                  }}
                  style={{
                    position: "relative",
                    padding: "18px 30px",
                    borderRadius: "12px",
                    border: `3px solid ${
                      isSelectedNum
                        ? COLORS.ACCENT_YELLOW
                        : COLORS.PRIMARY_BLUE + "25"
                    }`,
                    background: isSelectedNum
                      ? `linear-gradient(135deg, ${COLORS.ACCENT_YELLOW} 0%, #ffd700 100%)`
                      : `linear-gradient(135deg, ${COLORS.BASE_WHITE} 0%, ${COLORS.LIGHT_GREY} 100%)`,
                    color: COLORS.TEXT_BLACK,
                    fontSize: "22px",
                    fontWeight: isSelectedNum ? "800" : "700",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isSelectedNum
                      ? `0 10px 24px ${COLORS.ACCENT_YELLOW}30,
                         0 0 0 1px ${COLORS.ACCENT_YELLOW}40,
                         inset 0 1px 0 rgba(255, 255, 255, 0.6)`
                      : `0 4px 12px rgba(0, 0, 0, 0.08),
                         inset 0 1px 0 rgba(255, 255, 255, 0.6)`,
                    transform: isSelectedNum
                      ? "translateY(-3px) scale(1.08)"
                      : "translateY(0) scale(1)",
                    minWidth: "70px",
                    outline: "none",
                  }}
                >
                  {num}
                  {/* Ripple effect on selection */}
                  {isSelectedNum && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: COLORS.DEEP_BLUE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.BASE_WHITE,
                        fontSize: "12px",
                        fontWeight: "700",
                        boxShadow: `0 4px 12px ${COLORS.DEEP_BLUE}50`,
                        animation: "scaleIn 0.3s ease-out",
                      }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selection Indicator with pulse effect */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px 24px",
              background: `linear-gradient(135deg, ${COLORS.LIGHT_BACKGROUND}50 0%, ${COLORS.PRIMARY_BLUE}08 100%)`,
              borderRadius: "12px",
              border: `2px solid ${COLORS.PRIMARY_BLUE}25`,
              backdropFilter: "blur(5px)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: COLORS.ACCENT_YELLOW,
                boxShadow: `0 0 12px ${COLORS.ACCENT_YELLOW}80`,
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: "16px",
                color: COLORS.TEXT_BLACK,
                fontWeight: "600",
              }}
            >
              Selected:{" "}
              <strong
                style={{
                  color: COLORS.DEEP_BLUE,
                  fontSize: "18px",
                  fontWeight: "800",
                }}
              >
                {printCopies}
              </strong>{" "}
              {printCopies === 1 ? "copy" : "copies"}
            </p>
          </div>
        </div>
      )}

      {/* Next Button with glow effect */}
      <button
        onClick={() => setStep("capture")}
        disabled={!selectedTemplate}
        onMouseEnter={(e) => {
          if (selectedTemplate) {
            e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
            e.currentTarget.style.boxShadow = `0 16px 36px ${COLORS.DEEP_BLUE}40,
                                                0 0 0 1px ${COLORS.DEEP_BLUE}30,
                                                inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTemplate) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = `0 10px 24px ${COLORS.DEEP_BLUE}35,
                                                0 0 0 1px ${COLORS.DEEP_BLUE}20,
                                                inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
          }
        }}
        style={{
          ...btnPrimary,
          position: "relative",
          opacity: !selectedTemplate ? 0.5 : 1,
          cursor: !selectedTemplate ? "not-allowed" : "pointer",
          padding: "16px 48px",
          fontSize: "17px",
          fontWeight: "700",
          borderRadius: "12px",
          border: "none",
          background: selectedTemplate
            ? `linear-gradient(135deg, ${COLORS.DEEP_BLUE} 0%, ${COLORS.PRIMARY_BLUE} 100%)`
            : "#d5d5d5",
          color: COLORS.BASE_WHITE,
          boxShadow: !selectedTemplate
            ? "none"
            : `0 10px 24px ${COLORS.DEEP_BLUE}35,
               0 0 0 1px ${COLORS.DEEP_BLUE}20,
               inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: !selectedTemplate ? "scale(1)" : "scale(1)",
          letterSpacing: "0.5px",
          overflow: "hidden",
        }}
      >
        {/* Button shimmer effect */}
        {selectedTemplate && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              animation: "shimmer 3s infinite",
            }}
          />
        )}
        <span style={{ position: "relative", zIndex: 1 }}>Next →</span>
      </button>

      {/* CSS Keyframes */}
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
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
          
          @keyframes bounceIn {
            0% {
              opacity: 0;
              transform: scale(0.3);
            }
            50% {
              opacity: 1;
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          
          @keyframes breathe {
            0%, 100% {
              opacity: 0.3;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </div>
  );
}
