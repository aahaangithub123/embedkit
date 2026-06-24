import { NextRequest, NextResponse } from "next/server";
import { parseIntent } from "../../../lib/ai/parseIntent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = body?.input;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json({ error: "input required" }, { status: 400 });
    }

    const constraints = await parseIntent(input);
    return NextResponse.json({ constraints });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/parse-intent]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Only POST is valid
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
