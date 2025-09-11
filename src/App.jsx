import React, { useEffect, useRef, useState } from "react";

export default function Polaroidish() {
  // refs
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null);
  const filterCanvasRef = useRef(null);
  const streamRef = useRef(null);

  // UI state
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [totalFrames, setTotalFrames] = useState(4);
  const [filter, setFilter] = useState("none");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [photosTaken, setPhotosTaken] = useState([]);
  const [webcamStarted, setWebcamStarted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState("start");
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const lastAppliedFilterRef = useRef({ filter: null, photosCount: 0 });

  // Layout configurations for vertical templates only
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

  // Templates (vertical only)
  const templates = [
    { id: "4v", label: "4 Photos", frames: 4, layout: "vertical" },
    { id: "6v", label: "6 Photos", frames: 6, layout: "vertical" },
    { id: "8v", label: "8 Photos", frames: 8, layout: "vertical" },
  ];

  // Copy options
  const copyOptions = [2, 4, 6];
  const [copies, setCopies] = useState(2);

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
    setBgColor("#ffffff");
    setTotalFrames(4);
    setCopies(2);
    setSelectedTemplate(null);
    setStep("start");
  }

  // Webcam functions
  async function startWebcam() {
    if (webcamStarted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          aspectRatio: selectedTemplate
            ? layouts.vertical[selectedTemplate.frames].aspectRatio
            : 3 / 4,
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      clearTimeout(autoAdvanceTimer);
    };
  }, [autoAdvanceTimer]);

  // Start webcam when entering capture step
  useEffect(() => {
    if (step === "capture") {
      setPhotosTaken([]);
      setTimeout(() => startWebcam(), 150);
    } else {
      stopWebcam();
    }
  }, [step]);

  // Apply filter to preview
  useEffect(() => {
    // only act when we're in preview and we have at least one photo
    if (step !== "preview" || photosTaken.length === 0) return;

    // if same filter already applied to the same number of photos, skip
    if (
      lastAppliedFilterRef.current.filter === filter &&
      lastAppliedFilterRef.current.photosCount === photosTaken.length
    ) {
      return;
    }

    // schedule apply (keeps your small delay)
    const t = setTimeout(() => {
      applyFilterToAll();
      // mark that we've applied this filter for this number of photos
      lastAppliedFilterRef.current = {
        filter,
        photosCount: photosTaken.length,
      };
    }, 120);

    return () => clearTimeout(t);
  }, [filter, step, photosTaken.length]); // note: depend on length only

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
  }, [step, photosTaken, filter, webcamStarted]);

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

  // Canvas filter string
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

  // Draw image with center crop
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

  // Capture photo
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

    // Mirror the image (for natural feel during capture)
    rawCtx.translate(w, 0);
    rawCtx.scale(-1, 1);
    rawCtx.drawImage(v, 0, 0, w, h);
    rawCtx.setTransform(1, 0, 0, 1, 0, 0);

    const rawData = rawCanvas.toDataURL("image/jpeg", 0.95);

    // Create filtered version
    const filteredData = await makeFilteredDataUrl(rawData, filter, w, h);

    // Flash effect
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

  // Create filtered image
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

        // Draw image without mirroring for final output
        drawImageCover(ctx, img, c.width, c.height, 0, 0);

        const out = c.toDataURL("image/jpeg", 0.95);
        resolve(out);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  }

  // Apply filter to all photos
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

  // Download composed strip
  async function downloadStrip() {
    const usingLayout = layouts.vertical[totalFrames];
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
              const x = 20 + column * (usingLayout.photoWidth + 20);
              const y = 20 + row * (usingLayout.photoHeight + 20);
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

  // Print function
  function handlePrint() {
    setStep("print");
    // Simulate printing process
    setTimeout(() => {
      showMessage("Printing completed!");
    }, 3000);
  }

  // Button styles
  const btnPrimary = {
    background: "#ffde59",
    color: "#1a1a1a",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "16px",
  };

  const btnSecondary = {
    background: "#3f3f3f",
    color: "#f5e9a5",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  };

  const btnTemplate = {
    background: "#f0f0f0",
    color: "#1a1a1a",
    border: "2px solid #ffde59",
    padding: "15px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    width: "100%",
    margin: "5px 0",
  };

  const btnCopyOption = {
    background: "#f0f0f0",
    color: "#1a1a1a",
    border: "1px solid #ccc",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "5px",
  };

  const btnCopyOptionSelected = {
    ...btnCopyOption,
    background: "#ffde59",
    border: "2px solid #1a1a1a",
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
        background: step === "start" ? "#fceb96" : "#ffffff",
        fontFamily: "'Arial', sans-serif",
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
        #messageBox.show { 
          visibility:visible; 
          opacity:1; 
          top:18px; 
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
          {/* Logo and name - replace with your actual logo */}
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
                backgroundColor: "#ffde59",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "40px",
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              P
            </div>
            <h1
              style={{
                color: "#1a1a1a",
                fontSize: "2.5rem",
                fontWeight: "bold",
                margin: "0 0 10px 0",
              }}
            >
              Polaroidish
            </h1>
            <p
              style={{
                color: "#1a1a1a",
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
          <h2 style={{ color: "#1a1a1a", marginBottom: "30px" }}>
            Select Template
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setTotalFrames(template.frames);
                }}
                style={{
                  ...btnTemplate,
                  backgroundColor:
                    selectedTemplate?.id === template.id
                      ? "#ffde59"
                      : "#f0f0f0",
                }}
              >
                {template.label}
              </button>
            ))}
          </div>

          <h3 style={{ color: "#1a1a1a", marginBottom: "15px" }}>
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
                onClick={() => setCopies(num)}
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
          <h2 style={{ color: "#1a1a1a", marginBottom: "20px" }}>
            Take Photos
          </h2>

          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "600px",
              aspectRatio: selectedTemplate
                ? layouts.vertical[selectedTemplate.frames].aspectRatio
                : 3 / 4,
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

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: "5px 10px",
                borderRadius: "5px",
              }}
            >
              {photosTaken.length} / {totalFrames}
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
              disabled={!webcamStarted || photosTaken.length >= totalFrames}
              style={{
                ...btnPrimary,
                opacity:
                  !webcamStarted || photosTaken.length >= totalFrames ? 0.5 : 1,
              }}
            >
              {photosTaken.length >= totalFrames ? "Done" : "Take Photo"}
            </button>

            <button onClick={() => setStep("select")} style={btnSecondary}>
              Back
            </button>
          </div>

          <p style={{ color: "#666", textAlign: "center" }}>
            Press Space to capture • {photosTaken.length} of {totalFrames}{" "}
            photos taken
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
          <h2 style={{ color: "#1a1a1a", marginBottom: "20px" }}>Preview</h2>

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
                        const src = photosTaken[i]
                          ? photosTaken[i].filtered || photosTaken[i].raw
                          : null;
                        return (
                          <div
                            key={i}
                            style={{
                              width: "100%",
                              height: "100%",
                              backgroundColor: "#f0f0f0",
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
                                  // REMOVED the mirror transformation here
                                  // so photos appear as they were captured
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
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#1a1a1a", marginBottom: "20px" }}>
                Customize
              </h3>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                  }}
                >
                  Background Color
                </label>
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
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
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
                    backgroundColor: "white",
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
                  setStep("capture");
                }}
                style={{
                  ...btnSecondary,
                  width: "100%",
                }}
              >
                Retake Photos
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
          <h2 style={{ color: "#1a1a1a", marginBottom: "30px" }}>
            Printing {copies} Copies
          </h2>

          <div
            style={{
              width: "100px",
              height: "100px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #ffde59",
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
