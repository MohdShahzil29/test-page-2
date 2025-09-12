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
  const [totalFrames, setTotalFrames] = useState(4);
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

  // Copies
  const copyOptions = [2, 4, 6];
  const [copies, setCopies] = useState(2);

  // Color palette (from your input)
  const COLORS = {
    PRIMARY_BLUE: "#528bad",
    LIGHT_BACKGROUND: "#dee3f6",
    DEEP_BLUE: "#0378b5",
    ACCENT_YELLOW: "#facc0b",
    LIGHT_GREY: "#f2f2f2",
    TEXT_BLACK: "#000000",
    BASE_WHITE: "#FFFFFF",
  };

  // Popular preset background colors (quick buttons)
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

  // Aspect presets (from the image you showed)
  const ASPECT_PRESETS = {
    WIDE: 0.697, // width is ~0.697 times bigger than height (landscape)
    PORTRAIT: 1.325, // height is ~1.325 times bigger than width (tall)
    SQUARE: 1.0, // square
  };

  // selected frame/aspect (matches the image you sent)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(3 / 4);

  // Layout configurations for vertical templates only (these control final strip layout)
  const layouts = {
    vertical: {
      4: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 2,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 40) / 2,
        aspectRatio: 3 / 4,
      },
      6: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 3,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 60) / 3,
        aspectRatio: 3 / 4,
      },
      8: {
        finalWidth: 1200,
        finalHeight: 1800,
        numCols: 2,
        numRows: 4,
        photoWidth: (1200 - 40) / 2,
        photoHeight: (1800 - 80) / 4,
        aspectRatio: 3 / 4,
      },
    },
  };

  // Templates: include aspectRatio so selecting a template can set the camera aspect
  const templates = [
    {
      id: "4v",
      label: "4 Photos",
      frames: 4,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.WIDE,
    },
    {
      id: "6v",
      label: "6 Photos",
      frames: 6,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.PORTRAIT,
    },
    {
      id: "8v",
      label: "8 Photos",
      frames: 8,
      layout: "vertical",
      aspectRatio: ASPECT_PRESETS.SQUARE,
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
    setCopies(2);
    setSelectedTemplate(null);
    setSelectedAspectRatio(3 / 4);
    setStep("start");
    setAutoCapturing(false);
    setShowCaptureNumber(null);
    lastAppliedFilterRef.current = { filter: null, photosCount: 0 };
  }

  // Ensure copies never exceed selected template frames + set aspect ratio from template
  useEffect(() => {
    if (selectedTemplate && copies > selectedTemplate.frames) {
      setCopies(selectedTemplate.frames);
    }
    if (selectedTemplate) {
      setTotalFrames(selectedTemplate.frames);
      // set aspect ratio to template's aspect if provided
      if (selectedTemplate.aspectRatio) {
        setSelectedAspectRatio(selectedTemplate.aspectRatio);
      }
    }
  }, [selectedTemplate]);

  // Webcam functions
  async function startWebcam() {
    if (webcamStarted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          aspectRatio: selectedAspectRatio || 3 / 4,
        },
        audio: false,
      });
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(autoAdvanceTimer);
      clearSequenceTimer();
    };
  }, [autoAdvanceTimer]);

  // Start webcam when entering capture step
  useEffect(() => {
    if (step === "capture") {
      setPhotosTaken([]);
      setTimeout(() => startWebcam(), 150);
    } else {
      stopWebcam();
      clearSequenceTimer();
      setAutoCapturing(false);
    }
  }, [step]);

  // Apply filter to preview (same as before), with caching
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

  // Keyboard: Space to capture
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
  }, [step, photosTaken, filter, webcamStarted, copies]);

  // Video filter based on selected filter
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

  // Compute the source rectangle on the video element that corresponds to object-fit: cover
  function computeVideoSourceRect(videoEl, displayW, displayH) {
    // videoEl.videoWidth/videoHeight are the natural size
    const vw = videoEl.videoWidth || 1;
    const vh = videoEl.videoHeight || 1;

    const displayRatio = displayW / displayH;
    const videoRatio = vw / vh;

    let sx = 0,
      sy = 0,
      sw = vw,
      sh = vh;

    if (videoRatio > displayRatio) {
      // video is wider -> crop horizontally
      sw = Math.round(vh * displayRatio);
      sx = Math.round((vw - sw) / 2);
    } else {
      // video is taller -> crop vertically
      sh = Math.round(vw / displayRatio);
      sy = Math.round((vh - sh) / 2);
    }

    return { sx, sy, sw, sh };
  }

  // --- UPDATED capturePhoto: draw cropped area AT ITS OWN SIZE and MIRROR to match preview ---
  async function capturePhoto() {
    if (!webcamStarted || !videoRef.current) {
      showMessage("Camera not started");
      return;
    }
    if (photosTaken.length >= copies) {
      showMessage("All required photos captured");
      return;
    }

    const v = videoRef.current;
    // create / reuse raw canvas
    const rawCanvas = rawCanvasRef.current || document.createElement("canvas");
    const displayRect = v.getBoundingClientRect();

    // compute source rectangle from video natural dimensions so captured framing matches preview (object-fit:cover)
    const { sx, sy, sw, sh } = computeVideoSourceRect(
      v,
      displayRect.width,
      displayRect.height
    );

    // set canvas to the CROPPED size (important — do NOT upscale to full video resolution)
    rawCanvas.width = sw;
    rawCanvas.height = sh;
    const rawCtx = rawCanvas.getContext("2d");
    rawCtx.clearRect(0, 0, sw, sh);

    // draw only the visible/cropped portion into the canvas (mirror horizontally so it matches the CSS mirrored preview)
    rawCtx.save();
    // mirror horizontally
    rawCtx.translate(sw, 0);
    rawCtx.scale(-1, 1);
    // draw from video natural coords
    rawCtx.drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    rawCtx.restore();

    // create raw data url from the cropped area
    const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

    // Create filtered version USING final slot dimensions (so preview/download match)
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

    // Flash and number overlay
    const nextIndex = photosTaken.length + 1;
    setShowCaptureNumber(nextIndex);
    setFlash(true);
    setTimeout(() => setFlash(false), 140);
    setTimeout(() => setShowCaptureNumber(null), 700);

    setPhotosTaken((prev) => {
      const next = [...prev, { raw: rawData, filtered: filteredData }];
      showMessage(`Captured ${next.length} of ${copies}`);
      if (next.length >= copies) {
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

  // makeFilteredDataUrl: center-crop (cover), apply filter, respect devicePixelRatio
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
        if (!c) {
          c = document.createElement("canvas");
        }

        // respect DPR for crispness
        const dpr = window.devicePixelRatio || 1;
        c.width = Math.round(canvasW * dpr);
        c.height = Math.round(canvasH * dpr);

        const ctx = c.getContext("2d");
        ctx.clearRect(0, 0, c.width, c.height);

        // fill background to avoid transparent letterbox
        ctx.fillStyle = bgColor || COLORS.BASE_WHITE;
        ctx.fillRect(0, 0, c.width, c.height);

        // apply css-like filter string to canvas
        ctx.filter = canvasFilterString(filterName);

        // draw image as COVER (center-crop) so preview and final match
        drawImageCover(ctx, img, c.width, c.height, 0, 0);

        // if we used DPR, downscale to requested css pixels before exporting
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

  // helper: draw image scaled to fit (contain) and center it
  function drawImageContain(ctx, img, canvasWidth, canvasHeight, x = 0, y = 0) {
    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
    const renderW = Math.round(img.width * scale);
    const renderH = Math.round(img.height * scale);
    const dx = Math.round(x + (canvasWidth - renderW) / 2);
    const dy = Math.round(y + (canvasHeight - renderH) / 2);
    ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, renderW, renderH);
  }

  // Draw image center-crop (cover)
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

  // Apply filter to all photos (generate filtered versions at final slot size)
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

  // Helper: expand the captured photos to fill totalFrames by repeating
  function getPhotosForFrames() {
    if (!photosTaken || photosTaken.length === 0) {
      return Array.from({ length: totalFrames }).map(() => null);
    }
    const arr = Array.from({ length: totalFrames }).map((_, i) => {
      const idx = i % photosTaken.length;
      const p = photosTaken[idx];
      return p ? p.filtered || p.raw : null;
    });
    return arr;
  }

  // Download composed strip
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

    // final canvas
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = usingLayout.finalWidth;
    finalCanvas.height = usingLayout.finalHeight;
    const ctx = finalCanvas.getContext("2d");

    // fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // integer slot sizes (round to avoid fractional pixels causing overflow)
    const numCols = usingLayout.numCols;
    const numRows = usingLayout.numRows;
    const slotW = Math.round(usingLayout.photoWidth);
    const slotH = Math.round(usingLayout.photoHeight);

    // compute gap so grid exactly fits the final canvas:
    // finalWidth = (numCols * slotW) + (numCols + 1) * gapX
    // solve for gapX and gapY and round to integer
    const gapX = Math.round(
      (usingLayout.finalWidth - numCols * slotW) / (numCols + 1)
    );
    const gapY = Math.round(
      (usingLayout.finalHeight - numRows * slotH) / (numRows + 1)
    );

    // Safety clamp: ensure gap >= 0
    const gx = Math.max(0, gapX);
    const gy = Math.max(0, gapY);

    // Regenerate filtered images at exact slot size (guarantees preview==download)
    const regenerated = await Promise.all(
      photosTaken.map((p) =>
        makeFilteredDataUrl(p.raw, filter, slotW, slotH).catch(() => p.raw)
      )
    );

    // Draw each slot using integer coordinates; use repeated images if fewer photos
    for (let i = 0; i < totalFrames; i++) {
      const idx = i % regenerated.length;
      const src = regenerated[idx];
      if (!src) continue;

      // compute integer column/row and x,y
      const column = i % numCols;
      const row = Math.floor(i / numCols);
      const x = gx + column * (slotW + gx);
      const y = gy + row * (slotH + gy);

      // draw image - since regenerated image is already slotW x slotH, draw directly
      await new Promise((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // ensure we don't draw outside final canvas bounds
          const drawW = Math.min(slotW, finalCanvas.width - x);
          const drawH = Math.min(slotH, finalCanvas.height - y);

          // draw scaled to slot (should be same size); integer coords avoid subpixel cuts
          ctx.drawImage(img, 0, 0, img.width, img.height, x, y, drawW, drawH);
          res(true);
        };
        img.onerror = () => res(true);
        img.src = src;
      });
    }

    // trigger download
    const link = document.createElement("a");
    link.download = "polaroidish-strip.png";
    link.href = finalCanvas.toDataURL("image/png");
    link.click();

    showMessage("Downloaded!");
  }

  // Print function
  function handlePrint() {
    setStep("print");
    // Simulate printing process
    setTimeout(() => {
      showMessage("Printing completed!");
    }, 3000);
  }

  // Sequence capture (automatic)
  const AUTO_CAPTURE_DELAY_MS = 3000; // change this to tweak auto delay

  function startSequence() {
    if (!webcamStarted || photosTaken.length >= copies) {
      // start webcam if needed
      if (!webcamStarted) startWebcam();
    }
    setAutoCapturing(true);
    // small initial delay so user sees "3..2..1" number overlay (optional)
    sequenceTimerRef.current = setTimeout(() => {
      performSequenceStep();
    }, 600);
  }

  function performSequenceStep() {
    clearSequenceTimer();
    if (photosTaken.length < copies) {
      // capture one
      capturePhoto();
      // schedule next if still needed
      sequenceTimerRef.current = setTimeout(() => {
        performSequenceStep();
      }, AUTO_CAPTURE_DELAY_MS);
    } else {
      setAutoCapturing(false);
      clearSequenceTimer();
    }
  }

  // Stop sequence manually
  function stopSequence() {
    setAutoCapturing(false);
    clearSequenceTimer();
  }

  // Button styles (updated to use your palette)
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

  const btnCopyOption = {
    background: COLORS.LIGHT_GREY,
    color: COLORS.TEXT_BLACK,
    border: "1px solid #ccc",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "5px",
  };

  const btnCopyOptionSelected = {
    ...btnCopyOption,
    background: COLORS.ACCENT_YELLOW,
    border: `2px solid ${COLORS.DEEP_BLUE}`,
  };

  // Styles for aspect buttons reuse copy option styles
  const btnAspect = {
    ...btnCopyOption,
    padding: "8px 12px",
  };
  const btnAspectSelected = {
    ...btnAspect,
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
        .camera-flash {
          position:absolute;
          left:0; top:0; right:0; bottom:0; 
          z-index:40; 
          pointer-events:none;
          background: white; 
          opacity:0; 
          transition: opacity 120ms linear;
        }
        .camera-flash.show { 
          opacity:0.85; 
          transition: opacity 120ms linear; 
        }

        #messageBox {
          visibility:hidden;
          min-width:220px;
          background-color:${COLORS.DEEP_BLUE};
          color:${COLORS.ACCENT_YELLOW};
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
          border:1px solid ${COLORS.PRIMARY_BLUE};
        }
        #messageBox.show { 
          visibility:visible; 
          opacity:1; 
          top:18px; 
        }

        .capture-number {
          position:absolute;
          z-index:60;
          left:50%;
          top:50%;
          transform: translate(-50%,-50%);
          font-size: 96px;
          font-weight: 800;
          color: rgba(255,255,255,0.95);
          text-shadow: 0 6px 18px rgba(0,0,0,0.6);
          pointer-events:none;
        }

        .bg-preset-btn {
          width:32px;
          height:32px;
          border-radius:8px;
          border:2px solid rgba(0,0,0,0.08);
          cursor:pointer;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
          padding:0;
        }

        .bg-preset-btn.selected {
          outline: 3px solid ${COLORS.DEEP_BLUE};
          transform: translateY(-2px);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* PAGE 1: START PAGE */}
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
          {/* Logo and name */}
          <div
            style={{
              marginBottom: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: COLORS.ACCENT_YELLOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "40px",
                fontWeight: "bold",
                color: COLORS.TEXT_BLACK,
              }}
            >
              P
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
            <p
              style={{
                color: COLORS.TEXT_BLACK,
                fontSize: "1rem",
                opacity: 0.8,
              }}
            >
              Create your photo strip in seconds
            </p>
          </div>

          <button
            onClick={() => setStep("select")}
            style={{
              ...btnPrimary,
              padding: "15px 40px",
              fontSize: "1.2rem",
            }}
          >
            Start
          </button>
        </div>
      )}

      {/* PAGE 2: TEMPLATE SELECTION */}
      {step === "select" && (
        <div
          style={{
            width: "100%",
            maxWidth: "800px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "30px" }}>
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
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setTotalFrames(template.frames);
                  if (copies > template.frames) setCopies(template.frames);
                  if (template.aspectRatio)
                    setSelectedAspectRatio(template.aspectRatio);
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
            ))}
          </div>

          {/* Aspect Choice (also selectable manually) */}
          <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "10px" }}>
            Frame Shape
          </h3>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            <button
              onClick={() => setSelectedAspectRatio(ASPECT_PRESETS.WIDE)}
              style={
                selectedAspectRatio === ASPECT_PRESETS.WIDE
                  ? btnAspectSelected
                  : btnAspect
              }
            >
              Wide
            </button>
            <button
              onClick={() => setSelectedAspectRatio(ASPECT_PRESETS.PORTRAIT)}
              style={
                selectedAspectRatio === ASPECT_PRESETS.PORTRAIT
                  ? btnAspectSelected
                  : btnAspect
              }
            >
              Portrait
            </button>
            <button
              onClick={() => setSelectedAspectRatio(ASPECT_PRESETS.SQUARE)}
              style={
                selectedAspectRatio === ASPECT_PRESETS.SQUARE
                  ? btnAspectSelected
                  : btnAspect
              }
            >
              Square
            </button>
          </div>

          <h3 style={{ color: COLORS.TEXT_BLACK, marginBottom: "15px" }}>
            Number of Copies
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "40px",
            }}
          >
            {copyOptions.map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (selectedTemplate && num > selectedTemplate.frames) {
                    setCopies(selectedTemplate.frames);
                    showMessage(
                      `Copies reduced to ${selectedTemplate.frames} (template has only ${selectedTemplate.frames} frames)`
                    );
                  } else {
                    setCopies(num);
                  }
                }}
                style={copies === num ? btnCopyOptionSelected : btnCopyOption}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("capture")}
            disabled={!selectedTemplate}
            style={{
              ...btnPrimary,
              opacity: !selectedTemplate ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* PAGE 3: CAMERA CAPTURE */}
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

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "600px",
              aspectRatio: selectedAspectRatio,
              marginBottom: "20px",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)", // Mirror the video for natural feel
                filter: computedVideoFilter(),
              }}
              playsInline
              autoPlay
              muted
            />
            <div className={`camera-flash ${flash ? "show" : ""}`} />

            {/* big capture number */}
            {showCaptureNumber && (
              <div className="capture-number">{showCaptureNumber}</div>
            )}

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                color: COLORS.BASE_WHITE,
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
            >
              {photosTaken.length} / {copies}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={capturePhoto}
              disabled={!webcamStarted || photosTaken.length >= copies}
              style={{
                ...btnPrimary,
                opacity:
                  !webcamStarted || photosTaken.length >= copies ? 0.5 : 1,
              }}
            >
              {photosTaken.length >= copies ? "Done" : "Take Photo"}
            </button>

            {!autoCapturing ? (
              <button
                onClick={startSequence}
                disabled={!webcamStarted || photosTaken.length >= copies}
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
            Press Space to capture • {photosTaken.length} of {copies} photos
            taken (these will be duplicated to fill the template)
            <br />
            {autoCapturing ? "Auto sequence running..." : ""}
          </p>
        </div>
      )}

      {/* PAGE 4: PREVIEW */}
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
            {/* Preview Image */}
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

                return (
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      aspectRatio: `${usingLayout.finalWidth}/${usingLayout.finalHeight}`,
                      backgroundColor: bgColor,
                      padding: "20px",
                      boxSizing: "border-box",
                      borderRadius: "10px",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${usingLayout.numCols}, 1fr)`,
                        gridAutoRows: "1fr",
                        gap: "20px",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {Array.from({ length: totalFrames }).map((_, i) => {
                        const src = expanded[i];
                        return (
                          <div
                            key={i}
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: COLORS.LIGHT_GREY,
                              borderRadius: "5px",
                              overflow: "hidden",
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

            {/* Options Panel */}
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

                {/* Preset color buttons */}
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
                  Tip: tap a preset (e.g. Red, Blue) for quick look — use the
                  color picker for fine-tuning.
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
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: COLORS.BASE_WHITE,
                  }}
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
              </div>

              <button
                onClick={applyFilterToAll}
                style={{
                  ...btnSecondary,
                  width: "100%",
                  marginBottom: "15px",
                }}
              >
                Apply Filter
              </button>

              <button
                onClick={handlePrint}
                style={{
                  ...btnPrimary,
                  width: "100%",
                  marginBottom: "15px",
                }}
              >
                Proceed to Print
              </button>

              <button
                onClick={() => {
                  setPhotosTaken([]);
                  setFilter("none"); // remove filter so camera becomes normal
                  lastAppliedFilterRef.current = {
                    filter: null,
                    photosCount: 0,
                  };
                  setStep("capture");
                }}
                style={{
                  ...btnSecondary,
                  width: "100%",
                }}
              >
                Retake Photos
              </button>

              <button
                onClick={downloadStrip}
                style={{
                  ...btnPrimary,
                  width: "100%",
                  marginTop: "12px",
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAGE 5: PRINTING */}
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
            Printing {copies} Copies
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
