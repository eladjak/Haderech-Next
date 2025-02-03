export class NextResponse {
  constructor(body: any, init?: ResponseInit) {
    return new Response(body, init);
  }

  static json(data: any, init?: ResponseInit) {
    const jsonStr = JSON.stringify(data);
    return new Response(jsonStr, {
      ...init,
      headers: {
        ...init?.headers,
        "content-type": "application/json",
      },
    });
  }

  static redirect(url: string | URL, init?: ResponseInit) {
    return new Response(null, {
      ...init,
      status: 302,
      headers: {
        ...init?.headers,
        Location: url.toString(),
      },
    });
  }
}
