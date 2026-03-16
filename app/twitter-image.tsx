import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TRÜ — The Offline Era | Nashville's Members-Only Social Club";
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
          backgroundColor: "#0C0C0D",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at top right, rgba(200,169,126,0.1), transparent 60%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(90deg, #C8A97E, #D8B89A, #C8A97E)",
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
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            TRÜ
          </div>

          <div
            style={{
              width: 80,
              height: 2,
              background: "linear-gradient(90deg, #C8A97E, #D8B89A)",
              marginTop: 24,
              marginBottom: 24,
            }}
          />

          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
            }}
          >
            The Offline Era
          </div>

          <div
            style={{
              fontSize: 18,
              color: "#C8A97E",
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
            trudatingnashville.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
