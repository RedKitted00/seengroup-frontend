"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import './style.css';
import Icon from '../ui/Icon';
import Pagination from '../ui/Pagination';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useTranslation } from '@/lib/i18n/useTranslation';

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
  _count?: {
    applications: number;
  };
}

interface JobFilters {
  search: string;
  department: string;
  location: string;
  type: string;
}

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Currently unused
const ITEMS_PER_PAGE = 5;

export default function Career() {
    const { t } = useTranslation();
    
    // Performance monitoring
    const { trackApiCall, trackCacheHit } = usePerformanceMonitor('Career');
    
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<JobFilters>({
        search: '',
        department: '',
        location: '',
        type: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [departments, setDepartments] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [jobTypes, setJobTypes] = useState<string[]>([]);
    
    // Performance optimization states
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);
    const jobCacheRef = useRef<Map<string, { data: Job[]; timestamp: number }>>(new Map());
    // const [isLoadingMore, setIsLoadingMore] = useState(false); // Currently unused
    const [lastCacheTime, setLastCacheTime] = useState<number>(0);


    // Clear cache function
    const clearJobCache = useCallback(() => {
        jobCacheRef.current = new Map();
    }, []);

    // Utility function for scrolling to job listings
    const scrollToJobListings = useCallback(() => {
        setTimeout(() => {
            const jobListingsElement = document.getElementById('current-positions');
            if (jobListingsElement) {
                const headerHeight = 80; // Approximate header height
                const elementTop = jobListingsElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: Math.max(0, elementTop),
                    behavior: 'smooth'
                });
            }
        }, 100);
    }, []);

    // Functions are now stable from usePerformanceMonitor hook

    // Load full option lists once (unfiltered) so dropdowns don't shrink with active filters
    useEffect(() => {
        let cancelled = false;
        const loadAllOptions = async () => {
            try {
                const response = await fetch(`/api/career`, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) return;
                const data = await response.json();
                if (!data?.success || cancelled) return;
                const allDepts = [...new Set(data.data.map((job: Job) => job.department).filter(Boolean))] as string[];
                const allLocs = [...new Set(data.data.map((job: Job) => job.location).filter(Boolean))] as string[];
                const allTypes = [...new Set(data.data.map((job: Job) => job.type).filter(Boolean))] as string[];
                setDepartments(allDepts);
                setLocations(allLocs);
                setJobTypes(allTypes);
            } catch {
                // ignore option load errors; dropdowns will still work with empty lists
            }
        };
        loadAllOptions();
        return () => { cancelled = true; };
    }, []);

    // Frontend pagination - update displayed jobs when allJobs or currentPage changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedJobs = allJobs.slice(startIndex, endIndex);
        
        const totalJobsCount = allJobs.length;
        const totalPagesCount = Math.ceil(totalJobsCount / ITEMS_PER_PAGE);
        
        // Debug logging (can be removed in production)
        
        setJobs(paginatedJobs);
        setTotalJobs(totalJobsCount);
        setTotalPages(totalPagesCount);
    }, [allJobs, currentPage]);


    // Fetch job details for modal
    const fetchJobDetails = async (jobId: string) => {
        try {
            // For now, find the job in the current jobs list
            const job = jobs.find(j => j.id === jobId);
            if (job) {
                setSelectedJob(job);
                setShowModal(true);
            } else {
                throw new Error('Job not found');
            }
        } catch (err) {
            console.error('Error fetching job details:', err);
            alert('Failed to load job details');
        }
    };

    // Handle filter changes with debouncing
    const handleFilterChange = (filterType: keyof JobFilters, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    // Handle search with debouncing
    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
        setCurrentPage(1);
    };

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [filters.search]);

    // Handle pagination with smart scroll management
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        
        // Add subtle loading state for better UX
        const jobsContainer = document.getElementById('jobs-container');
        if (jobsContainer) {
            jobsContainer.classList.add('paginating');
            setTimeout(() => {
                jobsContainer.classList.remove('paginating');
            }, 300);
        }
        
        scrollToJobListings(); // Scroll to job listings
    };

    // Handle job application
    const handleJobApplication = async (jobId: string) => {
        setShowModal(false);
        // Navigate to application page
        window.location.href = `/career/apply?jobId=${jobId}`;
    };



    // Fetch jobs when debounced search or non-search filters change
    useEffect(() => {
        let isMounted = true;
        
        const fetchJobsWrapper = async () => {
            // Cancel previous request if it exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            
            const newController = new AbortController();
            abortControllerRef.current = newController;
            
            // Only update state if component is still mounted
            if (isMounted) {
                setLoading(true);
                setError(null);
            }
            
            try {
                const params = new URLSearchParams();

                if (debouncedSearch) params.append('search', debouncedSearch);
                if (filters.department) params.append('department', filters.department);
                if (filters.location) params.append('location', filters.location);
                if (filters.type) params.append('type', filters.type);

                // Check cache first with timestamp validation
                const getCacheKey = (searchFilters: JobFilters) => {
                    return `${searchFilters.search}-${searchFilters.department}-${searchFilters.location}-${searchFilters.type}`;
                };
                const cacheKey = getCacheKey({ ...filters, search: debouncedSearch });
                
                // Check cache using ref to avoid re-renders
                const cached = jobCacheRef.current.get(cacheKey);
                if (cached) {
                    const cacheAge = Date.now() - cached.timestamp;
                    const maxCacheAge = 10 * 60 * 1000; // 10 minutes
                    
                    if (cacheAge < maxCacheAge && isMounted) {
                        setAllJobs(cached.data);
                        setLoading(false);
                        trackCacheHit(); // Track cache hit
                        return;
                    } else {
                        // Cache is stale, remove it
                        jobCacheRef.current.delete(cacheKey);
                    }
                }

                const response = await fetch(`/api/career?${params}`, {
                    signal: newController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                // Check if component is still mounted before processing response
                if (!isMounted) return;
                
                trackApiCall(); // Track API call
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: Failed to fetch jobs`);
                }

                const data = await response.json();
                
                if (data.success && isMounted) {
                    setAllJobs(data.data);
                    
                    // Cache the result with timestamp
                    const cacheData = {
                        data: data.data,
                        timestamp: Date.now()
                    };
                    jobCacheRef.current.set(cacheKey, cacheData);
                    setLastCacheTime(Date.now());
                    
                    // Do not recalculate dropdown options from filtered results.
                    // This prevents options from shrinking after applying search/filters.
                } else if (!data.success && isMounted) {
                    throw new Error(data.error || 'Failed to fetch jobs');
                }
            } catch (err) {
                if (!isMounted) return; // Don't update state if component unmounted
                
                if (err instanceof Error && err.name === 'AbortError') {
                    return; // Ignore cancelled requests
                }
                
                // Handle different types of errors
                let errorMessage = 'An error occurred';
                if (err instanceof Error) {
                    if (err.message.includes('Failed to fetch')) {
                        errorMessage = 'Network error. Please check your connection.';
                    } else if (err.message.includes('HTTP')) {
                        errorMessage = err.message;
                    } else {
                        errorMessage = err.message;
                    }
                }
                
                setError(errorMessage);
                console.error('Error fetching jobs:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchJobsWrapper();
        
        // Cleanup function
        return () => {
            isMounted = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [debouncedSearch, filters.department, filters.location, filters.type]);

    // Scroll to listings only after debounced search or non-search filters change (avoid per-keystroke scroll)
    const firstSearchRef = useRef(true);
    useEffect(() => {
        if (firstSearchRef.current) {
            firstSearchRef.current = false;
            return;
        }
        scrollToJobListings();
    }, [debouncedSearch, filters.department, filters.location, filters.type]);

    // Smart cache invalidation - only refresh if page was hidden for more than 2 minutes
    useEffect(() => {
        let hiddenTime = 0;
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                hiddenTime = Date.now();
            } else if (hiddenTime > 0) {
                const timeHidden = Date.now() - hiddenTime;
                const timeSinceLastCache = Date.now() - lastCacheTime;
                
                // Only refresh if:
                // 1. Page was hidden for more than 2 minutes, AND
                // 2. Last cache was more than 5 minutes ago
                if (timeHidden > 120000 && timeSinceLastCache > 300000) {
                    clearJobCache();
                    // Trigger a re-fetch by updating a dependency
                    setLastCacheTime(0); // This will cause the next fetch to bypass cache
                }
                hiddenTime = 0;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [lastCacheTime, clearJobCache]);

    // Less frequent periodic refresh - every 15 minutes instead of 5
    useEffect(() => {
        const interval = setInterval(() => {
            // Only refresh if user is actively on the page
            if (!document.hidden) {
                clearJobCache();
                // Trigger a re-fetch by updating a dependency
                setLastCacheTime(0); // This will cause the next fetch to bypass cache
            }
        }, 15 * 60 * 1000); // Refresh every 15 minutes

        return () => clearInterval(interval);
    }, [clearJobCache]);

    // Background slider effect - optimized
    useEffect(() => {
        const slides = document.querySelectorAll('.background-slide');
        if (slides.length <= 1) return; // No need for slider with 1 or 0 slides
        
        let currentSlide = 0;
        let intervalId: NodeJS.Timeout;
        
        const startSlider = () => {
            intervalId = setInterval(() => {
                slides[currentSlide]?.classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide]?.classList.add('active');
            }, 5000);
        };
        
        // Start slider only if page is visible
        if (!document.hidden) {
            startSlider();
        }
        
        // Handle visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                clearInterval(intervalId);
            } else {
                startSlider();
            }
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Handle modal body class and keyboard events
    useEffect(() => {
        if (showModal) {
            document.body.classList.add('modal-open');
            
            // Add keyboard event listener for Escape key
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setShowModal(false);
                }
            };
            
            document.addEventListener('keydown', handleEscape);
            
            return () => {
                document.removeEventListener('keydown', handleEscape);
            };
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [showModal]);

    // Global error handler for runtime errors
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            console.error('Global error caught:', event.error);
            // Suppress runtime.lastError messages from browser extensions
            if (event.message && event.message.includes('runtime.lastError')) {
                event.preventDefault();
                return;
            }
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Suppress runtime.lastError messages from browser extensions
            if (event.reason && typeof event.reason === 'string' && event.reason.includes('runtime.lastError')) {
                event.preventDefault();
                return;
            }
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="background-slider">
                    <div
                        className="background-slide active"
                        data-desktop="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                    <div
                        className="background-slide"
                        data-desktop="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                    <div
                        className="background-slide"
                        data-desktop="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                        data-mobile="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                    ></div>
                </div>
                <div className="hero-overlay"></div>
            </section>

            {/* Current Positions Section */}
            <section id="current-positions" className="current-positions">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('career.title')}</h2>
                        <p>
                            {t('career.subtitle')}
                        </p>
                    </div>

                    {/* Job Search and Filters */}
                    <div className="job-filters">
                        <div className="search-container">
                            <div className="search-box">
                                <Icon name="icon-search" size={16} />
                                <input
                                    type="text"
                                    id="job-search"
                                    placeholder={t('career.search_placeholder')}
                                    value={filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filter-options">
                            <select 
                                id="department-filter"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            >
                                <option value="">{t('career.all_departments')}</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <select 
                                id="location-filter"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            >
                                <option value="">{t('career.all_locations')}</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <select 
                                id="type-filter"
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="">{t('career.all_types')}</option>
                                {jobTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Job Listings */}
                    <div className="job-listings">
                        {error && (
                            <div className="error-message">
                                <Icon name="icon-alert" size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <div className="loading-state">
                                <div className="jobs-grid">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="job-card skeleton">
                                            <div className="skeleton-title"></div>
                                            <div className="skeleton-meta">
                                                <div className="skeleton-badge"></div>
                                                <div className="skeleton-badge"></div>
                                            </div>
                                            <div className="skeleton-description"></div>
                                            <div className="skeleton-button"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="no-results">
                                <Icon name="icon-search" size={16} />
                                <h3>{t('career.no_jobs')}</h3>
                                <p>{t('career.no_jobs_description')}</p>
                            </div>
                        ) : (
                            <div id="jobs-container" className="jobs-grid">
                                {jobs.map((job) => (
                                    <div key={job.id} className="job-card">
                                        <div className="job-card-header">
                                            <h3 className="job-title">{job.title}</h3>
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
                                        </div>
                                        <div className="job-card-body">
                                            <p className="job-description">
                                                {job.description.length > 150 
                                                    ? `${job.description.substring(0, 150)}...` 
                                                    : job.description
                                                }
                                            </p>
                                            {job.salary && (
                                                <div className="job-salary">
                                               
                                                    <span>{job.salary}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="job-card-footer">
                                            <button 
                                                className="btn btn-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fetchJobDetails(job.id);
                                                }}
                                            >
                                                <Icon name="icon-eye" size={16} />
                                                {t('career.view_details')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalJobs}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={handlePageChange}
                            className="career-pagination"
                        />
                    </div>
                </div>
            </section>



            {/* Job Details Modal */}
            {showModal && selectedJob && (
                <div id="job-modal" className="modal no-animation" style={{ display: 'block' }}>
                    <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
                    <div className="modal-container">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-header-content">
                                    <h2 className="modal-title">{selectedJob.title}</h2>
                                    <div className="modal-meta">
                                        {selectedJob.location && (
                                            <span className="meta-badge location">
                                                <Icon name="icon-location" size={16} />
                                                <span>{selectedJob.location}</span>
                                            </span>
                                        )}
                                        <span className="meta-badge type">
                                            <Icon name="icon-briefcase" size={16} />
                                            <span>{selectedJob.type}</span>
                                        </span>
                                        {selectedJob.department && (
                                            <span className="meta-badge department">
                                                <Icon name="icon-building" size={16} />
                                                <span>{selectedJob.department}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="modal-close" 
                                    aria-label="Close modal"
                                    onClick={() => setShowModal(false)}
                                >
                                    <Icon name="icon-cross" size={16} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="modal-sections">
                                    <div className="modal-section">
                                        <h3 className="section-title">
                                            <Icon name="icon-info" size={16} />
                                            {t('career.job_overview')}
                                        </h3>
                                        <div className="section-content" id="modal-job-description">
                                            {selectedJob.description}
                                        </div>
                                    </div>

                                    {selectedJob.requirements && (
                                        <div className="modal-section">
                                            <h3 className="section-title">
                                                <Icon name="icon-list-check" size={16} />
                                                {t('career.requirements')}
                                            </h3>
                                            <div className="section-content" id="modal-job-requirements">
                                                {selectedJob.requirements}
                                            </div>
                                        </div>
                                    )}

                                    {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                        <div className="modal-section">
                                            <h3 className="section-title">
                                                <Icon name="icon-star" size={16} />
                                                {t('career.benefits')}
                                            </h3>
                                            <div className="section-content" id="modal-job-benefits">
                                                <ul>
                                                    {selectedJob.benefits.map((benefit, index) => (
                                                        <li key={index}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    <div className="modal-section">
                                        <h3 className="section-title">
                                            <Icon name="icon-calendar" size={16} />
                                            {t('career.job_details')}
                                        </h3>
                                        <div className="job-details-grid" id="modal-job-details">
                                            {selectedJob.salary && (
                                                <div className="detail-item">
                                                    <span className="detail-label">{t('career.salary')}:</span>
                                                    <span className="detail-value">{selectedJob.salary}</span>
                                                </div>
                                            )}
                                            {selectedJob.postedDate && (
                                                <div className="detail-item">
                                                    <span className="detail-label">{t('career.posted')}:</span>
                                                    <span className="detail-value">
                                                        {new Date(selectedJob.postedDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {selectedJob.skills && selectedJob.skills.length > 0 && (
                                                <div className="detail-item">
                                                    <span className="detail-label">{t('career.skills')}:</span>
                                                    <span className="detail-value">
                                                        {selectedJob.skills.join(', ')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <div className="modal-actions">
                                    <button 
                                        className="btn btn-secondary modal-close-btn"
                                        onClick={() => setShowModal(false)}
                                    >
                                        <Icon name="icon-cross" size={16} />
                                        {t('career.close')}
                                    </button>
                                    <button 
                                        className="btn btn-primary apply-btn"
                                        onClick={() => handleJobApplication(selectedJob.id)}
                                    >
                                        <Icon name="icon-send" size={16} />
                                        {t('career.apply_now')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
