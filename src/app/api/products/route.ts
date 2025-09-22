import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';

    // Build query parameters for backend (without pagination)
    const backendParams = new URLSearchParams();
    if (search) backendParams.append('search', search);
    if (categoryId) backendParams.append('categoryId', categoryId);

    // Call the real backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    console.log('Backend URL:', backendUrl);
    const fullUrl = `${backendUrl}/api/products?${backendParams.toString()}`;
    console.log('Full API URL:', fullUrl);
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    
    // Handle backend response - extract data and remove pagination if present
    if (data.success && data.data) {
      console.log('Successfully fetched products:', data.data.length);
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      console.error('Backend returned unsuccessful response:', data);
      return NextResponse.json({
        success: false,
        data: [],
        error: data.error || 'Failed to fetch products'
      });
    }
  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        data: []
      },
      { status: 500 }
    );
  }
}



