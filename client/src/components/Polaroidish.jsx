import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import StartScreen from "./StartScreen";
import TemplateSelection from "./TemplateSelection";
import CaptureScreen from "./CaptureScreen";
import PreviewScreen from "./PreviewScreen";
import PrintScreen from "./PrintScreen";
import MessageBox from "./MessageBox";
import { uploadWithTransform } from "../../utils/cloudinaryApi";

export default function Polaroidish() {
  // All refs, states, constants remain same as original
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null);
  const filterCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const lastAppliedFilterRef = useRef({ filter: null, photosCount: 0 });

  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [totalFrames, setTotalFrames] = useState(4);
  const [filter, setFilter] = useState("none");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [photosTaken, setPhotosTaken] = useState([]);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState("start");
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [showCaptureNumber, setShowCaptureNumber] = useState(null);
  const [photosToCapture, setPhotosToCapture] = useState(2);
  const [printCopies, setPrintCopies] = useState(2);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [manualCopies, setManualCopies] = useState(false);

  const COLORS = {
    PRIMARY_BLUE: "#528bad",
    LIGHT_BACKGROUND: "#dee3f6",
    DEEP_BLUE: "#0378b5",
    ACCENT_YELLOW: "#facc0b",
    LIGHT_GREY: "#f2f2f2",
    TEXT_BLACK: "#000000",
    BASE_WHITE: "#FFFFFF",
  };

  const PRESET_BG_COLORS = [
    { name: "White", value: COLORS.BASE_WHITE },
    { name: "Primary Blue", value: COLORS.PRIMARY_BLUE },
    { name: "Deep Blue", value: COLORS.DEEP_BLUE },
    { name: "Red", value: "#ff4b5c" },
    { name: "Pink", value: "#ffaeb2" },
    { name: "Yellow", value: COLORS.ACCENT_YELLOW },
    { name: "Light Blue", value: COLORS.LIGHT_BACKGROUND },
    { name: "Black", value: "#000000" },
  ];

  const ASPECT_PRESETS = {
    WIDE: 53 / 40,
    PORTRAIT: 53 / 76,
    SQUARE: 1 / 1,
  };

  const [selectedAspectRatio, setSelectedAspectRatio] = useState(
    ASPECT_PRESETS.PORTRAIT
  );

  const layouts = {
    vertical: {
      4: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 2,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 40) / 2,
      },
      6: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 3,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 60) / 3,
      },
      8: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 4,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 80) / 4,
      },
    },
  };

  const templates = [
    {
      id: "4v",
      label: "4 Photos (Portrait)",
      frames: 4,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.PORTRAIT,
    },
    {
      id: "6v",
      label: "6 Photos (Square)",
      frames: 6,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.SQUARE,
    },
    {
      id: "8v",
      label: "8 Photos (Wide)",
      frames: 8,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.WIDE,
    },
  ];

  // All helper functions remain same (showMessage, resetApp, startWebcam, etc.)
  function showMessage(msg, ms = 1800) {
    setMessage(msg);
    setMessageVisible(true);
    clearTimeout(showMessage._t);
    showMessage._t = setTimeout(() => setMessageVisible(false), ms);
  }

  function resetApp() {
    stopWebcam();
    clearSequenceTimer();
    setPhotosTaken([]);
    setFilter("none");
    setBgColor(COLORS.BASE_WHITE);
    setTotalFrames(4);
    setPrintCopies(2);
    setSelectedTemplate(null);
    setSelectedAspectRatio(ASPECT_PRESETS.PORTRAIT);
    setStep("start");
    setAutoCapturing(false);
    setShowCaptureNumber(null);
    lastAppliedFilterRef.current = { filter: null, photosCount: 0 };
    setSelectedRowIndex(null);
    setPhotosToCapture(2);
    // setManualCopies(false);
  }

  // All other functions (webcam, capture, filter logic, etc.) remain exactly same
  async function startWebcam() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: {
          facingMode: "user",
          aspectRatio: selectedAspectRatio || ASPECT_PRESETS.PORTRAIT,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamStarted(true);
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

  function clearSequenceTimer() {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }

  // useEffects remain same
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(autoAdvanceTimer);
      clearSequenceTimer();
    };
  }, []);

  useEffect(() => {
    if (step === "capture") {
      setPhotosTaken([]);
      setSelectedRowIndex(null);
      setTimeout(() => startWebcam(), 150);
    } else {
      stopWebcam();
      clearSequenceTimer();
      setAutoCapturing(false);
    }
  }, [step, selectedAspectRatio]);

  useEffect(() => {
    if (step !== "preview" || photosTaken.length === 0) return;

    if (
      lastAppliedFilterRef.current.filter === filter &&
      lastAppliedFilterRef.current.photosCount === photosTaken.length
    ) {
      return;
    }

    const t = setTimeout(() => {
      applyFilterToAll();
      lastAppliedFilterRef.current = {
        filter,
        photosCount: photosTaken.length,
      };
    }, 120);

    return () => clearTimeout(t);
  }, [filter, step, photosTaken.length]);

  // useEffect(() => {
  //   if (!selectedTemplate) return;

  //   setTotalFrames(selectedTemplate.frames);

  //   const layoutGroup = layouts[selectedTemplate.layout];
  //   if (layoutGroup && layoutGroup[selectedTemplate.frames]) {
  //     const usingLayout = layoutGroup[selectedTemplate.frames];

  //     setPhotosToCapture(usingLayout.numRows);
  //     setPrintCopies(usingLayout.numRows);

  //     if (usingLayout.photoWidth && usingLayout.photoHeight) {
  //       const aspect = usingLayout.photoWidth / usingLayout.photoHeight;
  //       setSelectedAspectRatio(aspect);
  //       return;
  //     }
  //   }

  //   if (selectedTemplate.aspectRatio) {
  //     setSelectedAspectRatio(selectedTemplate.aspectRatio);
  //   }
  // }, [selectedTemplate]);
  useEffect(() => {
    if (!selectedTemplate) return;

    setTotalFrames(selectedTemplate.frames);

    const layoutGroup = layouts[selectedTemplate.layout];
    if (layoutGroup && layoutGroup[selectedTemplate.frames]) {
      const usingLayout = layoutGroup[selectedTemplate.frames];

      setPhotosToCapture(usingLayout.numRows);

      // only auto-set copies if user hasn't chosen manual copies
      if (!manualCopies) {
        setPrintCopies(usingLayout.numRows);
      }

      if (usingLayout.photoWidth && usingLayout.photoHeight) {
        const aspect = usingLayout.photoWidth / usingLayout.photoHeight;
        setSelectedAspectRatio(aspect);
        return;
      }
    }

    if (selectedTemplate.aspectRatio) {
      setSelectedAspectRatio(selectedTemplate.aspectRatio);
    }
  }, [selectedTemplate, manualCopies]);

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
  }, [step, photosTaken, filter, webcamStarted, photosToCapture]);

  // Filter functions remain same
  function computedVideoFilter() {
    switch (filter) {
      case "burnt-coffee":
        return "contrast(80%) grayscale(100%) saturate(100%) hue-rotate(0deg) sepia(0%)";
      case "ocean-wave":
        return "brightness(105%) contrast(104%) grayscale(10%) sepia(50%)";
      case "old-wood":
        return "brightness(105%) contrast(102%) grayscale(50%) saturate(140%) sepia(9%)";
      case "vintage-may":
        return "brightness(105%) grayscale(100%) sepia(50%)";
      case "bw":
        return "grayscale(100%) contrast(105%)";
      default:
        return "none";
    }
  }

  function canvasFilterString(name) {
    switch (name) {
      case "burnt-coffee":
        return "contrast(80%) grayscale(100%) saturate(100%) hue-rotate(0deg) sepia(0%)";
      case "ocean-wave":
        return "brightness(105%) contrast(104%) grayscale(10%) sepia(50%)";
      case "old-wood":
        return "brightness(105%) contrast(102%) grayscale(50%) saturate(140%) sepia(9%)";
      case "vintage-may":
        return "brightness(105%) grayscale(100%) sepia(50%)";
      case "bw":
        return "grayscale(100%) contrast(105%)";
      default:
        return "none";
    }
  }

  function applyOverlayToCanvas(ctx, filterName, w, h) {
    if (!filterName || filterName === "none" || filterName === "bw") return;

    ctx.save();

    if (filterName === "burnt-coffee") {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "#e3dca1";
      ctx.fillRect(0, 0, w, h);
    } else if (filterName === "ocean-wave") {
      ctx.globalAlpha = 0.13;
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "#00e5fa";
      ctx.fillRect(0, 0, w, h);
    } else if (filterName === "old-wood") {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "soft-light";
      ctx.fillStyle = "#574400";
      ctx.fillRect(0, 0, w, h);
    } else if (filterName === "vintage-may") {
      ctx.globalAlpha = 0.13;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#faaa00";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  // All other utility functions remain same (buildFullSheetPayload, handleProceedToPrintWholeSheet,
  // computeVideoSourceRect, capturePhoto, makeFilteredDataUrl, drawImageContain,
  // drawImageCover, applyFilterToAll, getPhotosForFrames, downloadStrip,
  // handlePrint, startSequence, performSequenceStep, stopSequence)

  // [Copy all remaining functions from original code here]

  function computeVideoSourceRect(videoEl, displayW, displayH) {
    const vw = videoEl.videoWidth || 1;
    const vh = videoEl.videoHeight || 1;

    const displayRatio = displayW / displayH;
    const videoRatio = vw / vh;

    let sx = 0,
      sy = 0,
      sw = vw,
      sh = vh;

    if (videoRatio > displayRatio) {
      sw = Math.round(vh * displayRatio);
      sx = Math.round((vw - sw) / 2);
    } else {
      sh = Math.round(vw / displayRatio);
      sy = Math.round((vh - sh) / 2);
    }

    return { sx, sy, sw, sh };
  }

  async function capturePhoto() {
    if (!webcamStarted || !videoRef.current) {
      showMessage("Camera not started");
      return;
    }
    if (photosTaken.length >= photosToCapture) {
      showMessage("All required photos captured");
      return;
    }

    const v = videoRef.current;
    const rawCanvas = rawCanvasRef.current || document.createElement("canvas");
    const displayRect = v.getBoundingClientRect();

    const { sx, sy, sw, sh } = computeVideoSourceRect(
      v,
      displayRect.width,
      displayRect.height
    );

    rawCanvas.width = sw;
    rawCanvas.height = sh;
    const rawCtx = rawCanvas.getContext("2d");
    rawCtx.clearRect(0, 0, sw, sh);

    rawCtx.save();
    rawCtx.translate(sw, 0);
    rawCtx.scale(-1, 1);
    rawCtx.drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    rawCtx.restore();

    const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

    const usingLayout = layouts.vertical[totalFrames];
    let targetW = sw;
    let targetH = sh;
    if (usingLayout) {
      targetW = Math.round(usingLayout.photoWidth);
      targetH = Math.round(usingLayout.photoHeight);
    }

    const filteredData = await makeFilteredDataUrl(
      rawData,
      filter,
      targetW,
      targetH
    );

    const nextIndex = photosTaken.length + 1;
    setShowCaptureNumber(nextIndex);
    setFlash(true);
    setTimeout(() => setFlash(false), 140);
    setTimeout(() => setShowCaptureNumber(null), 700);

    setPhotosTaken((prev) => {
      const next = [...prev, { raw: rawData, filtered: filteredData }];
      showMessage(`Captured ${next.length} of ${photosToCapture}`);
      if (next.length >= photosToCapture) {
        clearTimeout(autoAdvanceTimer);
        clearSequenceTimer();
        setAutoCapturing(false);
        const t = setTimeout(() => {
          stopWebcam();
          setStep("preview");
        }, 400);
        setAutoAdvanceTimer(t);
      }
      return next;
    });
  }

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
        if (!c) c = document.createElement("canvas");

        const dpr = window.devicePixelRatio || 1;
        c.width = Math.round(canvasW * dpr);
        c.height = Math.round(canvasH * dpr);

        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.filter = canvasFilterString(filterName) || "none";

        drawImageCover(ctx, img, c.width, c.height, 0, 0);

        ctx.filter = "none";

        applyOverlayToCanvas(ctx, filterName, c.width, c.height);

        if (dpr !== 1) {
          const out = document.createElement("canvas");
          out.width = Math.round(canvasW);
          out.height = Math.round(canvasH);
          const outCtx = out.getContext("2d");
          outCtx.drawImage(
            c,
            0,
            0,
            c.width,
            c.height,
            0,
            0,
            out.width,
            out.height
          );
          resolve(out.toDataURL("image/jpeg", 0.95));
        } else {
          resolve(c.toDataURL("image/jpeg", 0.95));
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  }

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

  async function applyFilterToAll() {
    if (photosTaken.length === 0) {
      showMessage("No photos to apply filter to");
      return;
    }
    showMessage("Applying filter...");
    const usingLayout = layouts.vertical[totalFrames];
    const targetW = usingLayout ? Math.round(usingLayout.photoWidth) : 1280;
    const targetH = usingLayout ? Math.round(usingLayout.photoHeight) : 720;

    const results = await Promise.all(
      photosTaken.map((p) =>
        makeFilteredDataUrl(p.raw, filter, targetW, targetH)
      )
    );
    const next = photosTaken.map((p, i) => ({
      raw: p.raw,
      filtered: results[i],
    }));
    setPhotosTaken(next);
    showMessage("Filter applied");
  }

  function getPhotosForFrames() {
    const usingLayout = layouts.vertical[totalFrames];
    if (!usingLayout)
      return Array.from({ length: totalFrames }).map(() => null);
    const numCols = usingLayout.numCols;
    if (!photosTaken || photosTaken.length === 0) {
      return Array.from({ length: totalFrames }).map(() => null);
    }
    return Array.from({ length: totalFrames }).map((_, i) => {
      const row = Math.floor(i / numCols);
      const idx = row % photosTaken.length;
      const p = photosTaken[idx];
      return p ? p.filtered || p.raw : null;
    });
  }

  // async function buildFullSheetPayload() {
  //   const usingLayout = layouts.vertical[totalFrames];
  //   if (!usingLayout) {
  //     throw new Error("Invalid layout for current frames");
  //   }
  //   if (!photosTaken || photosTaken.length === 0) {
  //     showMessage("No photos captured to print");
  //     return null;
  //   }

  //   const finalW = usingLayout.finalWidth;
  //   const finalH = usingLayout.finalHeight;
  //   const slotW = Math.round(usingLayout.photoWidth);
  //   const slotH = Math.round(usingLayout.photoHeight);
  //   const numCols = usingLayout.numCols;
  //   const numRows = usingLayout.numRows;

  //   const gapX = Math.round(
  //     (usingLayout.finalWidth - numCols * slotW) / (numCols + 1)
  //   );
  //   const gapY = Math.round(
  //     (usingLayout.finalHeight - numRows * slotH) / (numRows + 1)
  //   );
  //   const gx = Math.max(0, gapX);
  //   const gy = Math.max(0, gapY);

  //   const sheetCanvas = document.createElement("canvas");
  //   sheetCanvas.width = finalW;
  //   sheetCanvas.height = finalH;
  //   const ctx = sheetCanvas.getContext("2d");

  //   ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
  //   ctx.fillRect(0, 0, finalW, finalH);

  //   const regenerated = await Promise.all(
  //     photosTaken.map((p) =>
  //       makeFilteredDataUrl(p.raw, filter, slotW, slotH).catch(() => p.raw)
  //     )
  //   );

  //   const slots = [];
  //   for (let i = 0; i < totalFrames; i++) {
  //     const row = Math.floor(i / numCols);
  //     const idx = row % regenerated.length;
  //     const src = regenerated[idx];

  //     const column = i % numCols;
  //     const y = gy + row * (slotH + gy);
  //     const x = gx + column * (slotW + gx);

  //     if (src) {
  //       await new Promise((res) => {
  //         const img = new Image();
  //         img.crossOrigin = "anonymous";
  //         img.onload = () => {
  //           const drawW = Math.min(slotW, finalW - x);
  //           const drawH = Math.min(slotH, finalH - y);
  //           ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawW, drawH);
  //           res(true);
  //         };
  //         img.onerror = () => res(true);
  //         img.src = src;
  //       });
  //     }

  //     slots.push({
  //       index: i,
  //       column,
  //       row,
  //       x,
  //       y,
  //       width: slotW,
  //       height: slotH,
  //       photoIndex: idx,
  //       image: src,
  //     });
  //   }

  //   const columns = Array.from({ length: numCols }).map((_, colIndex) =>
  //     slots
  //       .filter((s) => s.column === colIndex)
  //       .sort((a, b) => a.row - b.row)
  //       .map((s) => ({
  //         index: s.index,
  //         row: s.row,
  //         image: s.image,
  //         width: s.width,
  //         height: s.height,
  //       }))
  //   );

  //   const sheetDataUrl = sheetCanvas.toDataURL("image/png");

  //   const payload = {
  //     type: "polaroidish-full-sheet",
  //     createdAt: new Date().toISOString(),
  //     templateId: selectedTemplate?.id || null,
  //     filter,
  //     backgroundColor: bgColor,
  //     sheet: {
  //       width: finalW,
  //       height: finalH,
  //       units: "px",
  //       dpi: 300,
  //       fileType: "png",
  //       image: sheetDataUrl,
  //     },
  //     page: {
  //       pageIndex: 0,
  //       slots: slots.map((s) => ({
  //         index: s.index,
  //         column: s.column,
  //         row: s.row,
  //         x: s.x,
  //         y: s.y,
  //         width: s.width,
  //         height: s.height,
  //         photoIndex: s.photoIndex,
  //         image: s.image,
  //       })),
  //     },
  //     columns,
  //     printCopies,
  //     originalPhotosCount: photosTaken.length,
  //   };

  //   return payload;
  // }

  // async function handleProceedToPrintWholeSheet() {
  //   try {
  //     showMessage("Preparing sheet for print...");
  //     const payload = await buildFullSheetPayload();
  //     if (!payload) return;
  //     setStep("print");

  //     const formData = new FormData();
  //     formData.append("copies", String(printCopies));
  //     formData.append("filter", filter ?? "");
  //     formData.append("templateId", selectedTemplate?.id || "");
  //     formData.append("backgroundColor", bgColor ?? "");

  //     const sheetImage = payload.sheet.image;
  //     let blob;
  //     try {
  //       if (!sheetImage) throw new Error("No sheet image found in payload");
  //       if (sheetImage instanceof Blob) {
  //         blob = sheetImage;
  //       } else {
  //         const resp = await fetch(sheetImage);
  //         blob = await resp.blob();
  //       }
  //     } catch (fetchErr) {
  //       console.warn("fetch->blob failed, trying base64 fallback:", fetchErr);
  //       if (typeof sheetImage === "string" && sheetImage.startsWith("data:")) {
  //         const parts = sheetImage.split(",");
  //         const mimeMatch = parts[0].match(/:(.*?);/);
  //         const mime = mimeMatch ? mimeMatch[1] : "image/png";
  //         const bstr = atob(parts[1]);
  //         let n = bstr.length;
  //         const u8arr = new Uint8Array(n);
  //         while (n--) u8arr[n] = bstr.charCodeAt(n);
  //         blob = new Blob([u8arr], { type: mime });
  //       } else {
  //         throw fetchErr;
  //       }
  //     }

  //     formData.append("sheetImage", blob, "sheet.png");

  //     const url = "http://localhost:3000/api/print";
  //     try {
  //       const res = await axios.post(url, formData, {
  //         withCredentials: true,
  //       });

  //       console.log("Print response:", res.data);
  //       showMessage("Sent to printer");
  //     } catch (err) {
  //       console.error(
  //         "Print API error:",
  //         err.response?.data || err.message || err
  //       );
  //       const serverErr =
  //         err.response?.data?.error || err.response?.status || err.message;
  //       showMessage(
  //         `Prepared sheet but print server returned an error: ${serverErr}`
  //       );
  //     }

  //     return payload;
  //   } catch (err) {
  //     console.error("Error preparing sheet payload:", err);
  //     showMessage("Failed to prepare sheet: " + (err.message || ""));
  //     return null;
  //   }
  // }

  // console.log("Print payload", handleProceedToPrintWholeSheet);

  async function buildFullSheetPayload() {
    const usingLayout = layouts.vertical[totalFrames];
    if (!usingLayout) {
      throw new Error("Invalid layout for current frames");
    }
    if (!photosTaken || photosTaken.length === 0) {
      showMessage("No photos captured to print");
      return null;
    }

    const finalW = usingLayout.finalWidth;
    const finalH = usingLayout.finalHeight;
    const slotW = Math.round(usingLayout.photoWidth);
    const slotH = Math.round(usingLayout.photoHeight);
    const numCols = usingLayout.numCols;
    const numRows = usingLayout.numRows;

    const gapX = Math.round(
      (usingLayout.finalWidth - numCols * slotW) / (numCols + 1)
    );
    const gapY = Math.round(
      (usingLayout.finalHeight - numRows * slotH) / (numRows + 1)
    );
    const gx = Math.max(0, gapX);
    const gy = Math.max(0, gapY);

    const sheetCanvas = document.createElement("canvas");
    sheetCanvas.width = finalW;
    sheetCanvas.height = finalH;
    const ctx = sheetCanvas.getContext("2d");

    ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
    ctx.fillRect(0, 0, finalW, finalH);

    const regenerated = await Promise.all(
      photosTaken.map((p) =>
        makeFilteredDataUrl(p.raw, filter, slotW, slotH).catch(() => p.raw)
      )
    );

    // ✅ Upload filtered images to Cloudinary and get URLs
    const filteredImageUrls = [];
    for (let idx = 0; idx < regenerated.length; idx++) {
      try {
        const result = await uploadWithTransform(regenerated[idx], {
          folder: "photo-booth/filtered",
          filter: filter === "none" ? undefined : filter,
          width: slotW,
          height: slotH,
        });

        if (result.success) {
          filteredImageUrls.push(result.data.url);
          console.log(
            `✅ Uploaded filtered image ${idx + 1}:`,
            result.data.url
          );
        } else {
          filteredImageUrls.push(null);
        }
      } catch (error) {
        console.error(`❌ Failed to upload filtered image ${idx + 1}:`, error);
        filteredImageUrls.push(null);
      }
    }

    const slots = [];
    for (let i = 0; i < totalFrames; i++) {
      const row = Math.floor(i / numCols);
      const idx = row % regenerated.length;
      const src = regenerated[idx];

      const column = i % numCols;
      const y = gy + row * (slotH + gy);
      const x = gx + column * (slotW + gx);

      if (src) {
        await new Promise((res) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const drawW = Math.min(slotW, finalW - x);
            const drawH = Math.min(slotH, finalH - y);
            ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawW, drawH);
            res(true);
          };
          img.onerror = () => res(true);
          img.src = src;
        });
      }

      slots.push({
        index: i,
        column,
        row,
        x,
        y,
        width: slotW,
        height: slotH,
        photoIndex: idx,
        image: src,
      });
    }

    const columns = Array.from({ length: numCols }).map((_, colIndex) =>
      slots
        .filter((s) => s.column === colIndex)
        .sort((a, b) => a.row - b.row)
        .map((s) => ({
          index: s.index,
          row: s.row,
          image: s.image,
          width: s.width,
          height: s.height,
        }))
    );

    const sheetDataUrl = sheetCanvas.toDataURL("image/png");

    // ✅ Updated payload with filteredImages array included
    const payload = {
      type: "polaroidish-full-sheet",
      createdAt: new Date().toISOString(),
      templateId: selectedTemplate?.id || null,
      filter,
      backgroundColor: bgColor,
      filteredImages: filteredImageUrls.filter((url) => url !== null), // ✅ Added here
      copies: printCopies, // ✅ Added copies
      templateSelected: selectedTemplate?.id || null, // ✅ Added templateSelected
      sheet: {
        width: finalW,
        height: finalH,
        units: "px",
        dpi: 300,
        fileType: "png",
        image: sheetDataUrl,
      },
      page: {
        pageIndex: 0,
        slots: slots.map((s) => ({
          index: s.index,
          column: s.column,
          row: s.row,
          x: s.x,
          y: s.y,
          width: s.width,
          height: s.height,
          photoIndex: s.photoIndex,
          image: s.image,
        })),
      },
      columns,
      printCopies,
      originalPhotosCount: photosTaken.length,
    };

    return payload;
  }

  async function handleProceedToPrintWholeSheet() {
    try {
      showMessage("Preparing sheet for print...");
      const payload = await buildFullSheetPayload();
      if (!payload) return;

      // ✅ Log the complete payload here
      console.log("📦 Full Print Payload:", payload);
      console.log(
        "📸 Sheet Image Preview:",
        payload.sheet.image.substring(0, 50) + "..."
      );
      console.log("📋 Print Copies:", payload.printCopies);
      console.log("🎨 Filter:", payload.filter);
      console.log("🎨 Background Color:", payload.backgroundColor);
      console.log("📊 Columns Data:", payload.columns);

      setStep("print");

      const formData = new FormData();
      formData.append("copies", String(printCopies));
      formData.append("filter", filter ?? "");
      formData.append("templateId", selectedTemplate?.id || "");
      formData.append("backgroundColor", bgColor ?? "");

      const sheetImage = payload.sheet.image;
      let blob;
      try {
        if (!sheetImage) throw new Error("No sheet image found in payload");
        if (sheetImage instanceof Blob) {
          blob = sheetImage;
        } else {
          const resp = await fetch(sheetImage);
          blob = await resp.blob();
        }
      } catch (fetchErr) {
        console.warn("fetch->blob failed, trying base64 fallback:", fetchErr);
        if (typeof sheetImage === "string" && sheetImage.startsWith("data:")) {
          const parts = sheetImage.split(",");
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : "image/png";
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          blob = new Blob([u8arr], { type: mime });
        } else {
          throw fetchErr;
        }
      }

      formData.append("sheetImage", blob, "sheet.png");

      // ✅ Log FormData entries
      console.log("📤 FormData being sent:");
      for (let pair of formData.entries()) {
        if (pair[0] === "sheetImage") {
          console.log(pair[0] + ": [Blob]", pair[1].size + " bytes");
        } else {
          console.log(pair[0] + ": " + pair[1]);
        }
      }

      // const url = "http://localhost:3000/api/print";
      try {
        const res = await axios.post(url, formData, {
          withCredentials: true,
        });

        console.log("✅ Print response:", res.data);
        showMessage("Sent to printer");
      } catch (err) {
        console.error(
          "❌ Print API error:",
          err.response?.data || err.message || err
        );
        const serverErr =
          err.response?.data?.error || err.response?.status || err.message;
        showMessage(
          `Prepared sheet but print server returned an error: ${serverErr}`
        );
      }

      return payload;
    } catch (err) {
      console.error("❌ Error preparing sheet payload:", err);
      showMessage("Failed to prepare sheet: " + (err.message || ""));
      return null;
    }
  }

  const AUTO_CAPTURE_DELAY_MS = 3000;

  function startSequence() {
    if (!webcamStarted) startWebcam();
    setAutoCapturing(true);
    clearSequenceTimer();
    performSequenceStep();
  }

  function performSequenceStep() {
    clearSequenceTimer();
    if (photosTaken.length >= photosToCapture) {
      setAutoCapturing(false);
      clearSequenceTimer();
      return;
    }

    let c = 3;
    setShowCaptureNumber(c);

    const tick = () => {
      c = c - 1;
      if (c > 0) {
        setShowCaptureNumber(c);
        sequenceTimerRef.current = setTimeout(tick, 1000);
      } else {
        setShowCaptureNumber(null);
        capturePhoto();
        sequenceTimerRef.current = setTimeout(() => {
          if (photosTaken.length < photosToCapture) performSequenceStep();
          else {
            setAutoCapturing(false);
            clearSequenceTimer();
          }
        }, AUTO_CAPTURE_DELAY_MS);
      }
    };

    sequenceTimerRef.current = setTimeout(tick, 1000);
  }

  function stopSequence() {
    setAutoCapturing(false);
    clearSequenceTimer();
  }

  function previewOverlayStyleFor(filterName) {
    if (!filterName || filterName === "none" || filterName === "bw")
      return { display: "none" };
    if (filterName === "burnt-coffee") {
      return {
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#e3dca1",
        mixBlendMode: "multiply",
        opacity: 1,
        pointerEvents: "none",
      };
    }
    if (filterName === "ocean-wave") {
      return {
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#00e5fa",
        mixBlendMode: "multiply",
        opacity: 0.13,
        pointerEvents: "none",
      };
    }
    if (filterName === "old-wood") {
      return {
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#574400",
        mixBlendMode: "soft-light",
        opacity: 1,
        pointerEvents: "none",
      };
    }
    if (filterName === "vintage-may") {
      return {
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#faaa00",
        mixBlendMode: "normal",
        opacity: 0.13,
        pointerEvents: "none",
      };
    }
    return { display: "none" };
  }

  // Style objects
  const btnPrimary = {
    background: COLORS.DEEP_BLUE,
    color: COLORS.BASE_WHITE,
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px",
  };
  const btnSecondary = {
    background: COLORS.PRIMARY_BLUE,
    color: COLORS.TEXT_BLACK,
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  };
  const btnTemplate = {
    background: COLORS.LIGHT_GREY,
    color: COLORS.TEXT_BLACK,
    border: `2px solid ${COLORS.PRIMARY_BLUE}`,
    padding: "15px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%",
    margin: "5px 0",
  };
  const btnFilter = {
    background: COLORS.LIGHT_GREY,
    color: COLORS.TEXT_BLACK,
    border: "1px solid #ccc",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "3px",
    fontSize: "14px",
  };
  const btnFilterSelected = {
    ...btnFilter,
    background: COLORS.ACCENT_YELLOW,
    border: `2px solid ${COLORS.DEEP_BLUE}`,
  };

  return (
    <div
      className="app-root"
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          step === "start" ? COLORS.LIGHT_BACKGROUND : COLORS.BASE_WHITE,
        fontFamily: "'Arial', sans-serif",
        color: COLORS.TEXT_BLACK,
      }}
    >
      <style>{`
          .camera-flash { position:absolute; left:0; top:0; right:0; bottom:0; z-index:40; pointer-events:none; background: white; opacity:0; transition: opacity 120ms linear; }
          .camera-flash.show { opacity:0.85; transition: opacity 120ms linear; }
          #messageBox { visibility:hidden; min-width:220px; background-color:${COLORS.DEEP_BLUE}; color:${COLORS.ACCENT_YELLOW}; text-align:center; border-radius:8px; padding:10px; position:fixed; z-index:120; left:50%; top:18px; transform: translateX(-50%); opacity:0; transition: opacity 0.22s, top 0.22s; border:1px solid ${COLORS.PRIMARY_BLUE}; }
          #messageBox.show { visibility:visible; opacity:1; top:18px; }
          .capture-number { position:absolute; z-index:60; left:50%; top:50%; transform: translate(-50%,-50%); font-size: 96px; font-weight: 800; color: rgba(255,255,255,0.95); text-shadow: 0 6px 18px rgba(0,0,0,0.6); pointer-events:none; }
          .bg-preset-btn { width:32px; height:32px; border-radius:8px; border:2px solid rgba(0,0,0,0.08); cursor:pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.06); padding:0; }
          .bg-preset-btn.selected { outline: 3px solid ${COLORS.DEEP_BLUE}; transform: translateY(-2px); }
        `}</style>

      {step === "start" && (
        <StartScreen
          setStep={setStep}
          btnPrimary={btnPrimary}
          COLORS={COLORS}
        />
      )}

      {step === "select" && (
        <TemplateSelection
          templates={templates}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          setTotalFrames={setTotalFrames}
          setPhotosToCapture={setPhotosToCapture}
          setPrintCopies={setPrintCopies}
          setSelectedAspectRatio={setSelectedAspectRatio}
          photosToCapture={photosToCapture}
          printCopies={printCopies}
          layouts={layouts}
          setStep={setStep}
          btnPrimary={btnPrimary}
          btnTemplate={btnTemplate}
          COLORS={COLORS}
          // NEW:
          manualCopies={manualCopies}
          setManualCopies={setManualCopies}
        />
      )}

      {step === "capture" && (
        <CaptureScreen
          videoRef={videoRef}
          selectedAspectRatio={selectedAspectRatio}
          computedVideoFilter={computedVideoFilter}
          previewOverlayStyleFor={previewOverlayStyleFor}
          filter={filter}
          flash={flash}
          showCaptureNumber={showCaptureNumber}
          photosTaken={photosTaken}
          photosToCapture={photosToCapture}
          capturePhoto={capturePhoto}
          webcamStarted={webcamStarted}
          autoCapturing={autoCapturing}
          startSequence={startSequence}
          stopSequence={stopSequence}
          setStep={setStep}
          btnPrimary={btnPrimary}
          btnSecondary={btnSecondary}
          COLORS={COLORS}
        />
      )}

      {step === "preview" && (
        <PreviewScreen
          layouts={layouts}
          totalFrames={totalFrames}
          getPhotosForFrames={getPhotosForFrames}
          bgColor={bgColor}
          selectedRowIndex={selectedRowIndex}
          setSelectedRowIndex={setSelectedRowIndex}
          PRESET_BG_COLORS={PRESET_BG_COLORS}
          setBgColor={setBgColor}
          filter={filter}
          setFilter={setFilter}
          applyFilterToAll={applyFilterToAll}
          handleProceedToPrintWholeSheet={handleProceedToPrintWholeSheet}
          setPhotosTaken={setPhotosTaken}
          lastAppliedFilterRef={lastAppliedFilterRef}
          setStep={setStep}
          btnPrimary={btnPrimary}
          btnSecondary={btnSecondary}
          btnFilter={btnFilter}
          photosTaken={photosTaken}
          btnFilterSelected={btnFilterSelected}
          COLORS={COLORS}
        />
      )}

      {step === "print" && (
        <PrintScreen
          printCopies={printCopies}
          resetApp={resetApp}
          btnPrimary={btnPrimary}
          COLORS={COLORS}
        />
      )}

      <MessageBox
        message={message}
        messageVisible={messageVisible}
        COLORS={COLORS}
      />

      <canvas ref={rawCanvasRef} style={{ display: "none" }} />
      <canvas ref={filterCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
