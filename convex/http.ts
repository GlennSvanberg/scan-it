import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

function corsHeaders(request: Request): Headers {
  const origin = request.headers.get("Origin");
  const h = new Headers();
  if (origin) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  } else {
    h.set("Access-Control-Allow-Origin", "*");
  }
  return h;
}

const http = httpRouter();

http.route({
  path: "/desk/end",
  method: "OPTIONS",
  handler: httpAction((_, request) => {
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null
    ) {
      const h = corsHeaders(request);
      h.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      h.set("Access-Control-Allow-Headers", "Content-Type");
      h.set("Access-Control-Max-Age", "86400");
      return Promise.resolve(new Response(null, { status: 204, headers: h }));
    }
    return Promise.resolve(
      new Response(null, { status: 204, headers: corsHeaders(request) }),
    );
  }),
});

http.route({
  path: "/desk/end",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const headers = corsHeaders(request);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(null, { status: 400, headers });
    }
    if (
      typeof body !== "object" ||
      body === null ||
      typeof (body as { publicId?: unknown }).publicId !== "string" ||
      typeof (body as { deskToken?: unknown }).deskToken !== "string"
    ) {
      return new Response(null, { status: 400, headers });
    }
    const { publicId, deskToken } = body as {
      publicId: string;
      deskToken: string;
    };
    try {
      await ctx.runMutation(api.scanSessions.endSession, {
        publicId,
        deskToken,
      });
    } catch {
      return new Response(null, { status: 403, headers });
    }
    return new Response(null, { status: 204, headers });
  }),
});

export default http;
