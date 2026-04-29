const CFG = (Netlify.env.get("TARGET_DOMAIN") || "").replace(/\/$/, "");

const SKIP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);

export default async function main(req) {
  if (!CFG) {
    return new Response("Service not configured", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const target = CFG + url.pathname + url.search;

    const headers = new Headers();
    let clientIp = null;

    for (const [key, value] of req.headers) {
      const k = key.toLowerCase();

      if (SKIP.has(k)) continue;
      if (k.startsWith("x-nf-")) continue;
      if (k.startsWith("x-netlify-")) continue;

      if (k === "x-real-ip") {
        clientIp = value;
        continue;
      }

      if (k === "x-forwarded-for") {
        if (!clientIp) clientIp = value;
        continue;
      }

      headers.set(k, value);
    }

    if (clientIp) headers.set("x-forwarded-for", clientIp);

    const method = req.method;
    const options = {
      method,
      headers,
      redirect: "manual",
    };

    if (method !== "GET" && method !== "HEAD") {
      options.body = req.body;
    }

    const upstream = await fetch(target, options);

    const responseHeaders = new Headers();
    for (const [key, value] of upstream.headers) {
      if (key.toLowerCase() === "transfer-encoding") continue;
      responseHeaders.set(key, value);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response("Service unavailable", { status: 502 });
  }
}
