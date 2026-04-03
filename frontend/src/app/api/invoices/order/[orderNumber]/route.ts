import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/**
 * Proxies GET /api/invoices/order/:orderNumber → backend GET /api/invoices/order/:orderNumber
 * (see backend/routes/invoiceRoutes.js — getInvoicesByOrder).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const encoded = encodeURIComponent(orderNumber);
    const authHeader = req.headers.get("authorization");
    const companyId = req.headers.get("x-company-id");

    const response = await fetch(`${BACKEND_URL}/api/invoices/order/${encoded}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
        ...(companyId && { "x-company-id": companyId }),
      },
    });

    const data = await response.json().catch(() => ({
      message: "Failed to fetch invoices for order",
    }));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/invoices/order/[orderNumber]:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
