const A0 = (Netlify.env.get("TARGET_DOMAIN") || "").replace(/\/$/, "");

const B0 = new Set([
  "host","connection","keep-alive","proxy-authenticate","proxy-authorization",
  "te","trailer","transfer-encoding","upgrade","forwarded",
  "x-forwarded-host","x-forwarded-proto","x-forwarded-port"
]);

export default async function Z9(Q1) {
  if (!A0) return new Response("Service not configured", { status: 500 });

  try {
    const U2 = new URL(Q1.url);
    const U3 = A0 + U2.pathname + U2.search;
    const H1 = new Headers();
    let I0 = null;

    for (const [K1, V1] of Q1.headers) {
      const L0 = K1.toLowerCase();

      if (B0.has(L0)) continue;
      if (L0.startsWith("x-nf-")) continue;
      if (L0.startsWith("x-netlify-")) continue;

      if (L0 === "x-real-ip") {
        I0 = V1;
        continue;
      }

      if (L0 === "x-forwarded-for") {
        if (!I0) I0 = V1;
        continue;
      }

      H1.set(L0, V1);
    }

    if (I0) H1.set("x-forwarded-for", I0);

    const M0 = Q1.method;
    const O1 = {
      method: M0,
      headers: H1,
      redirect: "manual"
    };

    if (M0 !== "GET" && M0 !== "HEAD") {
      O1.body = Q1.body;
    }

    const R1 = await fetch(U3, O1);
    const H2 = new Headers();

    for (const [K2, V2] of R1.headers) {
      if (K2.toLowerCase() === "transfer-encoding") continue;
      H2.set(K2, V2);
    }

    return new Response(R1.body, {
      status: R1.status,
      headers: H2
    });
  } catch {
    return new Response("Service unavailable", { status: 502 });
  }
}
