"use strict";

const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");

const rootDirectory = __dirname;

function loadEnvironmentFile() {
  const environmentPath = path.join(rootDirectory, ".env");
  if (!fsSync.existsSync(environmentPath)) {
    return;
  }

  const contents = fsSync.readFileSync(environmentPath, "utf8");
  contents.split(/\r?\n/).forEach(function (line) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) {
      return;
    }

    const value = match[2].replace(/^(['"])(.*)\1$/, "$2");
    process.env[match[1]] = value;
  });
}

loadEnvironmentFile();

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
const instagramCacheMilliseconds = Number(process.env.INSTAGRAM_CACHE_MINUTES || 15) * 60 * 1000;
const instagramFields = "caption,media_type,media_url,permalink,thumbnail_url,timestamp";

let instagramCache = {
  expiresAt: 0,
  payload: null
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

async function getInstagramFeed() {
  if (!instagramAccessToken) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured.");
  }

  if (instagramCache.payload && instagramCache.expiresAt > Date.now()) {
    return instagramCache.payload;
  }

  const parameters = new URLSearchParams({
    access_token: instagramAccessToken,
    fields: instagramFields,
    limit: "6"
  });
  const apiUrl = "https://graph.instagram.com/me/media?" + parameters;
  const instagramResponse = await fetch(apiUrl, {
    headers: { Accept: "application/json" }
  });

  if (!instagramResponse.ok) {
    throw new Error("Instagram API returned status " + instagramResponse.status + ".");
  }

  const instagramPayload = await instagramResponse.json();
  const media = (instagramPayload.data || []).map(function (item) {
    return {
      caption: item.caption || "",
      media_type: item.media_type,
      media_url: item.media_url,
      permalink: item.permalink,
      thumbnail_url: item.thumbnail_url || null,
      timestamp: item.timestamp
    };
  }).filter(function (item) {
    return item.media_url && item.permalink;
  }).slice(0, 6);

  instagramCache = {
    expiresAt: Date.now() + instagramCacheMilliseconds,
    payload: { data: media }
  };

  return instagramCache.payload;
}

async function serveFile(requestPath, response) {
  const requestedPage = requestPath === "/" ? "/index.html" : requestPath;
  const normalizedPath = path.normalize(decodeURIComponent(requestedPage)).replace(/^[/\\]+/, "");
  const filePath = path.join(rootDirectory, normalizedPath);
  const relativePath = path.relative(rootDirectory, filePath);
  const pathSegments = relativePath.split(path.sep);
  const extension = path.extname(filePath).toLowerCase();

  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath) ||
    pathSegments.some(function (segment) { return segment.startsWith("."); }) ||
    !contentTypes[extension] ||
    (extension === ".js" && relativePath !== "footer.js")
  ) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const contents = await fs.readFile(filePath);
    const contentType = contentTypes[extension];
    response.writeHead(200, {
      "Cache-Control": contentType.startsWith("text/html") ? "no-cache" : "public, max-age=3600",
      "Content-Type": contentType
    });
    response.end(contents);
  } catch (error) {
    if (error.code === "ENOENT") {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    throw error;
  }
}

const server = http.createServer(async function (request, response) {
  const url = new URL(request.url, "http://" + request.headers.host);

  if (url.pathname === "/api/instagram-feed") {
    if (request.method !== "GET") {
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    try {
      const payload = await getInstagramFeed();
      response.writeHead(200, {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
        "Content-Type": "application/json; charset=utf-8"
      });
      response.end(JSON.stringify(payload));
      return;
    } catch (error) {
      console.error(error.message);
      sendJson(response, 503, { error: "Instagram feed is temporarily unavailable." });
      return;
    }
  }

  try {
    await serveFile(url.pathname, response);
  } catch (error) {
    console.error(error.message);
    sendJson(response, 500, { error: "The website could not load this resource." });
  }
});

server.listen(port, host, function () {
  console.log("Caitlin Gregory Photography website running at http://" + host + ":" + port);
});
