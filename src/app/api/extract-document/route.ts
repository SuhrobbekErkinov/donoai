import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/require-auth";
import { extractDocumentText } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Gemini reads these directly. Plain text is handled without an API call.
const GEMINI_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
]);

export async function POST(req: NextRequest) {
  await requireUser();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "File too large (max 10 MB)" },
      { status: 413 },
    );
  }

  const mimeType = (file.type || "application/octet-stream").split(";")[0].trim();
  const buf = Buffer.from(await file.arrayBuffer());

  // Plain text: no AI needed — read directly.
  if (TEXT_TYPES.has(mimeType)) {
    return Response.json({ content: buf.toString("utf8").slice(0, 80_000) });
  }

  if (!GEMINI_TYPES.has(mimeType)) {
    return Response.json(
      {
        error:
          "Unsupported file type. Upload a PDF, image (PNG/JPG/WEBP), or text file.",
      },
      { status: 415 },
    );
  }

  try {
    const content = await extractDocumentText({
      base64: buf.toString("base64"),
      mimeType,
    });
    if (!content) {
      return Response.json(
        { error: "Couldn't extract any text from that document" },
        { status: 422 },
      );
    }
    return Response.json({ content: content.slice(0, 80_000) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Extraction failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
