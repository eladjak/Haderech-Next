import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CourseOGImage({ params }: { params: { courseId: string } }) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1E3A5F 0%, #E85D75 100%)",
          fontFamily: "sans-serif",
          direction: "rtl",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 60px",
            background: "rgba(255,255,255,0.95)",
            borderRadius: "24px",
            maxWidth: "900px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ fontSize: 28, color: "#E85D75", marginBottom: 12, fontWeight: 600 }}>
            {"\u05D4\u05D3\u05E8\u05DA - \u05D0\u05D5\u05DE\u05E0\u05D5\u05EA \u05D4\u05E7\u05E9\u05E8"}
          </div>
          <div style={{ fontSize: 48, color: "#1E3A5F", fontWeight: 800, textAlign: "center", lineHeight: 1.3 }}>
            {"\u05E7\u05D5\u05E8\u05E1 \u05D3\u05D9\u05D9\u05D8\u05D9\u05E0\u05D2 \u05D5\u05D6\u05D5\u05D2\u05D9\u05D5\u05EA"}
          </div>
          <div style={{ fontSize: 20, color: "#6B7280", marginTop: 16 }}>
            {"\u05EA\u05D5\u05DB\u05E0\u05D9\u05EA 12 \u05E9\u05D1\u05D5\u05E2\u05D5\u05EA | 73 \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D5\u05D9\u05D3\u05D0\u05D5 | AI + \u05E1\u05D9\u05DE\u05D5\u05DC\u05D8\u05D5\u05E8"}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
