import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/require-auth";
import { getLocale } from "@/lib/i18n/server";
import { transcribeAudio } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB — generous for short voice clips

export async function POST(req: NextRequest) {
  await requireUser();
  const locale = await getLocale();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("audio");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "No audio provided" }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "Empty recording" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Recording too long" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  // file.type is e.g. "audio/webm;codecs=opus" — strip codec for the API.
  const mimeType = (file.type || "audio/webm").split(";")[0];

  try {
    const text = await transcribeAudio({ base64, mimeType, locale });
    return Response.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transcription failed";
    return Response.json({ error: msg }, { status: 500 });
  }
}
