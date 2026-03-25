const DEFAULT_SESSION_COOKIE = "tesgar_session";
const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const LOGIN_PATH = "/login";
const LOGIN_ASSET_PATH = "/login.html";
const LOGOUT_PATH = "/logout";
const PRIVATE_MEDIA_PREFIX = "/private-media/";
const PRIVATE_MEDIA_UPLOAD_PATH = "/api/private-media";
const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const configError = validateConfig(env);

  if (configError) {
    return new Response(configError, { status: 500 });
  }

  if (isLoginPath(url.pathname)) {
    if (request.method === "GET") {
      const hasSession = await hasValidSession(request, env);
      if (hasSession) {
        return redirect(safeNext(url.searchParams.get("next")));
      }

      return serveAsset(request, env, LOGIN_ASSET_PATH);
    }

    if (request.method === "POST") {
      return handleLogin(request, env);
    }

    return methodNotAllowed(["GET", "POST"]);
  }

  if (url.pathname === LOGOUT_PATH) {
    return handleLogout(env);
  }

  const hasSession = await hasValidSession(request, env);
  if (!hasSession) {
    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Unauthorized" }, 401);
    }

    return redirect(buildLoginRedirect(url));
  }

  if (url.pathname === PRIVATE_MEDIA_UPLOAD_PATH) {
    if (request.method !== "POST") {
      return methodNotAllowed(["POST"]);
    }

    return handlePrivateUpload(request, env);
  }

  if (url.pathname.startsWith(PRIVATE_MEDIA_PREFIX)) {
    return handlePrivateMedia(request, env);
  }

  return serveAsset(request, env);
}

function validateConfig(env) {
  if (!env.ASSETS) {
    return "Missing ASSETS binding.";
  }

  if (!env.PRIVATE_MEDIA) {
    return "Missing PRIVATE_MEDIA R2 binding.";
  }

  if (!env.SITE_PASSWORD) {
    return "Missing SITE_PASSWORD secret.";
  }

  if (!env.SESSION_SECRET) {
    return "Missing SESSION_SECRET secret.";
  }

  return null;
}

async function handleLogin(request, env) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const next = safeNext(formData.get("next"));

  if (password !== env.SITE_PASSWORD) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("error", "1");
    if (next !== "/") {
      loginUrl.searchParams.set("next", next);
    }

    return redirect(loginUrl.pathname + loginUrl.search, 302);
  }

  const sessionCookie = await createSessionCookie(env);
  return redirect(next, 302, {
    "Set-Cookie": sessionCookie
  });
}

function handleLogout(env) {
  return redirect(LOGIN_PATH, 302, {
    "Set-Cookie": serializeCookie(getSessionCookieName(env), "", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 0
    })
  });
}

async function handlePrivateUpload(request, env) {
  const formData = await request.formData();
  const file = formData.get("file");
  const folder = sanitizeFolder(formData.get("folder"));

  if (!(file instanceof File)) {
    return json({ error: "No se ha recibido ningun archivo." }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return json({ error: "Solo se admiten imagenes." }, 400);
  }

  const key = buildObjectKey(folder, file.name, file.type);

  await env.PRIVATE_MEDIA.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
      cacheControl: "private, no-store"
    }
  });

  return json({
    key,
    url: `${PRIVATE_MEDIA_PREFIX}${encodeURI(key)}`
  });
}

async function handlePrivateMedia(request, env) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.slice(PRIVATE_MEDIA_PREFIX.length));

  if (!key) {
    return new Response("Not Found", { status: 404 });
  }

  const object = await env.PRIVATE_MEDIA.get(key);
  if (!object) {
    return new Response("Not Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie");

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", guessContentType(key));
  }

  return new Response(object.body, {
    status: 200,
    headers
  });
}

function serveAsset(request, env, forcedPath) {
  const url = new URL(request.url);
  const assetPath = forcedPath || mapAssetPath(url.pathname);
  const assetUrl = new URL(assetPath, url.origin);
  return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
}

function mapAssetPath(pathname) {
  if (pathname === "/") {
    return "/index.html";
  }

  if (pathname.endsWith("/") && pathname !== "/") {
    return `${pathname}index.html`;
  }

  if (pathname.startsWith("/planes/") && !pathname.split("/").pop().includes(".")) {
    return `${pathname}.html`;
  }

  return pathname;
}

function buildLoginRedirect(url) {
  const loginUrl = new URL(LOGIN_PATH, url.origin);
  const next = `${url.pathname}${url.search}`;

  if (next !== "/") {
    loginUrl.searchParams.set("next", next);
  }

  return `${loginUrl.pathname}${loginUrl.search}`;
}

function safeNext(rawNext) {
  if (typeof rawNext !== "string" || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/";
  }

  return rawNext;
}

function isLoginPath(pathname) {
  return pathname === LOGIN_PATH || pathname === LOGIN_ASSET_PATH;
}

function getSessionCookieName(env) {
  return env.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE;
}

function getSessionTtlSeconds(env) {
  const ttl = Number(env.SESSION_TTL_SECONDS || DEFAULT_SESSION_TTL_SECONDS);
  return Number.isFinite(ttl) && ttl > 0 ? ttl : DEFAULT_SESSION_TTL_SECONDS;
}

async function hasValidSession(request, env) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const sessionValue = cookies[getSessionCookieName(env)];

  if (!sessionValue) {
    return false;
  }

  const [expiresAt, signature] = sessionValue.split(".");
  if (!expiresAt || !signature) {
    return false;
  }

  const expiresAtNumber = Number(expiresAt);
  if (!Number.isFinite(expiresAtNumber) || expiresAtNumber <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expectedSignature = await signSessionValue(expiresAt, env.SESSION_SECRET);
  return timingSafeEqual(signature, expectedSignature);
}

async function createSessionCookie(env) {
  const expiresAt = String(Math.floor(Date.now() / 1000) + getSessionTtlSeconds(env));
  const signature = await signSessionValue(expiresAt, env.SESSION_SECRET);
  const value = `${expiresAt}.${signature}`;

  return serializeCookie(getSessionCookieName(env), value, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: getSessionTtlSeconds(env)
  });
}

async function signSessionValue(value, secret) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function parseCookies(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(";").forEach((part) => {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) {
      return;
    }

    cookies[name] = valueParts.join("=");
  });

  return cookies;
}

function serializeCookie(name, value, options) {
  const parts = [`${name}=${value}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

function sanitizeFolder(folderValue) {
  const value = typeof folderValue === "string" ? folderValue : "timeline";

  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/") || "timeline";
}

function sanitizeSegment(segment) {
  return String(segment)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildObjectKey(folder, fileName, mimeType) {
  const extension = resolveExtension(fileName, mimeType);
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = crypto.randomUUID().slice(0, 8);
  return `${folder}/${stamp}-${random}.${extension}`;
}

function resolveExtension(fileName, mimeType) {
  const name = String(fileName || "");

  if (name.includes(".")) {
    const extension = name.split(".").pop().toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (extension) {
      return extension === "jpeg" ? "jpg" : extension;
    }
  }

  return extensionFromMimeType(mimeType);
}

function extensionFromMimeType(mimeType) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "jpg";
  }
}

function guessContentType(key) {
  const extension = key.split(".").pop().toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

function redirect(location, status = 302, extraHeaders = {}) {
  return new Response(null, {
    status,
    headers: {
      Location: location,
      ...extraHeaders
    }
  });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function methodNotAllowed(allowedMethods) {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: allowedMethods.join(", ")
    }
  });
}
