"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Icon from '../../components/ui/Icon';
import '../../components/contact/style.css';
import { useSearchParams, useRouter } from 'next/navigation';

import '../../components/career/style.css';

interface Job {
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
}

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function CareerApplyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string; duration?: number }>>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<string | null>(null);

  const addNotification = (type: 'success' | 'error' | 'info', message: string, duration = 5000) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => removeNotification(id), duration);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'coverLetter') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'resume') {
        setSelectedResume(file.name);
      } else {
        setSelectedCoverLetter(file.name);
      }
    } else {
      if (type === 'resume') {
        setSelectedResume(null);
      } else {
        setSelectedCoverLetter(null);
      }
    }
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/career/jobs/${jobId}`, { credentials: 'include' });
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch job details');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (jobId) {
      formData.append('jobId', jobId);
    }

    // Client-side file constraints (mirror backend expectations)
    const file = formData.get('resume') as File | null;
    if (!file) {
      alert('Please attach your resume.');
      setSubmitting(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Resume must be 5MB or smaller.');
      setSubmitting(false);
      return;
    }

    // Optional cover letter PDF validation
    const cover = formData.get('coverLetter') as File | null;
    if (cover) {
      if (cover.type !== 'application/pdf') {
        alert('Cover letter must be a PDF file.');
        setSubmitting(false);
        return;
      }
      if (cover.size > 5 * 1024 * 1024) {
        alert('Cover letter must be 5MB or smaller.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/career`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const text = await response.text();
      let result: { success: boolean; error?: string; message?: string; data?: unknown } = { success: false };
      try { result = JSON.parse(text); } catch { result = { success: false, error: text }; }

      if (response.ok && result.success) {
        const jobTitle = job?.title || 'the position';
        addNotification('success', `Application submitted successfully for ${jobTitle}! We will contact you soon.`);
        // Allow the user to see the notification before navigating away
        setTimeout(() => router.push('/career'), 1200);
      } else {
        const msg = result?.error || result?.message || `Failed to submit application (status ${response.status}).`;
        addNotification('error', msg);
      }
    } catch {
      addNotification('error', 'Network error while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
    
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
    
      </>
    );
  }

  if (error || !job) {
    return (
      <>
   
        <div className="error-container">
          <h2>Error Loading Job</h2>
          <p>{error || 'Job not found'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/career')}
          >
            Back to Careers
          </button>
        </div>
      
      </>
    );
  }

  return (
    <>
      {/* Notification Container */}
      <div className="notification-container">
        {notifications.map((n) => (
          <div key={n.id} className={`notification notification-${n.type} show`} onClick={() => removeNotification(n.id)}>
            <div className="notification-icon">
              {n.type === 'success' && <Icon name="icon-check" size={16} />}
              {n.type === 'error' && <Icon name="icon-alert" size={16} />}
              {n.type === 'info' && <Icon name="icon-spinner" className="animate-spin" size={16} />}
            </div>
            <div className="notification-content">
              <div className="notification-message">{n.message}</div>
            </div>
            <button className="notification-close" onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}>
              <Icon name="icon-cross" size={12} />
            </button>
          </div>
        ))}
      </div>
   
      
      <div className="application-page">
        <div className="container">
          <div className="job-summary">
            <div className="job-summary-header">
              <h1>Apply for {job.title}</h1>
              <button 
                className="btn btn-secondary"
                onClick={() => router.push('/career')}
              >
                Back to All Jobs
              </button>
            </div>
            
            <div className="job-summary-content">
              <div className="job-meta">
                {job.location && (
                  <span className="meta-badge location">
                    <Icon name="icon-location" size={16} />
                    <span>{job.location}</span>
                  </span>
                )}
                <span className="meta-badge type">
                  <Icon name="icon-briefcase" size={16} />
                  <span>{job.type}</span>
                </span>
                {job.department && (
                  <span className="meta-badge department">
                    <Icon name="icon-building" size={16} />
                    <span>{job.department}</span>
                  </span>
                )}
              </div>
              
              <div className="job-description">
                <h3>Job Description</h3>
                <p>{job.description}</p>
              </div>
            </div>
          </div>

          <div className="application-form-section">
            <div className="section-header">
              <h2>Submit Your Application</h2>
              <p>Please fill out the form below to apply for this position.</p>
            </div>
            
            <form className="application-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone" />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Position Applied For</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={job.title}
                    readOnly
                    className="readonly"
                  />
                </div>
              </div>
              
              {/* Removed text cover letter input per request */}
              
              <div className="form-group">
                <label htmlFor="resume">Resume/CV *</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={(e) => handleFileChange(e, 'resume')}
                  />
                  <div className="file-upload-content">
                    <Icon name="icon-cloud-upload" size={24} />
                    <span>Choose file or drag and drop</span>
                    <small>PDF, DOC, or DOCX (Max 5MB)</small>
                  </div>
                </div>
                {selectedResume && (
                  <div className="file-selected">
                    <Icon name="icon-check" size={16} />
                    <span>Selected: {selectedResume}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter (PDF, optional)</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="coverLetter"
                    name="coverLetter"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'coverLetter')}
                  />
                  <div className="file-upload-content">
                    <Icon name="icon-cloud-upload" size={24} />
                    <span>Attach a PDF cover letter (optional)</span>
                    <small>PDF only (Max 5MB)</small>
                  </div>
                </div>
                {selectedCoverLetter && (
                  <div className="file-selected">
                    <Icon name="icon-check" size={16} />
                    <span>Selected: {selectedCoverLetter}</span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => router.push('/career')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      

    </>
  );
}

export default function CareerApply() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CareerApplyContent />
    </Suspense>
  );
}

