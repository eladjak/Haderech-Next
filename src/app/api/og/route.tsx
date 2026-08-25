export const runtime = "edge";

// The former endpoint rendered certificate-looking images from arbitrary query
// parameters. A share image must be derived from a verified server-side
// certificate record, not from user-controlled name/course/certificate fields.
// Keep the route retired until that signed lookup exists.
export async function GET() {
  return Response.json(
    {
      error: "certificate_share_image_unavailable",
      message: "תמונת שיתוף תופעל רק לאחר אימות תעודה בצד השרת.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }
  );
}
