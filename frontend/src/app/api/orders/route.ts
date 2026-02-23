import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrlServer } from '@/lib/getBackendUrlServer';

const getApiBaseUrl = () => {
  return getBackendUrlServer();
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("company_id");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customer_id");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    // Build query string
    const queryParams = new URLSearchParams();
    if (companyId) queryParams.append("company_id", companyId);
    if (status) queryParams.append("status", status);
    if (customerId) queryParams.append("customer_id", customerId);
    if (limit) queryParams.append("limit", limit);
    if (page) queryParams.append("page", page);

    const queryString = queryParams.toString();
    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}/api/orders${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch orders' }));
      return NextResponse.json({ error: errorData.message || 'Failed to fetch orders' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const body = await request.json();

    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Failed to create order' };
      }
      console.error('Order creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: `${apiBaseUrl}/api/orders`
      });
      return NextResponse.json({ 
        error: errorData.message || errorData.error || 'Failed to create order',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

