/** Small helpers for Netlify Functions v2 (Web Request/Response). */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

/** A user-safe error payload. Never leak internal messages to the client. */
export function errorResponse(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status);
}

export function methodNotAllowed(allow = "POST"): Response {
  return new Response(JSON.stringify({ error: { code: "method_not_allowed", message: "Method not allowed" } }), {
    status: 405,
    headers: { ...JSON_HEADERS, allow },
  });
}

/** Parse a JSON body, returning undefined on any parse failure. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return undefined;
  }
}

/** A short correlation id for tracing one request across logs. */
export function correlationId(): string {
  return crypto.randomUUID().slice(0, 8);
}
