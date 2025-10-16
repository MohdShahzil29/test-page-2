import logoImage from "../assets/Logo_updated.svg";

export default function StartScreen({ setStep, btnPrimary, COLORS }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
        padding: "20px",
        background: `linear-gradient(135deg, ${
          COLORS.PRIMARY_BLUE || "#528bad"
        } 0%, ${COLORS.BUTTON_DEEP_BLUE || "#0378b5"} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Retro Grid Pattern Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 40px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 0px,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px,
              transparent 40px
            )
          `,
          pointerEvents: "none",
        }}
      />

      {/* Main Polaroid Card */}
      <div
        style={{
          background: COLORS.BASE_BACKGROUND || "#FFFFFF",
          padding: "25px 25px 80px 25px",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)",
          transform: "rotate(-2deg)",
          position: "relative",
          maxWidth: "400px",
          width: "90%",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "rotate(0deg) translateY(-10px)";
          e.currentTarget.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotate(-2deg)";
          e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.3)";
        }}
      >
        {/* Photo Area */}
        <div
          style={{
            background: `linear-gradient(180deg, ${
              COLORS.BASE_BACKGROUND || "#FFFFFF"
            } 0%, ${COLORS.LIGHT_BACKGROUND || "#dee3f6"} 100%)`,
            padding: "60px 40px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "350px",
            border: `1px solid ${COLORS.LIGHT_GREY || "#f2f2f2"}`,
          }}
        >
          {/* Logo Image - Larger Size */}
          <img
            src={logoImage}
            alt="Logo"
            style={{
              width: "280px",
              height: "280px",
              filter: "drop-shadow(0 8px 12px rgba(0, 0, 0, 0.15))",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Handwritten Style Caption Area */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              fontFamily: "'Brush Script MT', cursive",
              fontSize: "1.3rem",
              color: COLORS.TEXT_BLACK || "#000000",
              margin: "0",
              fontStyle: "italic",
            }}
          >
            Ready for your close-up?
          </p>
        </div>

        {/* Retro Button with Your btnPrimary Styles */}
        <button
          onClick={() => setStep("select")}
          style={{
            ...btnPrimary,
            width: "100%",
            padding: "18px 40px",
            fontSize: "1.3rem",
            fontWeight: "bold",
            fontFamily: "'Arial Black', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "2px",
            background: `linear-gradient(135deg, ${
              COLORS.PRIMARY_BLUE || "#528bad"
            } 0%, ${COLORS.BUTTON_DEEP_BLUE || "#0378b5"} 100%)`,
            color: COLORS.BASE_BACKGROUND || "#FFFFFF",
            border: `4px solid ${COLORS.BASE_BACKGROUND || "#FFFFFF"}`,
            borderRadius: "0",
            boxShadow: `0 6px 20px rgba(5, 120, 181, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(5, 120, 181, 0.5), inset 0 -4px 0 rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(5, 120, 181, 0.4), inset 0 -4px 0 rgba(0, 0, 0, 0.2)";
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = "translateY(2px)";
            e.currentTarget.style.boxShadow =
              "0 2px 10px rgba(5, 120, 181, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.2)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(5, 120, 181, 0.5), inset 0 -4px 0 rgba(0, 0, 0, 0.2)";
          }}
        >
          📸 Start
        </button>

        {/* Tape Effects with Accent Yellow */}
        <div
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            transform: "translateX(-50%) rotate(-5deg)",
            width: "100px",
            height: "30px",
            background: `${COLORS.ACCENT_YELLOW || "#facc0b"}40`,
            border: `1px solid ${COLORS.ACCENT_YELLOW || "#facc0b"}60`,
            backdropFilter: "blur(2px)",
          }}
        />
      </div>

      {/* Decorative Polaroid Frame - Right Bottom with Camera */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "60px",
          width: "150px",
          height: "180px",
          background: COLORS.BASE_BACKGROUND || "#FFFFFF",
          padding: "10px 10px 40px 10px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          transform: "rotate(15deg)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: COLORS.LIGHT_GREY || "#f2f2f2",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400&h=400&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Decorative Polaroid Frame - Left Top with Camera */}
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "80px",
          width: "120px",
          height: "150px",
          background: COLORS.BASE_BACKGROUND || "#FFFFFF",
          padding: "8px 8px 35px 8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          transform: "rotate(-12deg)",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: COLORS.LIGHT_GREY || "#f2f2f2",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    </div>
  );
}
