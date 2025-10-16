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
      <p style={{ color: "#666", textAlign: "center", marginBottom: "30px" }}>
        Your photo strip is being printed. Please wait...
      </p>
      <button onClick={resetApp} style={btnPrimary}>
        Start Over
      </button>
    </div>
  );
}
