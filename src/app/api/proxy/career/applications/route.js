import { NextResponse } from 'next/server';

// Backend API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// POST endpoint to submit job applications to backend database
export async function POST(request) {
    try {
        const formData = await request.formData();
        
        // Forward the application to the backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications`, {
            method: 'POST',
            body: formData,
        });

        const backendData = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: backendData.error || 'Failed to submit application to backend.'
                },
                { status: backendResponse.status }
            );
        }

        // Return success response from backend
        return NextResponse.json(backendData);

    } catch (error) {
        console.error('Application submission error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}
