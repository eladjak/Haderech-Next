import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name") ?? "סטודנט";
  const course = searchParams.get("course") ?? "קורס";
  const cert = searchParams.get("cert") ?? "";
  const date = searchParams.get("date") ?? "";

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
          backgroundColor: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        {/* Border frame */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "1120px",
            height: "560px",
            border: "3px solid #18181b",
            borderRadius: "24px",
            padding: "48px",
            backgroundColor: "#ffffff",
            position: "relative",
          }}
        >
          {/* Corner decorations */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid #10b981",
              borderLeft: "3px solid #10b981",
              borderRadius: "4px 0 0 0",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "40px",
              height: "40px",
              borderTop: "3px solid #10b981",
              borderRight: "3px solid #10b981",
              borderRadius: "0 4px 0 0",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid #10b981",
              borderLeft: "3px solid #10b981",
              borderRadius: "0 0 0 4px",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              width: "40px",
              height: "40px",
              borderBottom: "3px solid #10b981",
              borderRight: "3px solid #10b981",
              borderRadius: "0 0 4px 0",
              display: "flex",
            }}
          />

          {/* Platform name */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#18181b",
              marginBottom: "8px",
              display: "flex",
            }}
          >
            הדרך
          </div>

          {/* Certificate title */}
          <div
            style={{
              fontSize: "18px",
              color: "#71717a",
              marginBottom: "32px",
              display: "flex",
            }}
          >
            תעודת סיום קורס
          </div>

          {/* Checkmark icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "28px",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* User name */}
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#18181b",
              marginBottom: "8px",
              display: "flex",
            }}
          >
            {name}
          </div>

          {/* Completion text */}
          <div
            style={{
              fontSize: "18px",
              color: "#71717a",
              marginBottom: "8px",
              display: "flex",
            }}
          >
            סיים/ה בהצלחה את הקורס
          </div>

          {/* Course name */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#10b981",
              marginBottom: "24px",
              display: "flex",
            }}
          >
            {course}
          </div>

          {/* Footer info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              fontSize: "14px",
              color: "#a1a1aa",
            }}
          >
            {cert && (
              <div style={{ display: "flex" }}>
                תעודה: {cert}
              </div>
            )}
            {date && (
              <div style={{ display: "flex" }}>
                תאריך: {date}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
