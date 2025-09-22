const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type: string;
  department?: string;
  salary?: string;
  responsibilities?: string;
  postedDate?: string;
  skills: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface JobFilters {
  search?: string;
  department?: string;
  location?: string;
  type?: string;
}

export interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
}

export interface JobResponse {
  success: boolean;
  data: Job;
  error?: string;
}

// Fetch jobs with filters and pagination
export async function fetchJobs(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  location?: string;
  department?: string;
}): Promise<JobsResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.type) searchParams.append('type', params.type);
    if (params.location) searchParams.append('location', params.location);
    if (params.department) searchParams.append('department', params.department);

    const response = await fetch(`${BACKEND_URL}/api/career/jobs?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      error: error instanceof Error ? error.message : 'Failed to fetch jobs'
    };
  }
}

// Fetch single job by ID
export async function fetchJobById(jobId: string): Promise<JobResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/career/jobs/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    return {
      success: false,
      data: {} as Job,
      error: error instanceof Error ? error.message : 'Failed to fetch job details'
    };
  }
}

// Submit job application
export async function submitJobApplication(applicationData: {
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resume?: File;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    let resumeUrl = '';
    
    // Upload resume first if provided
    if (applicationData.resume) {
      const uploadFormData = new FormData();
      uploadFormData.append('document', applicationData.resume);
      
      const uploadResponse = await fetch(`${BACKEND_URL}/api/upload/document`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        resumeUrl = uploadData.data.url;
      } else {
        throw new Error('Failed to upload resume');
      }
    }

    // Submit application with resume URL
    const formData = new FormData();
    formData.append('jobId', applicationData.jobId);
    formData.append('name', applicationData.name);
    formData.append('email', applicationData.email);
    if (applicationData.phone) formData.append('phone', applicationData.phone);
    if (applicationData.coverLetter) formData.append('coverLetter', applicationData.coverLetter);
    if (resumeUrl) formData.append('resumeUrl', resumeUrl);

    const response = await fetch(`${BACKEND_URL}/api/career/applications`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit application'
    };
  }
}

// Submit resume for general consideration
export async function submitResumeApplication(applicationData: {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  message?: string;
  resume: File;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Upload resume first
    const uploadFormData = new FormData();
    uploadFormData.append('document', applicationData.resume);
    
    const uploadResponse = await fetch(`${BACKEND_URL}/api/upload/document`, {
      method: 'POST',
      body: uploadFormData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload resume');
    }
    
    const uploadData = await uploadResponse.json();
    const resumeUrl = uploadData.data.url;

    // Submit application with resume URL
    const formData = new FormData();
    formData.append('name', applicationData.name);
    formData.append('email', applicationData.email);
    if (applicationData.phone) formData.append('phone', applicationData.phone);
    if (applicationData.position) formData.append('position', applicationData.position);
    if (applicationData.message) formData.append('message', applicationData.message);
    formData.append('resumeUrl', resumeUrl);

    const response = await fetch(`${BACKEND_URL}/api/career/resume-submission`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit resume'
    };
  }
}

