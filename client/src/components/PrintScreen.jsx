// export default function PrintScreen({
//   printCopies,
//   resetApp,
//   btnPrimary,
//   COLORS,
// }) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         maxWidth: "600px",
//         padding: "20px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "60vh",
//       }}
//     >
//       <h2 style={{ color: COLORS.TEXT_BLACK, marginBottom: "30px" }}>
//         Printing {printCopies} Copies
//       </h2>
//       <div
//         style={{
//           width: "100px",
//           height: "100px",
//           border: "5px solid #f3f3f3",
//           borderTop: `5px solid ${COLORS.ACCENT_YELLOW}`,
//           borderRadius: "50%",
//           animation: "spin 1s linear infinite",
//           marginBottom: "30px",
//         }}
//       />
//       <p style={{ color: "#666", textAlign: "center", marginBottom: "30px" }}>
//         Your photo strip is being printed. Please wait...
//       </p>
//       <button onClick={resetApp} style={btnPrimary}>
//         Start Over
//       </button>
//     </div>
//   );
// }

export default function PrintScreen({
  printCopies,
  resetApp,
  btnPrimary,
  COLORS,
}) {
  return (
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

      {/* Printer Animation Container */}
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "150px",
          marginBottom: "40px",
        }}
      >
        {/* Printer Body */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "180px",
            height: "80px",
            backgroundColor: "#34495e",
            borderRadius: "8px 8px 0 0",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 2,
          }}
        >
          {/* Printer Top Light */}
          <div
            style={{
              position: "absolute",
              top: "15px",
              right: "20px",
              width: "12px",
              height: "12px",
              backgroundColor: COLORS.ACCENT_YELLOW,
              borderRadius: "50%",
              animation: "blink 1s ease-in-out infinite",
            }}
          />

          {/* Printer Lines */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "20px",
              right: "20px",
              height: "3px",
              backgroundColor: "#2c3e50",
              borderRadius: "2px",
            }}
          />
        </div>

        {/* Paper Coming Out */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "140px",
            height: "100px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "0 0 4px 4px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            animation: "printPaper 2s ease-in-out infinite",
            zIndex: 1,
          }}
        >
          {/* Printed Lines on Paper */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "80%",
                height: "3px",
                backgroundColor: "#333",
                margin: `${15 + i * 12}px auto 0`,
                borderRadius: "2px",
                opacity: 0,
                animation: `fadeInLine 2s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      <p style={{ color: "#666", textAlign: "center", marginBottom: "30px" }}>
        Your photo strip is being printed. Please wait...
      </p>

      <button onClick={resetApp} style={btnPrimary}>
        Start Over
      </button>

      {/* Inline Keyframes */}
      <style>{`
        @keyframes printPaper {
          0% {
            transform: translateX(-50%) translateY(50px);
          }
          50% {
            transform: translateX(-50%) translateY(0px);
          }
          100% {
            transform: translateX(-50%) translateY(50px);
          }
        }

        @keyframes fadeInLine {
          0%, 30% {
            opacity: 0;
            transform: scaleX(0);
          }
          60% {
            opacity: 1;
            transform: scaleX(1);
          }
          100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
