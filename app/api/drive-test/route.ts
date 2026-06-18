export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { google } from "googleapis";
import fs from "fs";

export async function GET() {
  try {
    const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "./service_account.json";

    if (!fs.existsSync(keyFile)) {
      return NextResponse.json(
        { ok: false, error: "Service account JSON not found" },
        { status: 500 }
      );
    }

    const creds = JSON.parse(fs.readFileSync(keyFile, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ["https://www.googleapis.com/auth/drive"]
    });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
      q: "name = 'TurboAgent' and mimeType = 'application/vnd.google-apps.folder'",
      fields: "files(id, name)"
    });

    return NextResponse.json({ ok: true, results: res.data.files });

  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
