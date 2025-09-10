// // import React, { useEffect, useRef, useState } from "react";

// // /**
// //  * Polaroidish - Single file React component
// //  * Steps: start -> select -> capture -> preview
// //  *
// //  * Improvements:
// //  * - captures both raw + filtered data URLs so filters can be changed in Preview
// //  * - requires user to take exactly totalFrames captures (press button or Space)
// //  * - video filter reflects selected filter while capturing
// //  * - "Apply filter to all" in Preview re-generates filtered images from raw
// //  * - clean start/stop of webcam
// //  */

// // export default function Polaroidish() {
// //   // refs
// //   const videoRef = useRef(null);
// //   const rawCanvasRef = useRef(null); // used to capture raw frame
// //   const filterCanvasRef = useRef(null); // used to create filtered images
// //   const streamRef = useRef(null);

// //   // UI state
// //   const [message, setMessage] = useState("");
// //   const [messageVisible, setMessageVisible] = useState(false);
// //   const [totalFrames, setTotalFrames] = useState(4);
// //   const [layout, setLayout] = useState("horizontal");
// //   const [filter, setFilter] = useState("none");
// //   const [bgColor, setBgColor] = useState("#1a1a1a");

// //   // photosTaken: array of { raw: dataUrl, filtered: dataUrl }
// //   const [photosTaken, setPhotosTaken] = useState([]);
// //   const [webcamStarted, setWebcamStarted] = useState(false);
// //   const [flash, setFlash] = useState(false);
// //   const [step, setStep] = useState("start"); // 'start'|'select'|'capture'|'preview'
// //   const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

// //   const BORDER_SIZE = 20;
// //   const GAP_SIZE = 20;

// //   const layouts = {
// //     vertical: {
// //       4: {
// //         finalWidth: 1200,
// //         finalHeight: 1800,
// //         numCols: 2,
// //         numRows: 2,
// //         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //       6: {
// //         finalWidth: 1200,
// //         finalHeight: 1800,
// //         numCols: 2,
// //         numRows: 3,
// //         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //       8: {
// //         finalWidth: 1200,
// //         finalHeight: 1800,
// //         numCols: 2,
// //         numRows: 4,
// //         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //     },
// //     horizontal: {
// //       4: {
// //         finalWidth: 1800,
// //         finalHeight: 1200,
// //         numCols: 2,
// //         numRows: 2,
// //         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //       6: {
// //         finalWidth: 1800,
// //         finalHeight: 1200,
// //         numCols: 3,
// //         numRows: 2,
// //         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
// //         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //       8: {
// //         finalWidth: 1800,
// //         finalHeight: 1200,
// //         numCols: 4,
// //         numRows: 2,
// //         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
// //         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
// //         sideBorder: BORDER_SIZE,
// //         topBorder: BORDER_SIZE,
// //         gap: GAP_SIZE,
// //       },
// //     },
// //   };

// //   const templates = [
// //     { id: "4h", label: "4-up (Horizontal)", frames: 4, layout: "horizontal" },
// //     { id: "6v", label: "6-up (Vertical)", frames: 6, layout: "vertical" },
// //     { id: "8h", label: "8-up (Horizontal)", frames: 8, layout: "horizontal" },
// //   ];

// //   // Helpers
// //   function showMessage(msg, ms = 1800) {
// //     setMessage(msg);
// //     setMessageVisible(true);
// //     clearTimeout(showMessage._t);
// //     showMessage._t = setTimeout(() => setMessageVisible(false), ms);
// //   }

// //   function resetApp() {
// //     stopWebcam();
// //     setPhotosTaken([]);
// //     setFilter("none");
// //     setLayout("horizontal");
// //     setTotalFrames(4);
// //     setStep("start");
// //     showMessage("Reset. Click Get Started.");
// //   }

// //   // access webcam
// //   async function startWebcam() {
// //     if (webcamStarted) return;
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({
// //         video: { facingMode: "user" },
// //         audio: false,
// //       });
// //       streamRef.current = stream;
// //       if (videoRef.current) {
// //         videoRef.current.srcObject = stream;
// //         await videoRef.current.play();
// //       }
// //       setWebcamStarted(true);
// //       showMessage("Webcam started — press Space or click Take");
// //     } catch (err) {
// //       console.error("Error accessing webcam", err);
// //       showMessage("Cannot access webcam. Allow camera permissions and retry.");
// //     }
// //   }

// //   function stopWebcam() {
// //     if (streamRef.current) {
// //       streamRef.current.getTracks().forEach((t) => t.stop());
// //       streamRef.current = null;
// //     }
// //     if (videoRef.current) videoRef.current.srcObject = null;
// //     setWebcamStarted(false);
// //   }

// //   // cleanup on unmount
// //   useEffect(() => {
// //     return () => {
// //       if (streamRef.current) {
// //         streamRef.current.getTracks().forEach((t) => t.stop());
// //       }
// //       clearTimeout(autoAdvanceTimer);
// //     };
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, []);

// //   // When entering capture step, start webcam
// //   useEffect(() => {
// //     if (step === "capture") {
// //       setPhotosTaken([]); // fresh round
// //       setTimeout(() => startWebcam(), 150);
// //     } else {
// //       // stop webcam while not capturing
// //       stopWebcam();
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [step]);

// //   useEffect(() => {
// //     if (step === "preview" && photosTaken.length > 0) {
// //       // small delay to avoid race if user is clicking quickly
// //       const t = setTimeout(() => {
// //         applyFilterToAll();
// //       }, 120);
// //       return () => clearTimeout(t);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [filter, step]);

// //   // keyboard: Space to capture while in capture step
// //   useEffect(() => {
// //     function onKey(e) {
// //       if (step !== "capture") return;
// //       if (e.code === "Space") {
// //         e.preventDefault();
// //         capturePhoto();
// //       }
// //     }
// //     window.addEventListener("keydown", onKey);
// //     return () => window.removeEventListener("keydown", onKey);
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [step, photosTaken, filter, webcamStarted]);

// //   // derive computed video CSS filter from filter name
// //   function computedVideoFilter() {
// //     switch (filter) {
// //       case "grayscale":
// //         return "grayscale(100%)";
// //       case "sepia":
// //         return "sepia(100%)";
// //       case "invert":
// //         return "invert(100%)";
// //       case "saturate":
// //         return "saturate(200%)";
// //       case "contrast":
// //         return "contrast(200%)";
// //       case "hue-rotate":
// //         return "hue-rotate(90deg)";
// //       case "vintage":
// //         return "sepia(50%) saturate(150%) brightness(120%)";
// //       case "blur":
// //         return "blur(3px)";
// //       case "noir":
// //         return "grayscale(100%) contrast(140%) brightness(90%)";
// //       default:
// //         return "none";
// //     }
// //   }

// //   // map filter to canvas CSS filter string (same as above)
// //   function canvasFilterString(name) {
// //     switch (name) {
// //       case "grayscale":
// //         return "grayscale(100%)";
// //       case "sepia":
// //         return "sepia(100%)";
// //       case "invert":
// //         return "invert(100%)";
// //       case "saturate":
// //         return "saturate(200%)";
// //       case "contrast":
// //         return "contrast(200%)";
// //       case "hue-rotate":
// //         return "hue-rotate(90deg)";
// //       case "vintage":
// //         return "sepia(50%) saturate(150%) brightness(120%)";
// //       case "blur":
// //         return "blur(3px)";
// //       case "noir":
// //         return "grayscale(100%) contrast(140%) brightness(90%)";
// //       default:
// //         return "none";
// //     }
// //   }

// //   // utility: center-crop draw (same as your original)
// //   function drawImageCover(ctx, img, canvasWidth, canvasHeight, x = 0, y = 0) {
// //     const imgRatio = img.width / img.height;
// //     const canvasRatio = canvasWidth / canvasHeight;

// //     let sourceX = 0,
// //       sourceY = 0,
// //       sourceWidth = img.width,
// //       sourceHeight = img.height;

// //     if (imgRatio > canvasRatio) {
// //       sourceWidth = img.height * canvasRatio;
// //       sourceX = (img.width - sourceWidth) / 2;
// //     } else {
// //       sourceHeight = img.width / canvasRatio;
// //       sourceY = (img.height - sourceHeight) / 2;
// //     }

// //     ctx.drawImage(
// //       img,
// //       sourceX,
// //       sourceY,
// //       sourceWidth,
// //       sourceHeight,
// //       x,
// //       y,
// //       canvasWidth,
// //       canvasHeight
// //     );
// //   }

// //   // capture current frame: store raw + filtered
// //   async function capturePhoto() {
// //     if (!webcamStarted || !videoRef.current) {
// //       showMessage("Camera not started");
// //       return;
// //     }
// //     if (photosTaken.length >= totalFrames) {
// //       showMessage("All frames captured");
// //       return;
// //     }

// //     const v = videoRef.current;
// //     // use rawCanvas to capture raw frame at video size
// //     const rawCanvas = rawCanvasRef.current;
// //     const w = v.videoWidth || 1280;
// //     const h = v.videoHeight || 720;
// //     rawCanvas.width = w;
// //     rawCanvas.height = h;
// //     const rawCtx = rawCanvas.getContext("2d");
// //     rawCtx.filter = "none"; // raw
// //     rawCtx.drawImage(v, 0, 0, w, h);
// //     const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

// //     // create filtered version
// //     const filteredData = await makeFilteredDataUrl(rawData, filter, w, h);

// //     // small flash
// //     setFlash(true);
// //     setTimeout(() => setFlash(false), 140);

// //     setPhotosTaken((prev) => {
// //       const next = [...prev, { raw: rawData, filtered: filteredData }];
// //       showMessage(`Captured ${next.length} of ${totalFrames}`);
// //       // if finished, auto-advance to preview after a short delay
// //       if (next.length >= totalFrames) {
// //         clearTimeout(autoAdvanceTimer);
// //         const t = setTimeout(() => {
// //           stopWebcam();
// //           setStep("preview");
// //         }, 400);
// //         setAutoAdvanceTimer(t);
// //       }
// //       return next;
// //     });
// //   }

// //   // take a raw dataURL and a filter name -> return filtered dataURL
// //   // function makeFilteredDataUrl(
// //   //   rawDataUrl,
// //   //   filterName,
// //   //   canvasW = 1280,
// //   //   canvasH = 720
// //   // ) {
// //   //   return new Promise((resolve) => {
// //   //     const img = new Image();
// //   //     img.crossOrigin = "anonymous";
// //   //     img.onload = () => {
// //   //       const c = filterCanvasRef.current;
// //   //       c.width = canvasW;
// //   //       c.height = canvasH;
// //   //       const ctx = c.getContext("2d");
// //   //       ctx.clearRect(0, 0, c.width, c.height);
// //   //       ctx.filter = canvasFilterString(filterName);
// //   //       // draw center-cropped for consistent crop
// //   //       drawImageCover(ctx, img, c.width, c.height, 0, 0);
// //   //       const out = c.toDataURL("image/jpeg", 0.95);
// //   //       resolve(out);
// //   //     };
// //   //     img.onerror = () => {
// //   //       // fallback – return raw if error
// //   //       resolve(rawDataUrl);
// //   //     };
// //   //     img.src = rawDataUrl;
// //   //   });
// //   // }

// //   function makeFilteredDataUrl(
// //     rawDataUrl,
// //     filterName,
// //     canvasW = 1280,
// //     canvasH = 720
// //   ) {
// //     return new Promise((resolve) => {
// //       const img = new Image();
// //       img.crossOrigin = "anonymous";
// //       img.onload = () => {
// //         // try to use persistent ref canvas; if not available, create temp
// //         let c = filterCanvasRef.current;
// //         let created = false;
// //         if (!c) {
// //           c = document.createElement("canvas");
// //           created = true;
// //         }
// //         c.width = canvasW;
// //         c.height = canvasH;
// //         const ctx = c.getContext("2d");
// //         ctx.clearRect(0, 0, c.width, c.height);
// //         ctx.filter = canvasFilterString(filterName);
// //         // draw center-cropped for consistent crop
// //         drawImageCover(ctx, img, c.width, c.height, 0, 0);
// //         const out = c.toDataURL("image/jpeg", 0.95);
// //         // if we created a temporary canvas, we can drop it (GC will clean)
// //         resolve(out);
// //       };
// //       img.onerror = () => {
// //         // fallback – return raw if error
// //         resolve(rawDataUrl);
// //       };
// //       img.src = rawDataUrl;
// //     });
// //   }

// //   // apply currently selected filter to all raw images (in preview)
// //   async function applyFilterToAll() {
// //     if (photosTaken.length === 0) {
// //       showMessage("No photos to apply filter to");
// //       return;
// //     }
// //     showMessage("Applying filter...");
// //     const results = await Promise.all(
// //       photosTaken.map((p) => makeFilteredDataUrl(p.raw, filter))
// //     );
// //     const next = photosTaken.map((p, i) => ({
// //       raw: p.raw,
// //       filtered: results[i],
// //     }));
// //     setPhotosTaken(next);
// //     showMessage("Filter applied");
// //   }

// //   // download composed strip
// //   async function downloadStrip() {
// //     const usingLayout = layouts[layout][totalFrames];
// //     if (!usingLayout) {
// //       showMessage("Invalid layout configuration.");
// //       return;
// //     }

// //     const finalCanvas = document.createElement("canvas");
// //     finalCanvas.width = usingLayout.finalWidth;
// //     finalCanvas.height = usingLayout.finalHeight;
// //     const ctx = finalCanvas.getContext("2d");

// //     ctx.fillStyle = bgColor;
// //     ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

// //     const images = photosTaken
// //       .slice(0, totalFrames)
// //       .map((p) => p.filtered || p.raw);
// //     if (images.length === 0) {
// //       showMessage("No photos available to download.");
// //       return;
// //     }

// //     await Promise.all(
// //       images.map(
// //         (src, index) =>
// //           new Promise((res) => {
// //             const img = new Image();
// //             img.crossOrigin = "anonymous";
// //             img.onload = () => {
// //               const numCols = usingLayout.numCols;
// //               const column = index % numCols;
// //               const row = Math.floor(index / numCols);
// //               const x =
// //                 usingLayout.sideBorder +
// //                 column * (usingLayout.photoWidth + usingLayout.gap);
// //               const y =
// //                 usingLayout.topBorder +
// //                 row * (usingLayout.photoHeight + usingLayout.gap);
// //               drawImageCover(
// //                 ctx,
// //                 img,
// //                 usingLayout.photoWidth,
// //                 usingLayout.photoHeight,
// //                 x,
// //                 y
// //               );
// //               res(true);
// //             };
// //             img.onerror = () => res(true);
// //             img.src = src;
// //           })
// //       )
// //     );

// //     const link = document.createElement("a");
// //     link.download = "polaroidish-strip.png";
// //     link.href = finalCanvas.toDataURL("image/png");
// //     link.click();

// //     showMessage("Downloaded!");
// //   }

// //   // When user selects template and wants to open camera
// //   function chooseTemplateFrames(frames, layoutChoice = layout) {
// //     setTotalFrames(frames);
// //     setLayout(layoutChoice);
// //     setPhotosTaken([]);
// //     setStep("capture");
// //   }

// //   // small UI helper for lists
// //   const layoutOptionsForFrames = () => ["horizontal", "vertical"];

// //   // JSX UI
// //   return (
// //     <div className="min-h-screen p-4 flex items-center justify-center bg-[#fceb96]">
// //       <style>{`
// //         .container-main { background-color: #1a1a1a; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); max-width:1200px; border:1px solid #4a4a4a; }
// //         .text-neon { color:#ffde59; text-shadow:0 0 5px #ffde59,0 0 10px #ffde59; }
// //         .webcam-container { border-radius:12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); position:relative; overflow:hidden; background: #000;}
// //         .button { transition: all 0.18s ease-in-out; border-radius:9999px; padding:10px 22px; font-weight:700; }
// //         .start-btn { background-color:#ffde59; color:#1a1a1a; border:1px solid #ffde59; }
// //         .shutter-btn { background-color:#1a1a1a; color:#ffde59; border:2px solid #ffde59; }
// //         .download-btn { background-color:#ffde59; color:#1a1a1a; border:1px solid #ffde59; }
// //         .reset-btn { background-color:#4a4a4a; color:#fceb96; border:1px solid #666666; }
// //         .disabled-btn { opacity:0.5; cursor:not-allowed; }
// //         .photo-slot { position:relative; overflow:hidden; border-radius:8px; background-color:#4a4a4a; display:flex; justify-content:center; align-items:center; border:1px solid #666666; }
// //         .photo-slot.active { border:2px solid #ffde59; }
// //         #messageBox { visibility:hidden; min-width:250px; margin-left:-125px; background-color:#1a1a1a; color:#ffde59; text-align:center; border-radius:8px; padding:12px; position:fixed; z-index:50; left:50%; top:30px; font-size:15px; box-shadow:0 4px 6px rgba(0,0,0,0.3); opacity:0; transition: opacity 0.3s, top 0.3s; border:1px solid #4a4a4a; }
// //         #messageBox.show { visibility:visible; opacity:1; top:30px; }
// //         .capture-counter {
// //           position:absolute;
// //           left:50%;
// //           top:12%;
// //           transform:translateX(-50%);
// //           z-index:30;
// //           display:flex;
// //           flex-direction:column;
// //           align-items:center;
// //           justify-content:center;
// //           gap:6px;
// //           pointer-events:none;
// //         }
// //         .counter-circle {
// //           width:120px;
// //           height:120px;
// //           border-radius:9999px;
// //           border:4px solid rgba(255,222,89,0.95);
// //           display:flex;
// //           align-items:center;
// //           justify-content:center;
// //           background: rgba(26,26,26,0.6);
// //           box-shadow: 0 8px 30px rgba(0,0,0,0.5);
// //         }
// //         .counter-big { font-size:36px; font-weight:800; color:#ffde59; }
// //         .counter-small { font-size:14px; color:#ffeaa3; }
// //         .camera-flash {
// //           position:absolute;
// //           left:0; top:0; right:0; bottom:0; z-index:40; pointer-events:none;
// //           background: white; opacity:0; transition: opacity 120ms linear;
// //         }
// //         .camera-flash.show { opacity:0.85; transition: opacity 120ms linear; }
// //       `}</style>

// //       <div className="container-main p-6 md:p-10 flex flex-col items-center justify-center space-y-6 text-white w-full max-w-6xl">
// //         <div className="w-full">
// //           <div className="text-center mb-3">
// //             <h1 className="text-4xl font-thin tracking-widest text-neon">
// //               Polaroidish
// //             </h1>
// //             <p className="text-sm text-gray-300 mt-1">
// //               Capture flow — take exactly the number of frames you selected
// //             </p>
// //           </div>

// //           <div className="flex flex-col md:flex-row items-start md:space-x-6 w-full">
// //             {/* Main area */}
// //             <div
// //               className={`${step === "capture" ? "w-full" : "flex-1 w-full"}`}
// //             >
// //               {/* START */}
// //               {step === "start" && (
// //                 <div className="w-full flex flex-col items-center space-y-6 p-6 bg-[#111] rounded-lg">
// //                   <h2 className="text-xl text-gray-200">Welcome</h2>
// //                   <p className="text-gray-400">
// //                     Click Get Started to create a photo strip.
// //                   </p>
// //                   <div className="flex space-x-4">
// //                     <button
// //                       onClick={() => setStep("select")}
// //                       className="button start-btn"
// //                     >
// //                       Get Started
// //                     </button>
// //                     <button onClick={resetApp} className="button reset-btn">
// //                       Reset
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* SELECT */}
// //               {step === "select" && (
// //                 <div className="w-full p-6 bg-[#111] rounded-lg">
// //                   <h2 className="text-xl text-gray-200 mb-2">Select Frame</h2>
// //                   <p className="text-gray-400 mb-4">Choose frames and layout</p>

// //                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                     {templates.map((t) => (
// //                       <div
// //                         key={t.id}
// //                         className="p-4 rounded-lg border border-gray-600 bg-[#0f0f0f]"
// //                       >
// //                         <div className="font-medium text-yellow-300">
// //                           {t.label}
// //                         </div>
// //                         <div className="text-sm text-gray-400">
// //                           {t.frames} frames • {t.layout}
// //                         </div>
// //                         <div className="mt-3 flex space-x-2">
// //                           <button
// //                             onClick={() =>
// //                               chooseTemplateFrames(t.frames, t.layout)
// //                             }
// //                             className="button start-btn"
// //                           >
// //                             Use
// //                           </button>
// //                           <button
// //                             onClick={() => {
// //                               setTotalFrames(t.frames);
// //                               setLayout(t.layout);
// //                               setPhotosTaken([]);
// //                               showMessage(`${t.frames} frames selected`);
// //                             }}
// //                             className="button reset-btn"
// //                           >
// //                             Select only
// //                           </button>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>

// //                   <div className="mt-6 flex items-center space-x-3">
// //                     <label className="text-gray-300">Frames:</label>
// //                     <select
// //                       value={totalFrames}
// //                       onChange={(e) => {
// //                         const v = parseInt(e.target.value, 10);
// //                         setTotalFrames(v);
// //                         setPhotosTaken([]);
// //                       }}
// //                       className="bg-[#111] border border-gray-600 text-yellow-300 p-2 rounded"
// //                     >
// //                       <option value={4}>4</option>
// //                       <option value={6}>6</option>
// //                       <option value={8}>8</option>
// //                     </select>

// //                     <label className="text-gray-300 ml-4">Layout:</label>
// //                     <select
// //                       value={layout}
// //                       onChange={(e) => setLayout(e.target.value)}
// //                       className="bg-[#111] border border-gray-600 text-yellow-300 p-2 rounded"
// //                     >
// //                       {layoutOptionsForFrames().map((opt) => (
// //                         <option key={opt} value={opt}>
// //                           {opt === "horizontal" ? "Horizontal" : "Vertical"}
// //                         </option>
// //                       ))}
// //                     </select>

// //                     <div className="ml-auto">
// //                       <button
// //                         onClick={() => {
// //                           chooseTemplateFrames(totalFrames, layout);
// //                         }}
// //                         className="button start-btn"
// //                       >
// //                         Next: Open Camera
// //                       </button>
// //                     </div>
// //                   </div>

// //                   <div className="mt-4 flex justify-between">
// //                     <button
// //                       onClick={() => setStep("start")}
// //                       className="button reset-btn"
// //                     >
// //                       Back
// //                     </button>
// //                     <div className="text-gray-400">
// //                       Photos to capture: {totalFrames}
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* CAPTURE */}
// //               {step === "capture" && (
// //                 <div className="w-full bg-[#000] rounded-md">
// //                   <div
// //                     className="relative w-full"
// //                     style={{ paddingTop: "56.25%" }}
// //                   >
// //                     <div
// //                       className="webcam-container"
// //                       style={{
// //                         position: "absolute",
// //                         left: 0,
// //                         top: 0,
// //                         right: 0,
// //                         bottom: 0,
// //                       }}
// //                     >
// //                       <video
// //                         ref={videoRef}
// //                         className="w-full h-full object-cover"
// //                         playsInline
// //                         autoPlay
// //                         muted
// //                         style={{ filter: computedVideoFilter() }}
// //                       />

// //                       {/* hidden canvases for processing */}
// //                       <canvas ref={rawCanvasRef} className="hidden" />
// //                       <canvas ref={filterCanvasRef} className="hidden" />

// //                       {/* flash overlay */}
// //                       <div className={`camera-flash ${flash ? "show" : ""}`} />
// //                       {/* big centered counter overlay */}
// //                       <div
// //                         className="capture-counter"
// //                         role="status"
// //                         aria-live="polite"
// //                       >
// //                         <div className="counter-circle">
// //                           <div className="counter-big">
// //                             {Math.min(photosTaken.length + 1, totalFrames)}
// //                           </div>
// //                         </div>
// //                         <div className="counter-small">of {totalFrames}</div>
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="mt-4 flex items-center justify-center space-x-6">
// //                     <button
// //                       onClick={capturePhoto}
// //                       disabled={
// //                         !webcamStarted || photosTaken.length >= totalFrames
// //                       }
// //                       className={`button shutter-btn ${
// //                         !webcamStarted || photosTaken.length >= totalFrames
// //                           ? "disabled-btn"
// //                           : ""
// //                       }`}
// //                     >
// //                       {photosTaken.length >= totalFrames
// //                         ? "Done"
// //                         : "Take Photo"}
// //                     </button>

// //                     <button
// //                       onClick={() => {
// //                         stopWebcam();
// //                         setStep("select");
// //                       }}
// //                       className="button reset-btn"
// //                     >
// //                       Back to Select
// //                     </button>

// //                     <button
// //                       onClick={() => {
// //                         stopWebcam();
// //                         setStep("preview");
// //                       }}
// //                       disabled={photosTaken.length === 0}
// //                       className={`button download-btn ${
// //                         photosTaken.length === 0 ? "disabled-btn" : ""
// //                       }`}
// //                     >
// //                       Preview
// //                     </button>
// //                   </div>

// //                   <div className="mt-3 text-center text-gray-300">
// //                     Captured: {photosTaken.length} / {totalFrames} • Press Space
// //                     to capture
// //                   </div>
// //                 </div>
// //               )}

// //               {/* PREVIEW */}
// //               {/* {step === "preview" && (
// //                 <div className="w-full p-6 bg-[#111] rounded-lg">
// //                   <h2 className="text-xl text-gray-200">Result / Preview</h2>

// //                   <div
// //                     className="w-full mt-4 p-4 rounded grid gap-4"
// //                     style={{
// //                       gridTemplateColumns: `repeat(${layouts[layout][totalFrames].numCols}, minmax(0,1fr))`,
// //                     }}
// //                   >
// //                     {Array.from({ length: totalFrames }).map((_, i) => (
// //                       <div key={i} className="photo-slot w-full aspect-video">
// //                         {photosTaken[i] ? (
// //                           <img
// //                             src={photosTaken[i].filtered || photosTaken[i].raw}
// //                             className="w-full h-full rounded-lg object-cover"
// //                             alt={`photo-${i}`}
// //                           />
// //                         ) : (
// //                           <div className="text-gray-400">Empty</div>
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>

// //                   <div className="mt-4 flex flex-wrap items-center gap-3">
// //                     <button
// //                       onClick={downloadStrip}
// //                       className="button download-btn"
// //                     >
// //                       Download Photo Strip
// //                     </button>
// //                     <button
// //                       onClick={() => {
// //                         setPhotosTaken([]);
// //                         setStep("capture");
// //                       }}
// //                       className="button reset-btn"
// //                     >
// //                       Retake
// //                     </button>
// //                     <button onClick={resetApp} className="button reset-btn">
// //                       Start Over
// //                     </button>

// //                     <div className="ml-auto flex items-center space-x-2">
// //                       <label className="text-sm text-gray-400">Filter:</label>
// //                       <select
// //                         value={filter}
// //                         onChange={(e) => setFilter(e.target.value)}
// //                         className="bg-[#111] border border-gray-600 text-yellow-300 p-2 rounded"
// //                       >
// //                         <option value="none">None</option>
// //                         <option value="grayscale">Grayscale</option>
// //                         <option value="sepia">Sepia</option>
// //                         <option value="invert">Invert</option>
// //                         <option value="saturate">Saturate</option>
// //                         <option value="contrast">Contrast</option>
// //                         <option value="hue-rotate">Hue Rotate</option>
// //                         <option value="vintage">Vintage</option>
// //                         <option value="blur">Blur</option>
// //                         <option value="noir">Noir</option>
// //                       </select>

// //                       <button
// //                         onClick={applyFilterToAll}
// //                         className="button start-btn"
// //                       >
// //                         Apply filter to all
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )} */}

// //               {/* PREVIEW */}
// //               {step === "preview" && (
// //                 <div className="w-full p-6 bg-[#111] rounded-lg">
// //                   <h2 className="text-xl text-gray-200">Result / Preview</h2>

// //                   {/* composed preview that shows bgColor + borders/gaps like the downloaded strip */}
// //                   <div className="w-full mt-4 p-2 rounded">
// //                     {(() => {
// //                       const usingLayout = layouts[layout][totalFrames];
// //                       // guard
// //                       if (!usingLayout)
// //                         return (
// //                           <div className="text-gray-400">Invalid layout</div>
// //                         );
// //                       return (
// //                         <div
// //                           style={{
// //                             width: "100%",
// //                             // keep the final strip aspect ratio so preview looks like final
// //                             aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
// //                             maxHeight: 600,
// //                             backgroundColor: bgColor,
// //                             padding: usingLayout.topBorder,
// //                             boxSizing: "border-box",
// //                             borderRadius: 8,
// //                             overflow: "hidden",
// //                           }}
// //                         >
// //                           <div
// //                             style={{
// //                               display: "grid",
// //                               gridTemplateColumns: `repeat(${usingLayout.numCols}, 1fr)`,
// //                               gridAutoRows: "1fr",
// //                               gap: usingLayout.gap,
// //                               width: "100%",
// //                               height: "100%",
// //                             }}
// //                           >
// //                             {Array.from({ length: totalFrames }).map((_, i) => {
// //                               const src = photosTaken[i]
// //                                 ? photosTaken[i].filtered || photosTaken[i].raw
// //                                 : null;
// //                               return (
// //                                 <div
// //                                   key={i}
// //                                   className="rounded overflow-hidden"
// //                                   style={{
// //                                     width: "100%",
// //                                     height: "100%",
// //                                     backgroundColor: "#222",
// //                                   }}
// //                                 >
// //                                   {src ? (
// //                                     <div
// //                                       style={{
// //                                         width: "100%",
// //                                         height: "100%",
// //                                         backgroundImage: `url(${src})`,
// //                                         backgroundSize: "cover",
// //                                         backgroundPosition: "center",
// //                                       }}
// //                                     />
// //                                   ) : (
// //                                     <div className="flex items-center justify-center h-full text-gray-400">
// //                                       Empty
// //                                     </div>
// //                                   )}
// //                                 </div>
// //                               );
// //                             })}
// //                           </div>
// //                         </div>
// //                       );
// //                     })()}
// //                   </div>

// //                   <div className="mt-4 flex flex-wrap items-center gap-3">
// //                     <button
// //                       onClick={downloadStrip}
// //                       className="button download-btn"
// //                     >
// //                       Download Photo Strip
// //                     </button>
// //                     <button
// //                       onClick={() => {
// //                         setPhotosTaken([]);
// //                         setStep("capture");
// //                       }}
// //                       className="button reset-btn"
// //                     >
// //                       Retake
// //                     </button>
// //                     <button onClick={resetApp} className="button reset-btn">
// //                       Start Over
// //                     </button>

// //                     <div className="ml-auto flex items-center space-x-2">
// //                       <label className="text-sm text-gray-400">Filter:</label>
// //                       <select
// //                         value={filter}
// //                         onChange={(e) => setFilter(e.target.value)}
// //                         className="bg-[#111] border border-gray-600 text-yellow-300 p-2 rounded"
// //                       >
// //                         <option value="none">None</option>
// //                         <option value="grayscale">Grayscale</option>
// //                         <option value="sepia">Sepia</option>
// //                         <option value="invert">Invert</option>
// //                         <option value="saturate">Saturate</option>
// //                         <option value="contrast">Contrast</option>
// //                         <option value="hue-rotate">Hue Rotate</option>
// //                         <option value="vintage">Vintage</option>
// //                         <option value="blur">Blur</option>
// //                         <option value="noir">Noir</option>
// //                       </select>

// //                       <button
// //                         onClick={applyFilterToAll}
// //                         className="button start-btn"
// //                       >
// //                         Apply filter to all
// //                       </button>
// //                     </div>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>

// //             {/* Right column — now shown ONLY on final PREVIEW */}
// //             {step === "preview" && (
// //               <div className="w-80 flex-shrink-0">
// //                 <div className="p-4 bg-[#111] rounded-lg mb-4">
// //                   <h3 className="text-lg text-gray-200 mb-3">Controls</h3>

// //                   <div className="mb-3">
// //                     <label className="text-sm text-gray-400">
// //                       Filters (final)
// //                     </label>
// //                     <select
// //                       value={filter}
// //                       onChange={(e) => setFilter(e.target.value)}
// //                       className="w-full mt-2 p-2 bg-[#0f0f0f] rounded border border-gray-600 text-yellow-300"
// //                     >
// //                       <option value="none">None</option>
// //                       <option value="grayscale">Grayscale</option>
// //                       <option value="sepia">Sepia</option>
// //                       <option value="invert">Invert</option>
// //                       <option value="saturate">Saturate</option>
// //                       <option value="contrast">Contrast</option>
// //                       <option value="hue-rotate">Hue Rotate</option>
// //                       <option value="vintage">Vintage</option>
// //                       <option value="blur">Blur</option>
// //                       <option value="noir">Noir</option>
// //                     </select>
// //                     <div className="text-xs text-gray-400 mt-2">
// //                       Ye filter final preview aur download ko affect karega.
// //                       (Use "Apply filter to all" to re-generate.)
// //                     </div>
// //                   </div>

// //                   <div className="mb-3">
// //                     <label className="text-sm text-gray-400">Background</label>
// //                     <input
// //                       type="color"
// //                       value={bgColor}
// //                       onChange={(e) => setBgColor(e.target.value)}
// //                       className="w-full mt-2 p-1 bg-[#0f0f0f] rounded border border-gray-600"
// //                     />
// //                   </div>

// //                   <div className="mb-3">
// //                     <label className="text-sm text-gray-400">Frames</label>
// //                     <select
// //                       value={totalFrames}
// //                       onChange={(e) => {
// //                         const v = parseInt(e.target.value, 10);
// //                         setTotalFrames(v);
// //                         setPhotosTaken([]);
// //                       }}
// //                       className="w-full mt-2 p-2 bg-[#0f0f0f] rounded border border-gray-600 text-yellow-300"
// //                     >
// //                       <option value={4}>4</option>
// //                       <option value={6}>6</option>
// //                       <option value={8}>8</option>
// //                     </select>
// //                   </div>
// //                 </div>

// //                 {/* <div className="p-4 bg-[#111] rounded-lg">
// //                   <h4 className="text-sm text-gray-300 mb-2">Strip Preview</h4>
// //                   <div className="grid grid-cols-2 gap-2">
// //                     {Array.from({ length: totalFrames }).map((_, i) => (
// //                       <div
// //                         key={i}
// //                         className="h-20 w-full bg-[#222] rounded overflow-hidden flex items-center justify-center text-xs text-gray-400"
// //                       >
// //                         {photosTaken[i] ? (
// //                           <img
// //                             src={photosTaken[i].filtered || photosTaken[i].raw}
// //                             className="h-full w-full object-cover"
// //                             alt={`mini-${i}`}
// //                           />
// //                         ) : (
// //                           `#${i + 1}`
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div> */}

// //                 {/* inside right column — Strip Preview (replace old thumbnail grid) */}
// //                 <div className="p-4 bg-[#111] rounded-lg">
// //                   <h4 className="text-sm text-gray-300 mb-2">Strip Preview</h4>
// //                   <div
// //                     style={{
// //                       display: "grid",
// //                       gridTemplateColumns: "repeat(2, 1fr)",
// //                       gap: 8,
// //                     }}
// //                   >
// //                     {(() => {
// //                       const usingLayout = layouts[layout][totalFrames] || {
// //                         sideBorder: 6,
// //                         gap: 6,
// //                       };
// //                       return Array.from({ length: totalFrames }).map((_, i) => {
// //                         const src = photosTaken[i]
// //                           ? photosTaken[i].filtered || photosTaken[i].raw
// //                           : null;
// //                         return (
// //                           <div
// //                             key={i}
// //                             style={{
// //                               height: 72,
// //                               borderRadius: 6,
// //                               overflow: "hidden",
// //                               backgroundColor: bgColor,
// //                               padding: 6,
// //                               boxSizing: "border-box",
// //                               display: "flex",
// //                               alignItems: "center",
// //                               justifyContent: "center",
// //                             }}
// //                           >
// //                             {src ? (
// //                               <div
// //                                 style={{
// //                                   width: "100%",
// //                                   height: "100%",
// //                                   backgroundImage: `url(${src})`,
// //                                   backgroundSize: "cover",
// //                                   backgroundPosition: "center",
// //                                   borderRadius: 4,
// //                                 }}
// //                               />
// //                             ) : (
// //                               <div className="text-xs text-gray-400">
// //                                 #{i + 1}
// //                               </div>
// //                             )}
// //                           </div>
// //                         );
// //                       });
// //                     })()}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* message box */}
// //       <div
// //         id="messageBox"
// //         className={`${messageVisible ? "show" : ""}`}
// //         style={{
// //           position: "fixed",
// //           left: "50%",
// //           transform: "translateX(-50%)",
// //           zIndex: 60,
// //         }}
// //       >
// //         {message}
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useEffect, useRef, useState } from "react";

// /**
//  * Polaroidish - full-screen, responsive single-file React component
//  * Steps: start -> select -> capture -> preview
//  */

// export default function Polaroidish() {
//   // refs
//   const videoRef = useRef(null);
//   const rawCanvasRef = useRef(null); // used to capture raw frame
//   const filterCanvasRef = useRef(null); // used to create filtered images
//   const streamRef = useRef(null);

//   // UI state
//   const [message, setMessage] = useState("");
//   const [messageVisible, setMessageVisible] = useState(false);
//   const [totalFrames, setTotalFrames] = useState(4);
//   const [layout, setLayout] = useState("horizontal");
//   const [filter, setFilter] = useState("none");
//   const [bgColor, setBgColor] = useState("#1a1a1a");

//   // photosTaken: array of { raw: dataUrl, filtered: dataUrl }
//   const [photosTaken, setPhotosTaken] = useState([]);
//   const [webcamStarted, setWebcamStarted] = useState(false);
//   const [flash, setFlash] = useState(false);
//   const [step, setStep] = useState("start"); // 'start'|'select'|'capture'|'preview'
//   const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

//   const BORDER_SIZE = 20;
//   const GAP_SIZE = 20;

//   const layouts = {
//     vertical: {
//       4: {
//         finalWidth: 1200,
//         finalHeight: 1800,
//         numCols: 2,
//         numRows: 2,
//         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//       6: {
//         finalWidth: 1200,
//         finalHeight: 1800,
//         numCols: 2,
//         numRows: 3,
//         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//       8: {
//         finalWidth: 1200,
//         finalHeight: 1800,
//         numCols: 2,
//         numRows: 4,
//         photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//     },
//     horizontal: {
//       4: {
//         finalWidth: 1800,
//         finalHeight: 1200,
//         numCols: 2,
//         numRows: 2,
//         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//       6: {
//         finalWidth: 1800,
//         finalHeight: 1200,
//         numCols: 3,
//         numRows: 2,
//         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
//         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//       8: {
//         finalWidth: 1800,
//         finalHeight: 1200,
//         numCols: 4,
//         numRows: 2,
//         photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
//         photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
//         sideBorder: BORDER_SIZE,
//         topBorder: BORDER_SIZE,
//         gap: GAP_SIZE,
//       },
//     },
//   };

//   const templates = [
//     { id: "4h", label: "4-up (Horizontal)", frames: 4, layout: "horizontal" },
//     { id: "6v", label: "6-up (Vertical)", frames: 6, layout: "vertical" },
//     { id: "8h", label: "8-up (Horizontal)", frames: 8, layout: "horizontal" },
//   ];

//   // Helpers
//   function showMessage(msg, ms = 1800) {
//     setMessage(msg);
//     setMessageVisible(true);
//     clearTimeout(showMessage._t);
//     showMessage._t = setTimeout(() => setMessageVisible(false), ms);
//   }

//   function resetApp() {
//     stopWebcam();
//     setPhotosTaken([]);
//     setFilter("none");
//     setLayout("horizontal");
//     setTotalFrames(4);
//     setStep("start");
//     showMessage("Reset. Click Get Started.");
//   }

//   // access webcam
//   async function startWebcam() {
//     if (webcamStarted) return;
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "user" },
//         audio: false,
//       });
//       streamRef.current = stream;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         await videoRef.current.play();
//       }
//       setWebcamStarted(true);
//       showMessage("Webcam started — press Space or click Take");
//     } catch (err) {
//       console.error("Error accessing webcam", err);
//       showMessage("Cannot access webcam. Allow camera permissions and retry.");
//     }
//   }

//   function stopWebcam() {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) videoRef.current.srcObject = null;
//     setWebcamStarted(false);
//   }

//   // cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//       }
//       clearTimeout(autoAdvanceTimer);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // When entering capture step, start webcam
//   useEffect(() => {
//     if (step === "capture") {
//       setPhotosTaken([]); // fresh round
//       setTimeout(() => startWebcam(), 150);
//     } else {
//       // stop webcam while not capturing
//       stopWebcam();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [step]);

//   // auto-apply filter on preview when filter changed (nice UX)
//   useEffect(() => {
//     if (step === "preview" && photosTaken.length > 0) {
//       const t = setTimeout(() => {
//         applyFilterToAll();
//       }, 120);
//       return () => clearTimeout(t);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter, step]);

//   // keyboard: Space to capture while in capture step
//   useEffect(() => {
//     function onKey(e) {
//       if (step !== "capture") return;
//       if (e.code === "Space") {
//         e.preventDefault();
//         capturePhoto();
//       }
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [step, photosTaken, filter, webcamStarted]);

//   // derive computed video CSS filter from filter name
//   function computedVideoFilter() {
//     switch (filter) {
//       case "grayscale":
//         return "grayscale(100%)";
//       case "sepia":
//         return "sepia(100%)";
//       case "invert":
//         return "invert(100%)";
//       case "saturate":
//         return "saturate(200%)";
//       case "contrast":
//         return "contrast(200%)";
//       case "hue-rotate":
//         return "hue-rotate(90deg)";
//       case "vintage":
//         return "sepia(50%) saturate(150%) brightness(120%)";
//       case "blur":
//         return "blur(3px)";
//       case "noir":
//         return "grayscale(100%) contrast(140%) brightness(90%)";
//       default:
//         return "none";
//     }
//   }

//   // map filter to canvas CSS filter string (same as above)
//   function canvasFilterString(name) {
//     switch (name) {
//       case "grayscale":
//         return "grayscale(100%)";
//       case "sepia":
//         return "sepia(100%)";
//       case "invert":
//         return "invert(100%)";
//       case "saturate":
//         return "saturate(200%)";
//       case "contrast":
//         return "contrast(200%)";
//       case "hue-rotate":
//         return "hue-rotate(90deg)";
//       case "vintage":
//         return "sepia(50%) saturate(150%) brightness(120%)";
//       case "blur":
//         return "blur(3px)";
//       case "noir":
//         return "grayscale(100%) contrast(140%) brightness(90%)";
//       default:
//         return "none";
//     }
//   }

//   // utility: center-crop draw
//   function drawImageCover(ctx, img, canvasWidth, canvasHeight, x = 0, y = 0) {
//     const imgRatio = img.width / img.height;
//     const canvasRatio = canvasWidth / canvasHeight;

//     let sourceX = 0,
//       sourceY = 0,
//       sourceWidth = img.width,
//       sourceHeight = img.height;

//     if (imgRatio > canvasRatio) {
//       sourceWidth = img.height * canvasRatio;
//       sourceX = (img.width - sourceWidth) / 2;
//     } else {
//       sourceHeight = img.width / canvasRatio;
//       sourceY = (img.height - sourceHeight) / 2;
//     }

//     ctx.drawImage(
//       img,
//       sourceX,
//       sourceY,
//       sourceWidth,
//       sourceHeight,
//       x,
//       y,
//       canvasWidth,
//       canvasHeight
//     );
//   }

//   // capture current frame: store raw + filtered
//   async function capturePhoto() {
//     if (!webcamStarted || !videoRef.current) {
//       showMessage("Camera not started");
//       return;
//     }
//     if (photosTaken.length >= totalFrames) {
//       showMessage("All frames captured");
//       return;
//     }

//     const v = videoRef.current;
//     const rawCanvas = rawCanvasRef.current || document.createElement("canvas");
//     const w = v.videoWidth || 1280;
//     const h = v.videoHeight || 720;
//     rawCanvas.width = w;
//     rawCanvas.height = h;
//     const rawCtx = rawCanvas.getContext("2d");
//     rawCtx.filter = "none";
//     rawCtx.drawImage(v, 0, 0, w, h);
//     const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

//     // create filtered version
//     const filteredData = await makeFilteredDataUrl(rawData, filter, w, h);

//     // small flash
//     setFlash(true);
//     setTimeout(() => setFlash(false), 140);

//     setPhotosTaken((prev) => {
//       const next = [...prev, { raw: rawData, filtered: filteredData }];
//       showMessage(`Captured ${next.length} of ${totalFrames}`);
//       if (next.length >= totalFrames) {
//         clearTimeout(autoAdvanceTimer);
//         const t = setTimeout(() => {
//           stopWebcam();
//           setStep("preview");
//         }, 400);
//         setAutoAdvanceTimer(t);
//       }
//       return next;
//     });
//   }

//   // make filtered data url with safe fallback (temp canvas if ref missing)
//   function makeFilteredDataUrl(
//     rawDataUrl,
//     filterName,
//     canvasW = 1280,
//     canvasH = 720
//   ) {
//     return new Promise((resolve) => {
//       const img = new Image();
//       img.crossOrigin = "anonymous";
//       img.onload = () => {
//         let c = filterCanvasRef.current;
//         let created = false;
//         if (!c) {
//           c = document.createElement("canvas");
//           created = true;
//         }
//         c.width = canvasW;
//         c.height = canvasH;
//         const ctx = c.getContext("2d");
//         ctx.clearRect(0, 0, c.width, c.height);
//         ctx.filter = canvasFilterString(filterName);
//         drawImageCover(ctx, img, c.width, c.height, 0, 0);
//         const out = c.toDataURL("image/jpeg", 0.95);
//         resolve(out);
//       };
//       img.onerror = () => resolve(rawDataUrl);
//       img.src = rawDataUrl;
//     });
//   }

//   // apply currently selected filter to all raw images (in preview)
//   async function applyFilterToAll() {
//     if (photosTaken.length === 0) {
//       showMessage("No photos to apply filter to");
//       return;
//     }
//     showMessage("Applying filter...");
//     const results = await Promise.all(
//       photosTaken.map((p) => makeFilteredDataUrl(p.raw, filter))
//     );
//     const next = photosTaken.map((p, i) => ({
//       raw: p.raw,
//       filtered: results[i],
//     }));
//     setPhotosTaken(next);
//     showMessage("Filter applied");
//   }

//   // download composed strip
//   async function downloadStrip() {
//     const usingLayout = layouts[layout][totalFrames];
//     if (!usingLayout) {
//       showMessage("Invalid layout configuration.");
//       return;
//     }

//     const finalCanvas = document.createElement("canvas");
//     finalCanvas.width = usingLayout.finalWidth;
//     finalCanvas.height = usingLayout.finalHeight;
//     const ctx = finalCanvas.getContext("2d");

//     ctx.fillStyle = bgColor;
//     ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

//     const images = photosTaken
//       .slice(0, totalFrames)
//       .map((p) => p.filtered || p.raw);
//     if (images.length === 0) {
//       showMessage("No photos available to download.");
//       return;
//     }

//     await Promise.all(
//       images.map(
//         (src, index) =>
//           new Promise((res) => {
//             const img = new Image();
//             img.crossOrigin = "anonymous";
//             img.onload = () => {
//               const numCols = usingLayout.numCols;
//               const column = index % numCols;
//               const row = Math.floor(index / numCols);
//               const x =
//                 usingLayout.sideBorder +
//                 column * (usingLayout.photoWidth + usingLayout.gap);
//               const y =
//                 usingLayout.topBorder +
//                 row * (usingLayout.photoHeight + usingLayout.gap);
//               drawImageCover(
//                 ctx,
//                 img,
//                 usingLayout.photoWidth,
//                 usingLayout.photoHeight,
//                 x,
//                 y
//               );
//               res(true);
//             };
//             img.onerror = () => res(true);
//             img.src = src;
//           })
//       )
//     );

//     const link = document.createElement("a");
//     link.download = "polaroidish-strip.png";
//     link.href = finalCanvas.toDataURL("image/png");
//     link.click();

//     showMessage("Downloaded!");
//   }

//   // When user selects template and wants to open camera
//   function chooseTemplateFrames(frames, layoutChoice = layout) {
//     setTotalFrames(frames);
//     setLayout(layoutChoice);
//     setPhotosTaken([]);
//     setStep("capture");
//   }

//   const layoutOptionsForFrames = () => ["horizontal", "vertical"];

//   // -------------------------
//   // JSX UI - full screen + responsive
//   // -------------------------
//   return (
//     <div
//       className="app-root"
//       style={{
//         width: "100vw",
//         height: "100vh",
//         display: "flex",
//         alignItems: "stretch",
//         justifyContent: "stretch",
//         background: "#fceb96",
//       }}
//     >
//       <style>{`
//         /* container (desktop grid: main + sidebar) */
//         .polaroid-shell {
//           margin: auto;
//           width: 96vw;
//           height: 94vh;
//           display: grid;
//           grid-template-columns: 1fr 360px;
//           gap: 18px;
//           align-items: stretch;
//           box-sizing: border-box;
//           padding: 18px;
//         }

//         /* tablet / mobile: stack vertically, sidebar bottom */
//         @media (max-width: 1024px) {
//           .polaroid-shell {
//             grid-template-columns: 1fr;
//             grid-template-rows: 1fr auto;
//             height: 96vh;
//             padding: 12px;
//           }
//         }

//         .panel {
//           background-color: #1a1a1a;
//           border-radius: 14px;
//           box-shadow: 0 8px 30px rgba(0,0,0,0.25);
//           border: 1px solid #3a3a3a;
//           color: white;
//           overflow: hidden;
//           display: flex;
//           flex-direction: column;
//         }

//         .main-scroll {
//           padding: 18px;
//           overflow: auto;
//           display: flex;
//           flex-direction: column;
//           gap: 14px;
//         }

//         .sidebar {
//           padding: 14px;
//           overflow: auto;
//         }

//         .webcam-wrap {
//           flex: 1 1 auto;
//           border-radius: 10px;
//           overflow: hidden;
//           position: relative;
//           background: #000;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .webcam-video {
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//         }

//         .capture-counter {
//           position: absolute;
//           left: 50%;
//           top: 10%;
//           transform: translateX(-50%);
//           z-index: 30;
//           display:flex;
//           flex-direction:column;
//           align-items:center;
//           justify-content:center;
//           pointer-events:none;
//         }
//         .counter-circle {
//           width:110px;
//           height:110px;
//           border-radius:9999px;
//           border:4px solid rgba(255,222,89,0.95);
//           display:flex;
//           align-items:center;
//           justify-content:center;
//           background: rgba(26,26,26,0.6);
//         }
//         .counter-big { font-size:34px; font-weight:800; color:#ffde59; }
//         .camera-flash {
//           position:absolute;
//           left:0; top:0; right:0; bottom:0; z-index:40; pointer-events:none;
//           background: white; opacity:0; transition: opacity 120ms linear;
//         }
//         .camera-flash.show { opacity:0.85; transition: opacity 120ms linear; }

//         .controls-row { display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap; }

//         /* message box */
//         #messageBox {
//           visibility:hidden;
//           min-width:220px;
//           background-color:#1a1a1a;
//           color:#ffde59;
//           text-align:center;
//           border-radius:8px;
//           padding:10px;
//           position:fixed;
//           z-index:120;
//           left:50%;
//           top:18px;
//           transform: translateX(-50%);
//           opacity:0;
//           transition: opacity 0.22s, top 0.22s;
//           border:1px solid #3a3a3a;
//         }
//         #messageBox.show { visibility:visible; opacity:1; top:18px; }

//         /* responsive small tweaks */
//         @media (max-width:640px) {
//           .counter-circle { width:88px; height:88px; }
//           .counter-big { font-size:26px; }
//         }
//       `}</style>

//       <div className="polaroid-shell">
//         {/* MAIN PANEL */}
//         <div className="panel">
//           <div style={{ padding: 18 }}>
//             <div style={{ textAlign: "center", marginBottom: 8 }}>
//               <h1
//                 style={{
//                   color: "#ffde59",
//                   margin: 0,
//                   fontWeight: 300,
//                   letterSpacing: 2,
//                   fontSize: 28,
//                 }}
//               >
//                 Polaroidish
//               </h1>
//               <div style={{ color: "#cfd4d8", fontSize: 13, marginTop: 6 }}>
//                 Capture flow — full screen & responsive
//               </div>
//             </div>
//           </div>

//           <div className="main-scroll">
//             {/* START */}
//             {step === "start" && (
//               <div
//                 style={{ background: "#111", padding: 18, borderRadius: 10 }}
//               >
//                 <h2 style={{ color: "#e6e6e6", margin: 0 }}>Welcome</h2>
//                 <p style={{ color: "#9aa0a6", marginTop: 6 }}>
//                   Click Get Started to create a photo strip.
//                 </p>
//                 <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
//                   <button
//                     onClick={() => setStep("select")}
//                     className="button start-btn"
//                     style={btnPrimary}
//                   >
//                     Get Started
//                   </button>
//                   <button
//                     onClick={resetApp}
//                     className="button reset-btn"
//                     style={btnSecondary}
//                   >
//                     Reset
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* SELECT */}
//             {step === "select" && (
//               <div
//                 style={{ background: "#111", padding: 18, borderRadius: 10 }}
//               >
//                 <h2 style={{ color: "#e6e6e6", margin: 0 }}>Select Frame</h2>
//                 <p style={{ color: "#9aa0a6", marginTop: 6 }}>
//                   Choose frames and layout
//                 </p>

//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
//                     gap: 12,
//                     marginTop: 12,
//                   }}
//                 >
//                   {templates.map((t) => (
//                     <div
//                       key={t.id}
//                       style={{
//                         padding: 12,
//                         borderRadius: 8,
//                         background: "#0f0f0f",
//                         border: "1px solid #333",
//                       }}
//                     >
//                       <div style={{ color: "#ffd95a", fontWeight: 700 }}>
//                         {t.label}
//                       </div>
//                       <div style={{ color: "#a8aeb3", fontSize: 13 }}>
//                         {t.frames} frames • {t.layout}
//                       </div>
//                       <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
//                         <button
//                           onClick={() =>
//                             chooseTemplateFrames(t.frames, t.layout)
//                           }
//                           style={btnPrimary}
//                         >
//                           Use
//                         </button>
//                         <button
//                           onClick={() => {
//                             setTotalFrames(t.frames);
//                             setLayout(t.layout);
//                             setPhotosTaken([]);
//                             showMessage(`${t.frames} frames selected`);
//                           }}
//                           style={btnSecondary}
//                         >
//                           Select
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div
//                   style={{
//                     marginTop: 12,
//                     display: "flex",
//                     gap: 12,
//                     alignItems: "center",
//                   }}
//                 >
//                   <label style={{ color: "#c6ccd0" }}>Frames:</label>
//                   <select
//                     value={totalFrames}
//                     onChange={(e) => {
//                       const v = parseInt(e.target.value, 10);
//                       setTotalFrames(v);
//                       setPhotosTaken([]);
//                     }}
//                     style={selectStyle}
//                   >
//                     <option value={4}>4</option>
//                     <option value={6}>6</option>
//                     <option value={8}>8</option>
//                   </select>

//                   <label style={{ color: "#c6ccd0", marginLeft: 8 }}>
//                     Layout:
//                   </label>
//                   <select
//                     value={layout}
//                     onChange={(e) => setLayout(e.target.value)}
//                     style={selectStyle}
//                   >
//                     {layoutOptionsForFrames().map((opt) => (
//                       <option key={opt} value={opt}>
//                         {opt}
//                       </option>
//                     ))}
//                   </select>

//                   <div style={{ marginLeft: "auto" }}>
//                     <button
//                       onClick={() => chooseTemplateFrames(totalFrames, layout)}
//                       style={btnPrimary}
//                     >
//                       Next: Open Camera
//                     </button>
//                   </div>
//                 </div>

//                 <div
//                   style={{
//                     marginTop: 12,
//                     display: "flex",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <button onClick={() => setStep("start")} style={btnSecondary}>
//                     Back
//                   </button>
//                   <div style={{ color: "#9aa0a6" }}>
//                     Photos to capture: {totalFrames}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* CAPTURE */}
//             {step === "capture" && (
//               <div
//                 style={{ display: "flex", flexDirection: "column", gap: 12 }}
//               >
//                 <div className="webcam-wrap" style={{ minHeight: 360 }}>
//                   <video
//                     ref={videoRef}
//                     className="webcam-video"
//                     playsInline
//                     autoPlay
//                     muted
//                     style={{ filter: computedVideoFilter() }}
//                   />
//                   <div className={`camera-flash ${flash ? "show" : ""}`} />

//                   <div
//                     className="capture-counter"
//                     role="status"
//                     aria-live="polite"
//                   >
//                     <div className="counter-circle">
//                       <div className="counter-big">
//                         {Math.min(photosTaken.length + 1, totalFrames)}
//                       </div>
//                     </div>
//                     <div style={{ color: "#ffeaa3", marginTop: 6 }}>
//                       of {totalFrames}
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "center",
//                     gap: 12,
//                     flexWrap: "wrap",
//                   }}
//                   className="controls-row"
//                 >
//                   <button
//                     onClick={capturePhoto}
//                     disabled={
//                       !webcamStarted || photosTaken.length >= totalFrames
//                     }
//                     style={
//                       photosTaken.length >= totalFrames || !webcamStarted
//                         ? btnDisabled
//                         : btnShutter
//                     }
//                   >
//                     {photosTaken.length >= totalFrames ? "Done" : "Take Photo"}
//                   </button>

//                   <button
//                     onClick={() => {
//                       stopWebcam();
//                       setStep("select");
//                     }}
//                     style={btnSecondary}
//                   >
//                     Back to Select
//                   </button>

//                   <button
//                     onClick={() => {
//                       stopWebcam();
//                       setStep("preview");
//                     }}
//                     disabled={photosTaken.length === 0}
//                     style={photosTaken.length === 0 ? btnDisabled : btnPrimary}
//                   >
//                     Preview
//                   </button>
//                 </div>

//                 <div style={{ color: "#9aa0a6", textAlign: "center" }}>
//                   Captured: {photosTaken.length} / {totalFrames} • Press Space
//                   to capture
//                 </div>
//               </div>
//             )}

//             {/* PREVIEW */}
//             {step === "preview" && (
//               <div
//                 style={{ display: "flex", flexDirection: "column", gap: 12 }}
//               >
//                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                   <h2 style={{ margin: 0, color: "#e6e6e6" }}>
//                     Result / Preview
//                   </h2>
//                   <div
//                     style={{
//                       marginLeft: "auto",
//                       color: "#9aa0a6",
//                       fontSize: 13,
//                     }}
//                   >
//                     Final view (matches downloaded strip)
//                   </div>
//                 </div>

//                 {/* composed preview (bgColor + padding + gap) */}
//                 <div style={{ padding: 6 }}>
//                   {(() => {
//                     const usingLayout = layouts[layout][totalFrames];
//                     if (!usingLayout)
//                       return (
//                         <div style={{ color: "#9aa0a6" }}>Invalid layout</div>
//                       );
//                     // compute aspect-ratio box
//                     const aspect = `${usingLayout.finalWidth} / ${usingLayout.finalHeight}`;
//                     return (
//                       <div
//                         style={{
//                           width: "100%",
//                           maxHeight: "64vh",
//                           display: "flex",
//                           justifyContent: "center",
//                         }}
//                       >
//                         <div
//                           style={{
//                             width: "100%",
//                             maxWidth: 1000,
//                             aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
//                             backgroundColor: bgColor,
//                             padding: usingLayout.topBorder,
//                             boxSizing: "border-box",
//                             borderRadius: 10,
//                             overflow: "hidden",
//                             border: "1px solid rgba(255,255,255,0.04)",
//                           }}
//                         >
//                           <div
//                             style={{
//                               display: "grid",
//                               gridTemplateColumns: `repeat(${usingLayout.numCols}, 1fr)`,
//                               gridAutoRows: "1fr",
//                               gap: usingLayout.gap,
//                               width: "100%",
//                               height: "100%",
//                             }}
//                           >
//                             {Array.from({ length: totalFrames }).map((_, i) => {
//                               const src = photosTaken[i]
//                                 ? photosTaken[i].filtered || photosTaken[i].raw
//                                 : null;
//                               return (
//                                 <div
//                                   key={i}
//                                   style={{
//                                     width: "100%",
//                                     height: "100%",
//                                     backgroundColor: "#222",
//                                     borderRadius: 6,
//                                     overflow: "hidden",
//                                   }}
//                                 >
//                                   {src ? (
//                                     <div
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         backgroundImage: `url(${src})`,
//                                         backgroundSize: "cover",
//                                         backgroundPosition: "center",
//                                       }}
//                                     />
//                                   ) : (
//                                     <div
//                                       style={{
//                                         width: "100%",
//                                         height: "100%",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                         color: "#9aa0a6",
//                                       }}
//                                     >
//                                       Empty
//                                     </div>
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })()}
//                 </div>

//                 <div
//                   style={{
//                     display: "flex",
//                     gap: 10,
//                     alignItems: "center",
//                     flexWrap: "wrap",
//                   }}
//                 >
//                   <button onClick={downloadStrip} style={btnPrimary}>
//                     Download Photo Strip
//                   </button>
//                   <button
//                     onClick={() => {
//                       setPhotosTaken([]);
//                       setStep("capture");
//                     }}
//                     style={btnSecondary}
//                   >
//                     Retake
//                   </button>
//                   <button onClick={resetApp} style={btnSecondary}>
//                     Start Over
//                   </button>

//                   <div
//                     style={{
//                       marginLeft: "auto",
//                       display: "flex",
//                       gap: 8,
//                       alignItems: "center",
//                     }}
//                   >
//                     <label style={{ color: "#9aa0a6" }}>Filter:</label>
//                     <select
//                       value={filter}
//                       onChange={(e) => setFilter(e.target.value)}
//                       style={selectStyle}
//                     >
//                       <option value="none">None</option>
//                       <option value="grayscale">Grayscale</option>
//                       <option value="sepia">Sepia</option>
//                       <option value="invert">Invert</option>
//                       <option value="saturate">Saturate</option>
//                       <option value="contrast">Contrast</option>
//                       <option value="hue-rotate">Hue Rotate</option>
//                       <option value="vintage">Vintage</option>
//                       <option value="blur">Blur</option>
//                       <option value="noir">Noir</option>
//                     </select>

//                     <button onClick={applyFilterToAll} style={btnPrimary}>
//                       Apply filter to all
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* SIDEBAR / CONTROLS (desktop right, bottom on mobile) */}
//         <div className="panel sidebar">
//           {step === "preview" ? (
//             <>
//               <div style={{ marginBottom: 10 }}>
//                 <h3 style={{ margin: 0, color: "#e6e6e6" }}>Controls</h3>
//                 <div style={{ color: "#9aa0a6", fontSize: 13, marginTop: 6 }}>
//                   These affect the final preview & download
//                 </div>
//               </div>

//               <div style={{ marginBottom: 12 }}>
//                 <label
//                   style={{
//                     color: "#c6ccd0",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Background
//                 </label>
//                 <input
//                   type="color"
//                   value={bgColor}
//                   onChange={(e) => setBgColor(e.target.value)}
//                   style={{
//                     width: "100%",
//                     height: 40,
//                     borderRadius: 8,
//                     border: "none",
//                     padding: 6,
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: 12 }}>
//                 <label
//                   style={{
//                     color: "#c6ccd0",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Frames
//                 </label>
//                 <select
//                   value={totalFrames}
//                   onChange={(e) => {
//                     const v = parseInt(e.target.value, 10);
//                     setTotalFrames(v);
//                     setPhotosTaken([]);
//                   }}
//                   style={selectStyle}
//                 >
//                   <option value={4}>4</option>
//                   <option value={6}>6</option>
//                   <option value={8}>8</option>
//                 </select>
//               </div>

//               <div style={{ marginTop: 6 }}>
//                 <h4 style={{ color: "#e6e6e6", marginBottom: 8 }}>
//                   Strip Preview
//                 </h4>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(2, 1fr)",
//                     gap: 8,
//                   }}
//                 >
//                   {Array.from({ length: totalFrames }).map((_, i) => {
//                     const src = photosTaken[i]
//                       ? photosTaken[i].filtered || photosTaken[i].raw
//                       : null;
//                     return (
//                       <div
//                         key={i}
//                         style={{
//                           height: 72,
//                           borderRadius: 8,
//                           overflow: "hidden",
//                           backgroundColor: bgColor,
//                           padding: 6,
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                         }}
//                       >
//                         {src ? (
//                           <div
//                             style={{
//                               width: "100%",
//                               height: "100%",
//                               backgroundImage: `url(${src})`,
//                               backgroundSize: "cover",
//                               backgroundPosition: "center",
//                               borderRadius: 6,
//                             }}
//                           />
//                         ) : (
//                           <div style={{ color: "#9aa0a6" }}>#{i + 1}</div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </>
//           ) : (
//             <>
//               <div style={{ marginBottom: 8 }}>
//                 <h3 style={{ margin: 0, color: "#e6e6e6" }}>Quick Controls</h3>
//                 <div style={{ color: "#9aa0a6", fontSize: 13 }}>
//                   Open camera and set options
//                 </div>
//               </div>

//               <div style={{ marginBottom: 12 }}>
//                 <label
//                   style={{
//                     color: "#c6ccd0",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Filter (preview)
//                 </label>
//                 <select
//                   value={filter}
//                   onChange={(e) => setFilter(e.target.value)}
//                   style={selectStyle}
//                 >
//                   <option value="none">None</option>
//                   <option value="grayscale">Grayscale</option>
//                   <option value="sepia">Sepia</option>
//                   <option value="invert">Invert</option>
//                   <option value="saturate">Saturate</option>
//                   <option value="contrast">Contrast</option>
//                   <option value="hue-rotate">Hue Rotate</option>
//                   <option value="vintage">Vintage</option>
//                   <option value="blur">Blur</option>
//                   <option value="noir">Noir</option>
//                 </select>
//                 <div style={{ color: "#9aa0a6", fontSize: 12, marginTop: 6 }}>
//                   Changing filter here will affect the live camera preview.
//                 </div>
//               </div>

//               <div style={{ marginBottom: 12 }}>
//                 <label
//                   style={{
//                     color: "#c6ccd0",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Background
//                 </label>
//                 <input
//                   type="color"
//                   value={bgColor}
//                   onChange={(e) => setBgColor(e.target.value)}
//                   style={{
//                     width: "100%",
//                     height: 40,
//                     borderRadius: 8,
//                     border: "none",
//                     padding: 6,
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: 12 }}>
//                 <label
//                   style={{
//                     color: "#c6ccd0",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Frames
//                 </label>
//                 <select
//                   value={totalFrames}
//                   onChange={(e) => {
//                     const v = parseInt(e.target.value, 10);
//                     setTotalFrames(v);
//                     setPhotosTaken([]);
//                   }}
//                   style={selectStyle}
//                 >
//                   <option value={4}>4</option>
//                   <option value={6}>6</option>
//                   <option value={8}>8</option>
//                 </select>
//               </div>

//               <div style={{ display: "flex", gap: 8 }}>
//                 <button
//                   onClick={() => {
//                     if (step !== "capture") setStep("capture");
//                     setTimeout(() => startWebcam(), 50);
//                   }}
//                   style={btnPrimary}
//                 >
//                   Open Camera
//                 </button>
//                 <button onClick={resetApp} style={btnSecondary}>
//                   Reset
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* message box */}
//       <div
//         id="messageBox"
//         className={messageVisible ? "show" : ""}
//         style={{ zIndex: 200 }}
//       >
//         {message}
//       </div>

//       {/* Hidden processing canvases - ALWAYS mounted so preview filters work */}
//       <canvas ref={rawCanvasRef} style={{ display: "none" }} />
//       <canvas ref={filterCanvasRef} style={{ display: "none" }} />
//     </div>
//   );
// }

// /* ===== Styles used inline above (so JS linter won't complain about missing vars) ===== */
// const btnPrimary = {
//   background: "#ffde59",
//   color: "#1a1a1a",
//   border: "none",
//   padding: "8px 14px",
//   borderRadius: 999,
//   fontWeight: 700,
//   cursor: "pointer",
// };

// const btnSecondary = {
//   background: "#3f3f3f",
//   color: "#f5e9a5",
//   border: "none",
//   padding: "8px 12px",
//   borderRadius: 8,
//   cursor: "pointer",
// };

// const btnShutter = {
//   background: "#111",
//   color: "#ffde59",
//   border: "2px solid #ffde59",
//   padding: "10px 18px",
//   borderRadius: 999,
//   fontWeight: 800,
//   cursor: "pointer",
// };

// const btnDisabled = {
//   background: "#222",
//   color: "#777",
//   border: "2px solid #333",
//   padding: "10px 18px",
//   borderRadius: 999,
//   fontWeight: 800,
//   cursor: "not-allowed",
//   opacity: 0.55,
// };

// const selectStyle = {
//   background: "#111",
//   color: "#ffd95a",
//   border: "1px solid #333",
//   padding: "8px 10px",
//   borderRadius: 8,
// };

import React, { useEffect, useRef, useState } from "react";

/**
 * Polaroidish - full-screen, responsive single-file React component
 * Steps: start -> select -> capture -> preview
 *
 * NOTE: Quick Controls (Filter (preview), Background, Frames, Open Camera, Reset)
 * are now shown **ONLY** on the PREVIEW step, per your request.
 */

export default function Polaroidish() {
  // refs
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null); // used to capture raw frame
  const filterCanvasRef = useRef(null); // used to create filtered images
  const streamRef = useRef(null);

  // UI state
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [totalFrames, setTotalFrames] = useState(4);
  const [layout, setLayout] = useState("horizontal");
  const [filter, setFilter] = useState("none");
  const [bgColor, setBgColor] = useState("#1a1a1a");

  // photosTaken: array of { raw: dataUrl, filtered: dataUrl }
  const [photosTaken, setPhotosTaken] = useState([]);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState("start"); // 'start'|'select'|'capture'|'preview'
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);

  const BORDER_SIZE = 20;
  const GAP_SIZE = 20;

  const layouts = {
    vertical: {
      4: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 2,
        photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
      6: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 3,
        photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
      8: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 4,
        photoWidth: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        photoHeight: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
    },
    horizontal: {
      4: {
        finalWidth: 1800,
        finalHeight: 1200,
        numCols: 2,
        numRows: 2,
        photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
      6: {
        finalWidth: 1800,
        finalHeight: 1200,
        numCols: 3,
        numRows: 2,
        photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 2) / 3,
        photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
      8: {
        finalWidth: 1800,
        finalHeight: 1200,
        numCols: 4,
        numRows: 2,
        photoWidth: (1800 - BORDER_SIZE * 2 - GAP_SIZE * 3) / 4,
        photoHeight: (1200 - BORDER_SIZE * 2 - GAP_SIZE * 1) / 2,
        sideBorder: BORDER_SIZE,
        topBorder: BORDER_SIZE,
        gap: GAP_SIZE,
      },
    },
  };

  const templates = [
    { id: "4h", label: "4-up (Horizontal)", frames: 4, layout: "horizontal" },
    { id: "6v", label: "6-up (Vertical)", frames: 6, layout: "vertical" },
    { id: "8h", label: "8-up (Horizontal)", frames: 8, layout: "horizontal" },
  ];

  // Helpers
  function showMessage(msg, ms = 1800) {
    setMessage(msg);
    setMessageVisible(true);
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => setMessageVisible(false), ms);
  }

  function resetApp() {
    stopWebcam();
    setPhotosTaken([]);
    setFilter("none");
    setLayout("horizontal");
    setTotalFrames(4);
    setStep("start");
    showMessage("Reset. Click Get Started.");
  }

  // access webcam
  async function startWebcam() {
    if (webcamStarted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamStarted(true);
      showMessage("Webcam started — press Space or click Take");
    } catch (err) {
      console.error("Error accessing webcam", err);
      showMessage("Cannot access webcam. Allow camera permissions and retry.");
    }
  }

  function stopWebcam() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setWebcamStarted(false);
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(autoAdvanceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When entering capture step, start webcam
  useEffect(() => {
    if (step === "capture") {
      setPhotosTaken([]); // fresh round
      setTimeout(() => startWebcam(), 150);
    } else {
      // stop webcam while not capturing
      stopWebcam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // auto-apply filter on preview when filter changed (nice UX)
  useEffect(() => {
    if (step === "preview" && photosTaken.length > 0) {
      const t = setTimeout(() => {
        applyFilterToAll();
      }, 120);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, step]);

  // keyboard: Space to capture while in capture step
  useEffect(() => {
    function onKey(e) {
      if (step !== "capture") return;
      if (e.code === "Space") {
        e.preventDefault();
        capturePhoto();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, photosTaken, filter, webcamStarted]);

  // derive computed video CSS filter from filter name
  function computedVideoFilter() {
    switch (filter) {
      case "grayscale":
        return "grayscale(100%)";
      case "sepia":
        return "sepia(100%)";
      case "invert":
        return "invert(100%)";
      case "saturate":
        return "saturate(200%)";
      case "contrast":
        return "contrast(200%)";
      case "hue-rotate":
        return "hue-rotate(90deg)";
      case "vintage":
        return "sepia(50%) saturate(150%) brightness(120%)";
      case "blur":
        return "blur(3px)";
      case "noir":
        return "grayscale(100%) contrast(140%) brightness(90%)";
      default:
        return "none";
    }
  }

  // map filter to canvas CSS filter string (same as above)
  function canvasFilterString(name) {
    switch (name) {
      case "grayscale":
        return "grayscale(100%)";
      case "sepia":
        return "sepia(100%)";
      case "invert":
        return "invert(100%)";
      case "saturate":
        return "saturate(200%)";
      case "contrast":
        return "contrast(200%)";
      case "hue-rotate":
        return "hue-rotate(90deg)";
      case "vintage":
        return "sepia(50%) saturate(150%) brightness(120%)";
      case "blur":
        return "blur(3px)";
      case "noir":
        return "grayscale(100%) contrast(140%) brightness(90%)";
      default:
        return "none";
    }
  }

  // utility: center-crop draw
  function drawImageCover(ctx, img, canvasWidth, canvasHeight, x = 0, y = 0) {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasWidth / canvasHeight;

    let sourceX = 0,
      sourceY = 0,
      sourceWidth = img.width,
      sourceHeight = img.height;

    if (imgRatio > canvasRatio) {
      sourceWidth = img.height * canvasRatio;
      sourceX = (img.width - sourceWidth) / 2;
    } else {
      sourceHeight = img.width / canvasRatio;
      sourceY = (img.height - sourceHeight) / 2;
    }

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      canvasWidth,
      canvasHeight
    );
  }

  // capture current frame: store raw + filtered
  async function capturePhoto() {
    if (!webcamStarted || !videoRef.current) {
      showMessage("Camera not started");
      return;
    }
    if (photosTaken.length >= totalFrames) {
      showMessage("All frames captured");
      return;
    }

    const v = videoRef.current;
    const rawCanvas = rawCanvasRef.current || document.createElement("canvas");
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    rawCanvas.width = w;
    rawCanvas.height = h;
    const rawCtx = rawCanvas.getContext("2d");
    rawCtx.filter = "none";
    rawCtx.drawImage(v, 0, 0, w, h);
    const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

    // create filtered version
    const filteredData = await makeFilteredDataUrl(rawData, filter, w, h);

    // small flash
    setFlash(true);
    setTimeout(() => setFlash(false), 140);

    setPhotosTaken((prev) => {
      const next = [...prev, { raw: rawData, filtered: filteredData }];
      showMessage(`Captured ${next.length} of ${totalFrames}`);
      if (next.length >= totalFrames) {
        clearTimeout(autoAdvanceTimer);
        const t = setTimeout(() => {
          stopWebcam();
          setStep("preview");
        }, 400);
        setAutoAdvanceTimer(t);
      }
      return next;
    });
  }

  // make filtered data url with safe fallback (temp canvas if ref missing)
  function makeFilteredDataUrl(
    rawDataUrl,
    filterName,
    canvasW = 1280,
    canvasH = 720
  ) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let c = filterCanvasRef.current;
        let created = false;
        if (!c) {
          c = document.createElement("canvas");
          created = true;
        }
        c.width = canvasW;
        c.height = canvasH;
        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.filter = canvasFilterString(filterName);
        drawImageCover(ctx, img, c.width, c.height, 0, 0);
        const out = c.toDataURL("image/jpeg", 0.95);
        resolve(out);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  }

  // apply currently selected filter to all raw images (in preview)
  async function applyFilterToAll() {
    if (photosTaken.length === 0) {
      showMessage("No photos to apply filter to");
      return;
    }
    showMessage("Applying filter...");
    const results = await Promise.all(
      photosTaken.map((p) => makeFilteredDataUrl(p.raw, filter))
    );
    const next = photosTaken.map((p, i) => ({
      raw: p.raw,
      filtered: results[i],
    }));
    setPhotosTaken(next);
    showMessage("Filter applied");
  }

  // download composed strip
  async function downloadStrip() {
    const usingLayout = layouts[layout][totalFrames];
    if (!usingLayout) {
      showMessage("Invalid layout configuration.");
      return;
    }

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = usingLayout.finalWidth;
    finalCanvas.height = usingLayout.finalHeight;
    const ctx = finalCanvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    const images = photosTaken
      .slice(0, totalFrames)
      .map((p) => p.filtered || p.raw);
    if (images.length === 0) {
      showMessage("No photos available to download.");
      return;
    }

    await Promise.all(
      images.map(
        (src, index) =>
          new Promise((res) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const numCols = usingLayout.numCols;
              const column = index % numCols;
              const row = Math.floor(index / numCols);
              const x =
                usingLayout.sideBorder +
                column * (usingLayout.photoWidth + usingLayout.gap);
              const y =
                usingLayout.topBorder +
                row * (usingLayout.photoHeight + usingLayout.gap);
              drawImageCover(
                ctx,
                img,
                usingLayout.photoWidth,
                usingLayout.photoHeight,
                x,
                y
              );
              res(true);
            };
            img.onerror = () => res(true);
            img.src = src;
          })
      )
    );

    const link = document.createElement("a");
    link.download = "polaroidish-strip.png";
    link.href = finalCanvas.toDataURL("image/png");
    link.click();

    showMessage("Downloaded!");
  }

  // When user selects template and wants to open camera
  function chooseTemplateFrames(frames, layoutChoice = layout) {
    setTotalFrames(frames);
    setLayout(layoutChoice);
    setPhotosTaken([]);
    setStep("capture");
  }

  const layoutOptionsForFrames = () => ["horizontal", "vertical"];

  // -------------------------
  // JSX UI - full screen + responsive
  // -------------------------
  return (
    <div
      className="app-root"
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
        background: "#fceb96",
      }}
    >
      <style>{`
        /* container (desktop grid: main + sidebar) */
        .polaroid-shell {
          margin: auto;
          width: 96vw;
          height: 94vh;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 18px;
          align-items: stretch;
          box-sizing: border-box;
          padding: 18px;
        }

        /* tablet / mobile: stack vertically, sidebar bottom */
        @media (max-width: 1024px) {
          .polaroid-shell {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto;
            height: 96vh;
            padding: 12px;
          }
        }

        .panel {
          background-color: #1a1a1a;
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          border: 1px solid #3a3a3a;
          color: white;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .main-scroll {
          padding: 18px;
          overflow: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sidebar {
          padding: 14px;
          overflow: auto;
        }

        .webcam-wrap {
          flex: 1 1 auto;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .webcam-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .capture-counter {
          position: absolute;
          left: 50%;
          top: 10%;
          transform: translateX(-50%);
          z-index: 30;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          pointer-events:none;
        }
        .counter-circle {
          width:110px;
          height:110px;
          border-radius:9999px;
          border:4px solid rgba(255,222,89,0.95);
          display:flex;
          align-items:center;
          justify-content:center;
          background: rgba(26,26,26,0.6);
        }
        .counter-big { font-size:34px; font-weight:800; color:#ffde59; }
        .camera-flash {
          position:absolute;
          left:0; top:0; right:0; bottom:0; z-index:40; pointer-events:none;
          background: white; opacity:0; transition: opacity 120ms linear;
        }
        .camera-flash.show { opacity:0.85; transition: opacity 120ms linear; }

        .controls-row { display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap; }

        /* message box */
        #messageBox {
          visibility:hidden;
          min-width:220px;
          background-color:#1a1a1a;
          color:#ffde59;
          text-align:center;
          border-radius:8px;
          padding:10px;
          position:fixed;
          z-index:120;
          left:50%;
          top:18px;
          transform: translateX(-50%);
          opacity:0;
          transition: opacity 0.22s, top 0.22s;
          border:1px solid #3a3a3a;
        }
        #messageBox.show { visibility:visible; opacity:1; top:18px; }

        /* responsive small tweaks */
        @media (max-width:640px) {
          .counter-circle { width:88px; height:88px; }
          .counter-big { font-size:26px; }
        }
      `}</style>

      <div className="polaroid-shell">
        {/* MAIN PANEL */}
        <div className="panel">
          <div style={{ padding: 18 }}>
            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <h1
                style={{
                  color: "#ffde59",
                  margin: 0,
                  fontWeight: 300,
                  letterSpacing: 2,
                  fontSize: 28,
                }}
              >
                Polaroidish
              </h1>
              <div style={{ color: "#cfd4d8", fontSize: 13, marginTop: 6 }}>
                Capture flow — full screen & responsive
              </div>
            </div>
          </div>

          <div className="main-scroll">
            {/* START */}
            {step === "start" && (
              <div
                style={{ background: "#111", padding: 18, borderRadius: 10 }}
              >
                <h2 style={{ color: "#e6e6e6", margin: 0 }}>Welcome</h2>
                <p style={{ color: "#9aa0a6", marginTop: 6 }}>
                  Click Get Started to create a photo strip.
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setStep("select")}
                    className="button start-btn"
                    style={btnPrimary}
                  >
                    Get Started
                  </button>
                  <button
                    onClick={resetApp}
                    className="button reset-btn"
                    style={btnSecondary}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* SELECT */}
            {step === "select" && (
              <div
                style={{ background: "#111", padding: 18, borderRadius: 10 }}
              >
                <h2 style={{ color: "#e6e6e6", margin: 0 }}>Select Frame</h2>
                <p style={{ color: "#9aa0a6", marginTop: 6 }}>
                  Choose frames and layout
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        background: "#0f0f0f",
                        border: "1px solid #333",
                      }}
                    >
                      <div style={{ color: "#ffd95a", fontWeight: 700 }}>
                        {t.label}
                      </div>
                      <div style={{ color: "#a8aeb3", fontSize: 13 }}>
                        {t.frames} frames • {t.layout}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <button
                          onClick={() =>
                            chooseTemplateFrames(t.frames, t.layout)
                          }
                          style={btnPrimary}
                        >
                          Use
                        </button>
                        <button
                          onClick={() => {
                            setTotalFrames(t.frames);
                            setLayout(t.layout);
                            setPhotosTaken([]);
                            showMessage(`${t.frames} frames selected`);
                          }}
                          style={btnSecondary}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <label style={{ color: "#c6ccd0" }}>Frames:</label>
                  <select
                    value={totalFrames}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setTotalFrames(v);
                      setPhotosTaken([]);
                    }}
                    style={selectStyle}
                  >
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>

                  <label style={{ color: "#c6ccd0", marginLeft: 8 }}>
                    Layout:
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    style={selectStyle}
                  >
                    {layoutOptionsForFrames().map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <div style={{ marginLeft: "auto" }}>
                    <button
                      onClick={() => chooseTemplateFrames(totalFrames, layout)}
                      style={btnPrimary}
                    >
                      Next: Open Camera
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <button onClick={() => setStep("start")} style={btnSecondary}>
                    Back
                  </button>
                  <div style={{ color: "#9aa0a6" }}>
                    Photos to capture: {totalFrames}
                  </div>
                </div>
              </div>
            )}

            {/* CAPTURE */}
            {step === "capture" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div className="webcam-wrap" style={{ minHeight: 360 }}>
                  <video
                    ref={videoRef}
                    className="webcam-video"
                    playsInline
                    autoPlay
                    muted
                    style={{ filter: computedVideoFilter() }}
                  />
                  <div className={`camera-flash ${flash ? "show" : ""}`} />

                  <div
                    className="capture-counter"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="counter-circle">
                      <div className="counter-big">
                        {Math.min(photosTaken.length + 1, totalFrames)}
                      </div>
                    </div>
                    <div style={{ color: "#ffeaa3", marginTop: 6 }}>
                      of {totalFrames}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                  className="controls-row"
                >
                  <button
                    onClick={capturePhoto}
                    disabled={
                      !webcamStarted || photosTaken.length >= totalFrames
                    }
                    style={
                      photosTaken.length >= totalFrames || !webcamStarted
                        ? btnDisabled
                        : btnShutter
                    }
                  >
                    {photosTaken.length >= totalFrames ? "Done" : "Take Photo"}
                  </button>

                  <button
                    onClick={() => {
                      stopWebcam();
                      setStep("select");
                    }}
                    style={btnSecondary}
                  >
                    Back to Select
                  </button>

                  <button
                    onClick={() => {
                      stopWebcam();
                      setStep("preview");
                    }}
                    disabled={photosTaken.length === 0}
                    style={photosTaken.length === 0 ? btnDisabled : btnPrimary}
                  >
                    Preview
                  </button>
                </div>

                <div style={{ color: "#9aa0a6", textAlign: "center" }}>
                  Captured: {photosTaken.length} / {totalFrames} • Press Space
                  to capture
                </div>
              </div>
            )}

            {/* PREVIEW */}
            {step === "preview" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ margin: 0, color: "#e6e6e6" }}>
                    Result / Preview
                  </h2>
                  <div
                    style={{
                      marginLeft: "auto",
                      color: "#9aa0a6",
                      fontSize: 13,
                    }}
                  >
                    Final view (matches downloaded strip)
                  </div>
                </div>

                {/* composed preview (bgColor + padding + gap) */}
                <div style={{ padding: 6 }}>
                  {(() => {
                    const usingLayout = layouts[layout][totalFrames];
                    if (!usingLayout)
                      return (
                        <div style={{ color: "#9aa0a6" }}>Invalid layout</div>
                      );
                    return (
                      <div
                        style={{
                          width: "100%",
                          maxHeight: "64vh",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 1000,
                            aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
                            backgroundColor: bgColor,
                            padding: usingLayout.topBorder,
                            boxSizing: "border-box",
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${usingLayout.numCols}, 1fr)`,
                              gridAutoRows: "1fr",
                              gap: usingLayout.gap,
                              width: "100%",
                              height: "100%",
                            }}
                          >
                            {Array.from({ length: totalFrames }).map((_, i) => {
                              const src = photosTaken[i]
                                ? photosTaken[i].filtered || photosTaken[i].raw
                                : null;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "#222",
                                    borderRadius: 6,
                                    overflow: "hidden",
                                  }}
                                >
                                  {src ? (
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundImage: `url(${src})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
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
                      </div>
                    );
                  })()}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button onClick={downloadStrip} style={btnPrimary}>
                    Download Photo Strip
                  </button>
                  <button
                    onClick={() => {
                      setPhotosTaken([]);
                      setStep("capture");
                    }}
                    style={btnSecondary}
                  >
                    Retake
                  </button>
                  <button onClick={resetApp} style={btnSecondary}>
                    Start Over
                  </button>

                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <label style={{ color: "#9aa0a6" }}>Filter:</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="none">None</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="invert">Invert</option>
                      <option value="saturate">Saturate</option>
                      <option value="contrast">Contrast</option>
                      <option value="hue-rotate">Hue Rotate</option>
                      <option value="vintage">Vintage</option>
                      <option value="blur">Blur</option>
                      <option value="noir">Noir</option>
                    </select>

                    <button onClick={applyFilterToAll} style={btnPrimary}>
                      Apply filter to all
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR / CONTROLS (desktop right, bottom on mobile)
            IMPORTANT: Quick Controls will be shown ONLY when step === "preview"
        */}
        <div className="panel sidebar">
          {step === "preview" ? (
            /* Quick Controls shown only on PREVIEW */
            <>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ margin: 0, color: "#e6e6e6" }}>Quick Controls</h3>
                <div style={{ color: "#9aa0a6", fontSize: 13 }}>
                  Open camera and set options
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    color: "#c6ccd0",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Filter (preview)
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={selectStyle}
                >
                  <option value="none">None</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="sepia">Sepia</option>
                  <option value="invert">Invert</option>
                  <option value="saturate">Saturate</option>
                  <option value="contrast">Contrast</option>
                  <option value="hue-rotate">Hue Rotate</option>
                  <option value="vintage">Vintage</option>
                  <option value="blur">Blur</option>
                  <option value="noir">Noir</option>
                </select>
                <div style={{ color: "#9aa0a6", fontSize: 12, marginTop: 6 }}>
                  Changing filter here will affect the live camera preview.
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    color: "#c6ccd0",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Background
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 8,
                    border: "none",
                    padding: 6,
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    color: "#c6ccd0",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Frames
                </label>
                <select
                  value={totalFrames}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setTotalFrames(v);
                    setPhotosTaken([]);
                  }}
                  style={selectStyle}
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    if (step !== "capture") setStep("capture");
                    setTimeout(() => startWebcam(), 50);
                  }}
                  style={btnPrimary}
                >
                  Open Camera
                </button>
                <button onClick={resetApp} style={btnSecondary}>
                  Reset
                </button>
              </div>
            </>
          ) : (
            /* When not preview, show nothing (sidebar empty) */
            <div style={{ padding: 12, color: "#9aa0a6", fontSize: 13 }}>
              {/* Empty intentionally — Quick Controls appear only on Preview */}
            </div>
          )}
        </div>
      </div>

      {/* message box */}
      <div
        id="messageBox"
        className={messageVisible ? "show" : ""}
        style={{ zIndex: 200 }}
      >
        {message}
      </div>

      {/* Hidden processing canvases - ALWAYS mounted so preview filters work */}
      <canvas ref={rawCanvasRef} style={{ display: "none" }} />
      <canvas ref={filterCanvasRef} style={{ display: "none" }} />
    </div>
  );
}

/* ===== Styles used inline above (so JS linter won't complain about missing vars) ===== */
const btnPrimary = {
  background: "#ffde59",
  color: "#1a1a1a",
  border: "none",
  padding: "8px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  background: "#3f3f3f",
  color: "#f5e9a5",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
};

const btnShutter = {
  background: "#111",
  color: "#ffde59",
  border: "2px solid #ffde59",
  padding: "10px 18px",
  borderRadius: 999,
  fontWeight: 800,
  cursor: "pointer",
};

const btnDisabled = {
  background: "#222",
  color: "#777",
  border: "2px solid #333",
  padding: "10px 18px",
  borderRadius: 999,
  fontWeight: 800,
  cursor: "not-allowed",
  opacity: 0.55,
};

const selectStyle = {
  background: "#111",
  color: "#ffd95a",
  border: "1px solid #333",
  padding: "8px 10px",
  borderRadius: 8,
};
