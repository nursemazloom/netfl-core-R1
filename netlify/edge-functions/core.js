const _0xA = (Netlify.env.get("TARGET_DOMAIN") || "").replace(/\/$/, "");

const _0xB = new Set([
  "host","connection","keep-alive","proxy-authenticate","proxy-authorization",
  "te","trailer","transfer-encoding","upgrade","forwarded",
  "x-forwarded-host","x-forwarded-proto","x-forwarded-port"
]);

export default async function _0xC(_0xD) {
  if (!_0xA) return new Response("Service not configured", { status: 500 });

  try {
    const _0xE = new URL(_0xD.url);
    const _0xF = _0xA + _0xE.pathname + _0xE.search;
    const _0xG = new Headers();
    let _0xH = null;

    for (const [_0xI, _0xJ] of _0xD.headers) {
      const _0xK = _0xI.toLowerCase();

      if (_0xB.has(_0xK)) continue;
      if (_0xK.startsWith("x-nf-")) continue;
      if (_0xK.startsWith("x-netlify-")) continue;

      if (_0xK === "x-real-ip") {
        _0xH = _0xJ;
        continue;
      }

      if (_0xK === "x-forwarded-for") {
        if (!_0xH) _0xH = _0xJ;
        continue;
      }

      _0xG.set(_0xK, _0xJ);
    }

    if (_0xH) _0xG.set("x-forwarded-for", _0xH);

    const _0xL = _0xD.method;
    const _0xM = {
      method: _0xL,
      headers: _0xG,
      redirect: "manual"
    };

    if (_0xL !== "GET" && _0xL !== "HEAD") {
      _0xM.body = _0xD.body;
    }

    const _0xN = await fetch(_0xF, _0xM);
    const _0xO = new Headers();

    for (const [_0xP, _0xQ] of _0xN.headers) {
      if (_0xP.toLowerCase() === "transfer-encoding") continue;
      _0xO.set(_0xP, _0xQ);
    }

    return new Response(_0xN.body, {
      status: _0xN.status,
      headers: _0xO
    });
  } catch (_) {
    return new Response("Service unavailable", { status: 502 });
  }
}
