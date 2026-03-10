import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: "#2C4A3E",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#D4935A",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size }
  );
}
