import React, { useEffect, useRef, useState } from "react";

export default function Polaroidish() {
  // refs
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null);
  const filterCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const sequenceTimerRef = useRef(null);
  const lastAppliedFilterRef = useRef({ filter: null, photosCount: 0 });

  // UI state
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [totalFrames, setTotalFrames] = useState(4); // layout frames
  const [filter, setFilter] = useState("none");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [photosTaken, setPhotosTaken] = useState([]);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState("start");
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // sequence capture
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [showCaptureNumber, setShowCaptureNumber] = useState(null);

  // Number of photos to capture is now driven by number of rows (one photo per row)
  const [photosToCapture, setPhotosToCapture] = useState(2);

  // Print copies auto-set to number of rows (read-only in UI)
  const [printCopies, setPrintCopies] = useState(2);

  // NEW: selected row index in preview (null = none)
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Color palette
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

  // Helpers
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
  }

  useEffect(() => {
    if (!selectedTemplate) return;

    setTotalFrames(selectedTemplate.frames);

    const layoutGroup = layouts[selectedTemplate.layout];
    if (layoutGroup && layoutGroup[selectedTemplate.frames]) {
      const usingLayout = layoutGroup[selectedTemplate.frames];

      // NEW: photosToCapture = number of rows (one photo per row)
      setPhotosToCapture(usingLayout.numRows);
      // printCopies also defaults to number of rows
      setPrintCopies(usingLayout.numRows);

      if (usingLayout.photoWidth && usingLayout.photoHeight) {
        const aspect = usingLayout.photoWidth / usingLayout.photoHeight;
        setSelectedAspectRatio(aspect);
        return;
      }
    }

    if (selectedTemplate.aspectRatio) {
      setSelectedAspectRatio(selectedTemplate.aspectRatio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  // Webcam functions
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(autoAdvanceTimer);
      clearSequenceTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Filters: include B&W
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

  // Build full sheet payload (match preview). Now includes per-slot images and columns grouping.
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

    // Create canvas at final size (sheet)
    const sheetCanvas = document.createElement("canvas");
    sheetCanvas.width = finalW;
    sheetCanvas.height = finalH;
    const ctx = sheetCanvas.getContext("2d");

    // Fill background same as preview
    ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
    ctx.fillRect(0, 0, finalW, finalH);

    // Regenerate filtered images for each photo (size slotW x slotH)
    const regenerated = await Promise.all(
      photosTaken.map((p) =>
        makeFilteredDataUrl(p.raw, filter, slotW, slotH).catch(() => p.raw)
      )
    );

    // Draw each slot into correct position and collect metadata and column grouping
    const slots = [];
    for (let i = 0; i < totalFrames; i++) {
      // NEW: choose photo per-row so both columns in a row show same image
      const row = Math.floor(i / numCols);
      const idx = row % regenerated.length;
      const src = regenerated[idx];

      const column = i % numCols;
      const y = gy + row * (slotH + gy);
      const x = gx + column * (slotW + gx);

      if (src) {
        // draw image into sheet
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

    // Group by columns (top-to-bottom)
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

    // Now sheet canvas contains the full sheet
    const sheetDataUrl = sheetCanvas.toDataURL("image/png");

    const payload = {
      type: "polaroidish-full-sheet",
      createdAt: new Date().toISOString(),
      templateId: selectedTemplate?.id || null,
      filter,
      backgroundColor: bgColor,
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

    const payloadForLog = {
      ...payload,
      sheet: {
        ...payload.sheet,
        image: payload.sheet.image
          ? payload.sheet.image.slice(0, 120) + "...(truncated)"
          : null,
      },
    };
    console.log("Full-sheet payload (truncated):", payloadForLog);
    console.log("Full-sheet payload (full):", payload);

    return payload;
  }

  // Handler to call when user clicks Proceed (now sends payload)
  async function handleProceedToPrintWholeSheet() {
    try {
      showMessage("Preparing sheet for print...");
      const payload = await buildFullSheetPayload();
      if (!payload) return;

      setStep("print");

      // POST the payload to backend - adjust endpoint as needed
      try {
        const res = await fetch("/api/print", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.warn("Print API returned non-OK:", res.status);
          showMessage("Prepared sheet but print server returned an error.");
        } else {
          showMessage("Sent to printer");
        }
      } catch (err) {
        console.error("Error posting to print API", err);
        showMessage("Prepared sheet (failed to POST, check console).");
      }

      return payload;
    } catch (err) {
      console.error("Error preparing sheet payload:", err);
      showMessage("Failed to prepare sheet: " + (err.message || ""));
      return null;
    }
  }

  // Compute the source rectangle on the video element that corresponds to object-fit: cover
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
    rawCtx.scale(-1, 1); // mirror
    rawCtx.drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    rawCtx.restore();

    const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

    // compute target size using layout's photo size
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

        // Fill background color first
        ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
        ctx.fillRect(0, 0, c.width, c.height);

        // Apply canvas-level filter
        ctx.filter = canvasFilterString(filterName) || "none";

        // Draw image cover
        drawImageCover(ctx, img, c.width, c.height, 0, 0);

        // Reset filter for overlay drawing (overlay should apply after image)
        ctx.filter = "none";

        // apply overlay/composite for filters that require tints/mix-blend
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

  function drawImageContain(ctx, img, canvasWidth, canvasHeight, x = 0, y = 0) {
    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const renderW = Math.round(img.width * scale);
    const renderH = Math.round(img.height * scale);
    const dx = Math.round(x + (canvasWidth - renderW) / 2);
    const dy = Math.round(y + (canvasHeight - renderH) / 2);
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, renderW, renderH);
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

  // NEW: getPhotosForFrames maps photo per-row so both columns in same row show same image
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

  async function downloadStrip() {
    const usingLayout = layouts.vertical[totalFrames];
    if (!usingLayout) {
      showMessage("Invalid layout configuration.");
      return;
    }
    if (!photosTaken || photosTaken.length === 0) {
      showMessage("No photos available to download.");
      return;
    }

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = usingLayout.finalWidth;
    finalCanvas.height = usingLayout.finalHeight;
    const ctx = finalCanvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    const numCols = usingLayout.numCols;
    const numRows = usingLayout.numRows;
    const slotW = Math.round(usingLayout.photoWidth);
    const slotH = Math.round(usingLayout.photoHeight);

    const gapX = Math.round(
      (usingLayout.finalWidth - numCols * slotW) / (numCols + 1)
    );
    const gapY = Math.round(
      (usingLayout.finalHeight - numRows * slotH) / (numRows + 1)
    );
    const gx = Math.max(0, gapX);
    const gy = Math.max(0, gapY);

    // regenerate per-row images (photosTaken length should equal numRows)
    const regenerated = await Promise.all(
      photosTaken.map((p) =>
        makeFilteredDataUrl(p.raw, filter, slotW, slotH).catch(() => p.raw)
      )
    );

    for (let i = 0; i < totalFrames; i++) {
      const row = Math.floor(i / numCols);
      const idx = row % regenerated.length;
      const src = regenerated[idx];
      if (!src) continue;

      const column = i % numCols;
      const x = gx + column * (slotW + gx);
      const y = gy + row * (slotH + gy);

      await new Promise((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const drawW = Math.min(slotW, finalCanvas.width - x);
          const drawH = Math.min(slotH, finalCanvas.height - y);
          ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawW, drawH);
          res(true);
        };
        img.onerror = () => res(true);
        img.src = src;
      });
    }

    const link = document.createElement("a");
    link.download = "polaroidish-strip.png";
    link.href = finalCanvas.toDataURL("image/png");
    link.click();

    showMessage("Downloaded!");
  }

  function handlePrint() {
    setStep("print");
    setTimeout(() => {
      showMessage("Printing completed!");
    }, 3000);
  }

  const AUTO_CAPTURE_DELAY_MS = 3000;

  function startSequence() {
    if (!webcamStarted) startWebcam();
    setAutoCapturing(true);
    // start immediately
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

    // countdown 3..2..1 then capture
    let c = 3;
    setShowCaptureNumber(c);

    const tick = () => {
      c = c - 1;
      if (c > 0) {
        setShowCaptureNumber(c);
        sequenceTimerRef.current = setTimeout(tick, 1000);
      } else {
        // "click" moment
        setShowCaptureNumber(null);
        capturePhoto();
        // schedule next sequence step after AUTO_CAPTURE_DELAY_MS (gives user short break)
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

  // Styles (same as before)
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

  // Small reusable inline SVG logo for start page
  function LogoSVG({ size = 100 }) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stopColor="#ff9a9e" />
            <stop offset="1" stopColor="#fad0c4" />
          </linearGradient>
        </defs>
        <rect rx="12" width="64" height="64" fill="url(#g1)" />
        <g transform="translate(8,8)">
          <rect x="0" y="0" width="48" height="48" rx="8" fill="#fff" />
          <circle cx="24" cy="20" r="9" fill="#528bad" />
          <rect x="12" y="34" width="24" height="6" rx="2" fill="#528bad" />
        </g>
      </svg>
    );
  }

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

      {/* START */}
      {step === "start" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            width: "100%",
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              marginBottom: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{ width: "120px", height: "120px", marginBottom: "20px" }}
            >
              <LogoSVG size={120} />
            </div>
            <h1
              style={{
                color: COLORS.TEXT_BLACK,
                fontSize: "2.5rem",
                fontWeight: "bold",
                margin: "0 0 10px 0",
              }}
            >
              Polaroidish
            </h1>
          </div>
          <button
            onClick={() => setStep("select")}
            style={{ ...btnPrimary, padding: "15px 40px", fontSize: "1.2rem" }}
          >
            Start
          </button>
        </div>
      )}

      {/* SELECT */}
      {step === "select" && (
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
            Select Template
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "20px",
              width: "100%",
            }}
          >
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: 220,
                }}
              >
                {/* Mini visual grid for template */}
                <div
                  style={{
                    width: "160px",
                    height: "120px",
                    marginBottom: "10px",
                    background: COLORS.BASE_WHITE,
                    borderRadius: 8,
                    padding: 8,
                    display: "grid",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(2, 1fr)`,
                      gridTemplateRows: `repeat(${template.frames / 2}, 1fr)`,
                      gap: 6,
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    {Array.from({ length: template.frames }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#f5f5f5",
                          borderRadius: 4,
                          border: "1px solid #e1e1e1",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTotalFrames(template.frames);

                    // NEW: set photosToCapture and printCopies to number of rows
                    const usingLayout = layouts.vertical[template.frames];
                    if (usingLayout) {
                      setPhotosToCapture(usingLayout.numRows);
                      setPrintCopies(usingLayout.numRows);
                      setSelectedAspectRatio(
                        usingLayout.photoWidth / usingLayout.photoHeight
                      );
                    } else {
                      setPhotosToCapture(template.frames);
                      setPrintCopies(2);
                    }
                  }}
                  style={{
                    ...btnTemplate,
                    backgroundColor:
                      selectedTemplate?.id === template.id
                        ? COLORS.ACCENT_YELLOW
                        : COLORS.LIGHT_GREY,
                  }}
                >
                  {template.label}
                </button>
              </div>
            ))}
          </div>

          <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "12px" }}>
            Number of photos to capture
          </h3>
          <div style={{ color: "#555", marginBottom: "12px" }}>
            (Set by template: <strong>{photosToCapture}</strong>) — one photo
            per row.
          </div>

          <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "12px" }}>
            Copies to print
          </h3>
          <div style={{ color: "#555", marginBottom: "20px" }}>
            (Automatically set) <strong>{printCopies}</strong>
          </div>

          <button
            onClick={() => setStep("capture")}
            disabled={!selectedTemplate}
            style={{ ...btnPrimary, opacity: !selectedTemplate ? 0.5 : 1 }}
          >
            Next
          </button>
        </div>
      )}

      {/* CAPTURE */}
      {step === "capture" && (
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "20px" }}>
            Take Photos
          </h2>

          {/* Smaller fixed video container */}
          <div
            style={{
              padding: 14,
              background: COLORS.BASE_WHITE,
              borderRadius: 14,
              boxShadow: "0 18px 50px rgba(5,10,30,0.12)",
              border: `6px solid rgba(0,0,0,0.06)`,
              width: "400px",
              boxSizing: "border-box",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: selectedAspectRatio,
                overflow: "hidden",
                borderRadius: 8,
                position: "relative",
                background: "#000",
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

              <div className={`camera-flash ${flash ? "show" : ""}`} />
              {showCaptureNumber && (
                <div className="capture-number">{showCaptureNumber}</div>
              )}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: COLORS.BASE_WHITE,
                  backgroundColor: "rgba(0,0,0,0.45)",
                  padding: "6px 12px",
                  borderRadius: 6,
                }}
              >
                {photosTaken.length} / {photosToCapture}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
            <button
              onClick={capturePhoto}
              disabled={!webcamStarted || photosTaken.length >= photosToCapture}
              style={{
                ...btnPrimary,
                opacity:
                  !webcamStarted || photosTaken.length >= photosToCapture
                    ? 0.5
                    : 1,
              }}
            >
              {photosTaken.length >= photosToCapture ? "Done" : "Take Photo"}
            </button>

            {!autoCapturing ? (
              <button
                onClick={startSequence}
                disabled={
                  !webcamStarted || photosTaken.length >= photosToCapture
                }
                style={btnSecondary}
              >
                Start Sequence
              </button>
            ) : (
              <button onClick={stopSequence} style={btnSecondary}>
                Stop Sequence
              </button>
            )}

            <button onClick={() => setStep("select")} style={btnSecondary}>
              Back
            </button>
          </div>

          <p style={{ color: "#666", textAlign: "center" }}>
            Press Space to capture • {photosTaken.length} of {photosToCapture}{" "}
            photos taken
            <br />
            {autoCapturing ? "Auto sequence running..." : ""}
          </p>
        </div>
      )}

      {/* PREVIEW */}
      {step === "preview" && (
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
                      maxWidth: 500, // change the bg here
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
                <div
                  style={{ marginTop: "8px", fontSize: "12px", color: "#555" }}
                >
                  Tip: tap a preset for quick look — use the color picker for
                  fine-tuning.
                </div>
              </div>

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
                    style={
                      filter === "ocean-wave" ? btnFilterSelected : btnFilter
                    }
                  >
                    Ocean Wave
                  </button>
                  <button
                    onClick={() => setFilter("old-wood")}
                    style={
                      filter === "old-wood" ? btnFilterSelected : btnFilter
                    }
                  >
                    Old Wood
                  </button>
                  <button
                    onClick={() => setFilter("vintage-may")}
                    style={
                      filter === "vintage-may" ? btnFilterSelected : btnFilter
                    }
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

              <button
                onClick={applyFilterToAll}
                style={{ ...btnSecondary, width: "100%", marginBottom: "15px" }}
              >
                Apply Filter
              </button>

              <button
                onClick={handleProceedToPrintWholeSheet}
                style={{ ...btnPrimary, width: "100%", marginBottom: "15px" }}
              >
                Proceed to Print (whole sheet)
              </button>

              <button
                onClick={() => {
                  setPhotosTaken([]);
                  setFilter("none");
                  lastAppliedFilterRef.current = {
                    filter: null,
                    photosCount: 0,
                  };
                  setStep("capture");
                  setSelectedRowIndex(null);
                }}
                style={{ ...btnSecondary, width: "100%" }}
              >
                Retake Photos
              </button>

              <button
                onClick={downloadStrip}
                style={{ ...btnPrimary, width: "100%", marginTop: "12px" }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT */}
      {step === "print" && (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "30px" }}>
            Printing {printCopies} Copies
          </h2>
          <div
            style={{
              width: "100px",
              height: "100px",
              border: "5px solid #f3f3f3",
              borderTop: `5px solid ${COLORS.ACCENT_YELLOW}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "30px",
            }}
          />
          <p
            style={{ color: "#666", textAlign: "center", marginBottom: "30px" }}
          >
            Your photo strip is being printed. Please wait...
          </p>
          <button onClick={resetApp} style={btnPrimary}>
            Start Over
          </button>
        </div>
      )}

      {/* Message Box */}
      <div
        id="messageBox"
        className={messageVisible ? "show" : ""}
        style={{ zIndex: 200 }}
      >
        {message}
      </div>

      {/* Hidden canvases */}
      <canvas ref={rawCanvasRef} style={{ display: "none" }} />
      <canvas ref={filterCanvasRef} style={{ display: "none" }} />
    </div>
  );
}
