import { NextRequest, NextResponse } from "next/server";
import { getBackendUrlServer } from "@/lib/getBackendUrlServer";

const API_BASE_URL = getBackendUrlServer();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/users/bulk-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ message: "Bulk create failed" }));
    if (!response.ok) {
      return NextResponse.json({ error: data.message || data.error || "Bulk create failed" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error bulk creating users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
