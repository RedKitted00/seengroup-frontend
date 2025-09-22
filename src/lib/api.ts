const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Define proper interfaces instead of using 'any'
export interface ProductData {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId: string;
}

export interface CategoryData {
  name: string;
  description?: string;
}

export interface JobData {
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  type?: string;
  benefits?: string[];
  department?: string;
  responsibilities?: string;
  salary?: string;
  skills?: string[];
}

export interface SettingsData {
  [key: string]: string | number | boolean;
}

export interface UploadResponse {
  url: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    return this.request('/api/admin/logout', {
      method: 'POST',
    });
  }

  // Admin Dashboard endpoints
  async getDashboardStats() {
    return this.request('/api/admin/dashboard/stats');
  }

  // Admin Categories endpoints
  async getAdminCategories() {
    return this.request('/api/admin/categories');
  }

  async createAdminCategory(categoryData: { name: string; description?: string }) {
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateAdminCategory(categoryData: { id: string; name: string; description?: string }) {
    return this.request('/api/admin/categories', {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteAdminCategory(id: string) {
    return this.request(`/api/admin/categories?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Products endpoints
  async getAdminProducts(params?: { categoryId?: string; page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return this.request(`/api/admin/products?${queryParams.toString()}`);
  }

  async createAdminProduct(productData: ProductData) {
    return this.request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateAdminProduct(productData: ProductData & { id: string }) {
    return this.request('/api/admin/products', {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Upload endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.request('/api/upload/image', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async deleteAdminProduct(id: string) {
    return this.request(`/api/admin/products?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Settings endpoints
  async getAdminSettings() {
    return this.request('/api/admin/settings');
  }

  async updateAdminSettings(settings: SettingsData) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Admin Career Jobs endpoints
  async getAdminJobs() {
    return this.request('/api/admin/career/jobs');
  }

  async createAdminJob(jobData: JobData) {
    return this.request('/api/admin/career/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateAdminJob(jobData: JobData & { id: string }) {
    return this.request('/api/admin/career/jobs', {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteAdminJob(id: string) {
    return this.request(`/api/admin/career/jobs?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Public Products endpoints
  async getProducts(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return this.request(`/api/products?${queryParams.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/api/products/${id}`);
  }

  async createProduct(productData: FormData) {
    return this.request('/api/products', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: productData,
    });
  }

  async updateProduct(id: string, productData: FormData) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      headers: {}, // Let browser set Content-Type for FormData
      body: productData,
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Public Categories endpoints
  async getCategories() {
    return this.request('/api/categories');
  }

  async createCategory(categoryData: { name: string; slug: string }) {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: { name: string; slug: string }) {
    return this.request(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Career applications endpoints
  async getCareerApplications(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return this.request(`/api/career/applications?${queryParams.toString()}`);
  }

  async getCareerApplication(id: string) {
    return this.request(`/api/career/applications/${id}`);
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request(`/api/career/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteCareerApplication(id: string) {
    return this.request(`/api/career/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Career endpoints
  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    location?: string;
    department?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.department) searchParams.append('department', params.department);

    return this.request(`/api/career/jobs?${searchParams.toString()}`);
  }

  async getJobById(jobId: string) {
    return this.request(`/api/career/jobs/${jobId}`);
  }

  async submitJobApplication(applicationData: {
    jobId: string;
    name: string;
    email: string;
    phone?: string;
    coverLetter?: string;
    resume?: File;
  }) {
    let resumeUrl = '';
    
    // Upload resume first if provided
    if (applicationData.resume) {
      const uploadFormData = new FormData();
      uploadFormData.append('document', applicationData.resume);
      
      const uploadResponse = await this.request<UploadResponse>('/api/upload/document', {
        method: 'POST',
        body: uploadFormData,
        headers: {},
      });
      
      if (uploadResponse.success && uploadResponse.data) {
        resumeUrl = uploadResponse.data.url;
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

    return this.request('/api/career/applications', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async submitResumeApplication(applicationData: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
    message?: string;
    resume: File;
  }) {
    // Upload resume first
    const uploadFormData = new FormData();
    uploadFormData.append('document', applicationData.resume);
    
    const uploadResponse = await this.request<UploadResponse>('/api/upload/document', {
      method: 'POST',
      body: uploadFormData,
      headers: {},
    });
    
    if (!uploadResponse.success || !uploadResponse.data) {
      throw new Error('Failed to upload resume');
    }
    
    const resumeUrl = uploadResponse.data.url;

    // Submit application with resume URL
    const formData = new FormData();
    formData.append('name', applicationData.name);
    formData.append('email', applicationData.email);
    if (applicationData.phone) formData.append('phone', applicationData.phone);
    if (applicationData.position) formData.append('position', applicationData.position);
    if (applicationData.message) formData.append('message', applicationData.message);
    formData.append('resumeUrl', resumeUrl);

    return this.request('/api/career/resume-submission', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }
}

export const apiClient = new ApiClient(BACKEND_URL || 'http://localhost:3001');

