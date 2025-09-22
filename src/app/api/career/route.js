import { NextResponse } from 'next/server';

// Backend API base URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';


export async function POST(request) {
    try {
        const formData = await request.formData();
        
        // Extract form data
        const name = formData.get('name');
        const email = formData.get('email');
        const resume = formData.get('resume');
        const jobId = formData.get('jobId');
        const phone = formData.get('phone');
        const message = formData.get('message');

        // Validate required fields
        if (!name || !email || !resume) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Name, email, and resume are required fields.'
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please enter a valid email address.'
                },
                { status: 400 }
            );
        }

        // Validate resume file
        if (resume && resume.size > 5 * 1024 * 1024) { // 5MB limit
            return NextResponse.json(
                {
                    success: false,
                    message: 'Resume file size must be less than 5MB.'
                },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (resume && !allowedTypes.includes(resume.type)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Resume must be a PDF, DOC, or DOCX file.'
                },
                { status: 400 }
            );
        }

        // Forward the application to the backend
        const backendFormData = new FormData();
        backendFormData.append('name', name);
        backendFormData.append('email', email);
        backendFormData.append('resume', resume);
        if (jobId) backendFormData.append('jobId', jobId);
        if (phone) backendFormData.append('phone', phone);
        if (message) backendFormData.append('message', message);

        const backendResponse = await fetch(`${BACKEND_URL}/api/career/applications`, {
            method: 'POST',
            body: backendFormData,
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
        return NextResponse.json({
            success: true,
            message: backendData.message || 'Your application has been submitted successfully. We will review your information and get back to you soon.',
            data: backendData.data
        });

    } catch (error) {
        console.error('Career form submission error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'An unexpected error occurred. Please try again later.'
            },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve job listings from backend database
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const department = searchParams.get('department') || '';
        const location = searchParams.get('location') || '';
        const type = searchParams.get('type') || '';

        // Build query parameters for backend
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (department) queryParams.append('department', department);
        if (location) queryParams.append('location', location);
        if (type) queryParams.append('type', type);

        // Fetch jobs from backend database
        const backendResponse = await fetch(`${BACKEND_URL}/api/career/jobs?${queryParams}`, {
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
                    message: errorData.error || 'Failed to fetch job listings from backend.'
                },
                { status: backendResponse.status }
            );
        }

        const backendData = await backendResponse.json();

        // Return jobs from backend database
        return NextResponse.json({
            success: true,
            data: backendData.data || []
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch job listings.'
            },
            { status: 500 }
        );
    }
}

