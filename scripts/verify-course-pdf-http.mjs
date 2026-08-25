#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  await readFile(join(scriptDirectory, "course-pdf-manifest.json"), "utf8"),
);

const baseIndex = process.argv.indexOf("--base-url");
const baseUrl = new URL(
  baseIndex >= 0 ? process.argv[baseIndex + 1] : "http://localhost:3000",
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyAnonymousDenial(file) {
  const url = new URL(
    `/api/course-pdfs/course_negative_control/lesson_negative_control/${encodeURIComponent(file.fileName)}`,
    baseUrl,
  );
  const response = await fetch(url, { redirect: "manual" });
  assert(
    response.status === 401 || response.status === 404,
    `${file.fileName}: anonymous protected route expected 401/404, got ${response.status}`,
  );

  return {
    fileName: file.fileName,
    url: url.href,
    status: response.status,
  };
}

try {
  assert(manifest.version === 2, "Unsupported course PDF manifest version");
  assert(typeof manifest.mappingVersion === "string", "Missing PDF mappingVersion");
  assert(Array.isArray(manifest.files) && manifest.files.length === 8, "Expected 8 manifest files");

  const files = [];
  for (const file of manifest.files) {
    files.push(await verifyAnonymousDenial(file));
  }

  const oldPublicResponse = await fetch(
    new URL(`/pdfs/${encodeURIComponent(manifest.files[0].fileName)}`, baseUrl),
    { redirect: "manual" },
  );
  assert(oldPublicResponse.status === 404, `Old public PDF URL returned ${oldPublicResponse.status}`);

  const traversalResponse = await fetch(
    new URL(
      "/api/course-pdfs/course_negative_control/lesson_negative_control/..%2Fpackage.json",
      baseUrl,
    ),
    { redirect: "manual" },
  );
  assert(
    traversalResponse.status !== 200,
    "Encoded path-traversal negative control unexpectedly returned HTTP 200",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl: baseUrl.href,
        count: files.length,
        files,
        negativeControls: {
          oldPublicAssetStatus: oldPublicResponse.status,
          encodedTraversalStatus: traversalResponse.status,
        },
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        baseUrl: baseUrl.href,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
