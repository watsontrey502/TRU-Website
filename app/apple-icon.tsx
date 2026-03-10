import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          backgroundColor: "#2C4A3E",
          borderRadius: 36,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            lineHeight: 1,
            letterSpacing: "0.02em",
          }}
        >
          TRÜ
        </div>
        <div
          style={{
            width: 40,
            height: 2,
            backgroundColor: "#D4935A",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
