import { NextResponse } from 'next/server';

const resolveBackendUrl = () => {
    // Prefer explicit backend URL; support both public and private var names
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    return url && url.trim().length > 0 ? url.trim() : '';
};

export async function POST(request) {
    try {
        // Get the request body
        const body = await request.json();
        const backendUrl = resolveBackendUrl();

        if (!backendUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Backend URL is not configured',
                },
                { status: 500 }
            );
        }

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Forward captchaToken to backend along with the rest of the payload
            body: JSON.stringify(body)
        });

        const data = await response.json();

        // Return the backend response
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('Contact form submission error:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to connect to backend service. Please try again later.' 
            },
            { status: 500 }
        );
    }
}

