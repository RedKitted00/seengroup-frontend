"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { fetchJobs, fetchJobById, Job } from '@/lib/careerApi';
import Icon from '../ui/Icon';
import Pagination from '../ui/Pagination';

const ITEMS_PER_PAGE = 5;

export default function CareerWithAPI() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetchJobs({
                page: currentPage,
                limit: ITEMS_PER_PAGE
            });
            
            if (response.success) {
                setJobs(response.data);
                if (response.pagination) {
                    setTotalPages(response.pagination.totalPages || 1);
                    setTotalJobs(response.pagination.total || 0);
                }
            } else {
                setError(response.error || 'Failed to fetch jobs');
            }
        } catch (err) {
            setError('Failed to load jobs');
            console.error('Error loading jobs:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    // Fetch jobs on component mount and when page changes
    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleJobClick = async (jobId: string) => {
        try {
            const response = await fetchJobById(jobId);
            if (response.success) {
                setSelectedJob(response.data);
                setShowModal(true);
            } else {
                alert('Failed to load job details');
            }
        } catch (err) {
            alert('Failed to load job details');
            console.error('Error loading job details:', err);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <Icon name="icon-alert" size={24} />
                <h3>Error Loading Jobs</h3>
                <p>{error}</p>
                <button onClick={loadJobs} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="career-page">
            <div className="container">
                <h1>Career Opportunities</h1>
                <p>Find your next career move with us</p>

                <div className="jobs-grid">
                    {jobs.map((job) => (
                        <div key={job.id} className="job-card" onClick={() => handleJobClick(job.id)}>
                            <h3>{job.title}</h3>
                            <div className="job-meta">
                                {job.location && (
                                    <span className="meta-item">
                                        <Icon name="icon-location" size={14} />
                                        {job.location}
                                    </span>
                                )}
                                <span className="meta-item">
                                    <Icon name="icon-briefcase" size={14} />
                                    {job.type}
                                </span>
                                {job.department && (
                                    <span className="meta-item">
                                        <Icon name="icon-building" size={14} />
                                        {job.department}
                                    </span>
                                )}
                            </div>
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
                            <button className="view-details-btn">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>

                {jobs.length === 0 && !loading && (
                    <div className="no-jobs">
                        <Icon name="icon-search" size={24} />
                        <h3>No jobs available</h3>
                        <p>Check back later for new opportunities</p>
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

            {/* Job Details Modal */}
            {showModal && selectedJob && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{selectedJob.title}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <Icon name="icon-cross" size={16} />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="job-details">
                                <div className="job-meta">
                                    {selectedJob.location && (
                                        <span className="meta-item">
                                            <Icon name="icon-location" size={14} />
                                            {selectedJob.location}
                                        </span>
                                    )}
                                    <span className="meta-item">
                                        <Icon name="icon-briefcase" size={14} />
                                        {selectedJob.type}
                                    </span>
                                    {selectedJob.department && (
                                        <span className="meta-item">
                                            <Icon name="icon-building" size={14} />
                                            {selectedJob.department}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="job-description">
                                    <h3>Job Description</h3>
                                    <p>{selectedJob.description}</p>
                                </div>
                                
                                {selectedJob.requirements && (
                                    <div className="job-requirements">
                                        <h3>Requirements</h3>
                                        <p>{selectedJob.requirements}</p>
                                    </div>
                                )}
                                
                                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                    <div className="job-benefits">
                                        <h3>Benefits</h3>
                                        <ul>
                                            {selectedJob.benefits.map((benefit, index) => (
                                                <li key={index}>{benefit}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {selectedJob.skills && selectedJob.skills.length > 0 && (
                                    <div className="job-skills">
                                        <h3>Skills</h3>
                                        <div className="skills-tags">
                                            {selectedJob.skills.map((skill, index) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="modal-footer">
                            <button className="apply-btn">
                                <Icon name="icon-send" size={16} />
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

