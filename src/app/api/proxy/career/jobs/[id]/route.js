import { NextResponse } from 'next/server';

// Backend API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// GET endpoint to retrieve individual job details from backend database
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Job ID is required.'
                },
                { status: 400 }
            );
        }

        // Fetch job details from backend database
        const backendResponse = await fetch(`${BACKEND_URL}/api/career/jobs/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            console.error('Backend error:', errorData);
            return NextResponse.json(
                {
                    success: false,
                    message: errorData.error || 'Failed to fetch job details from backend.'
                },
                { status: backendResponse.status }
            );
        }

        const backendData = await backendResponse.json();

        // Return job details from backend database
        return NextResponse.json(backendData);

    } catch (error) {
        console.error('Error fetching job details:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch job details.'
            },
            { status: 500 }
        );
    }
}
