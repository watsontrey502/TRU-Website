import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TRÜ Dating Nashville — Curated Dating Events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2C4A3E",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at top right, rgba(184,115,51,0.15), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(30,50,40,0.8) 0%, transparent 50%, rgba(30,50,40,0.6) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #B87333, #D4935A, #B87333)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 700,
              color: "white",
              letterSpacing: "0.05em",
              lineHeight: 1,
            }}
          >
            TRÜ
          </div>

          <div
            style={{
              width: 80,
              height: 2,
              backgroundColor: "#D4935A",
              marginTop: 24,
              marginBottom: 24,
            }}
          />

          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.7)",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            Dating Done Differently
          </div>

          <div
            style={{
              fontSize: 18,
              color: "#D4935A",
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              marginTop: 16,
            }}
          >
            Nashville, Tennessee
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.1em",
            }}
          >
            trudating.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
