// Career Page - Dynamic JavaScript Functionality
// Performance optimizations, better error handling, and modern practices

// Configuration
const CAREER_CONFIG = {
    SLIDE_DURATION: 5000,
    JOBS_PER_PAGE: 6,
    SEARCH_DEBOUNCE: 300,
    ANIMATION_DURATION: 300,
    SCROLL_OFFSET: 100,
    MAX_VISIBLE_PAGES: 5
};

// State management
const state = {
    currentPage: 1,
    filteredJobs: [],
    currentSlideIndex: 0,
    slideInterval: null,
    isInitialized: false
};

// Job data with better structure and more realistic content
const jobsData = [
    {
        id: 1,
        title: "Senior Software Engineer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        salary: "$120,000 - $150,000",
        description: "We are looking for a Senior Software Engineer to join our team and help build innovative solutions. You will be responsible for developing high-quality software, mentoring junior developers, and collaborating with cross-functional teams.",
        requirements: "5+ years of experience in software development, proficiency in JavaScript, Python, and cloud technologies. Experience with React, Node.js, and AWS is preferred.",
        responsibilities: "Lead technical projects, mentor junior developers, collaborate with cross-functional teams, and contribute to architectural decisions.",
        postedDate: "2024-01-15",
        skills: ["JavaScript", "Python", "React", "Node.js", "AWS"],
        benefits: ["Health Insurance", "401k", "Remote Work", "Flexible Hours"]
    },
    {
        id: 2,
        title: "Product Manager",
        department: "Product",
        location: "New York",
        type: "Full-time",
        salary: "$100,000 - $130,000",
        description: "Join our product team to drive the development of cutting-edge solutions. You will be responsible for defining product strategy, working with engineering teams, and analyzing market trends.",
        requirements: "3+ years of product management experience, strong analytical skills, excellent communication abilities, and experience with agile methodologies.",
        responsibilities: "Define product strategy, work with engineering teams, analyze market trends, and prioritize feature development.",
        postedDate: "2024-01-10",
        skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
        benefits: ["Health Insurance", "401k", "Stock Options", "Professional Development"]
    },
    {
        id: 3,
        title: "UX Designer",
        department: "Design",
        location: "Los Angeles",
        type: "Full-time",
        salary: "$80,000 - $110,000",
        description: "Create beautiful and intuitive user experiences for our products. You will be responsible for designing user interfaces, conducting user research, and collaborating with development teams.",
        requirements: "2+ years of UX design experience, proficiency in Figma, user research skills, and a strong portfolio demonstrating user-centered design.",
        responsibilities: "Design user interfaces, conduct user research, collaborate with development teams, and maintain design systems.",
        postedDate: "2024-01-08",
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        benefits: ["Health Insurance", "401k", "Design Tools", "Conference Budget"]
    },
    {
        id: 4,
        title: "Marketing Specialist",
        department: "Marketing",
        location: "Remote",
        type: "Part-time",
        salary: "$50,000 - $70,000",
        description: "Help us grow our brand and reach new customers through innovative marketing strategies. You will develop marketing campaigns, manage social media, and create engaging content.",
        requirements: "2+ years of marketing experience, social media expertise, content creation skills, and experience with marketing analytics tools.",
        responsibilities: "Develop marketing campaigns, manage social media presence, create content, and analyze campaign performance.",
        postedDate: "2024-01-05",
        skills: ["Social Media", "Content Creation", "Analytics", "Campaign Management"],
        benefits: ["Flexible Hours", "Remote Work", "Professional Development"]
    },
    {
        id: 5,
        title: "Data Scientist",
        department: "Engineering",
        location: "Chicago",
        type: "Full-time",
        salary: "$110,000 - $140,000",
        description: "Analyze complex data sets to drive business decisions and product improvements. You will build predictive models, analyze data trends, and present insights to stakeholders.",
        requirements: "3+ years of data science experience, Python/R proficiency, machine learning expertise, and strong statistical analysis skills.",
        responsibilities: "Build predictive models, analyze data trends, present insights to stakeholders, and collaborate with product teams.",
        postedDate: "2024-01-03",
        skills: ["Python", "R", "Machine Learning", "SQL", "Statistics"],
        benefits: ["Health Insurance", "401k", "Remote Work", "Conference Budget"]
    },
    {
        id: 6,
        title: "Customer Success Manager",
        department: "Sales",
        location: "Remote",
        type: "Full-time",
        salary: "$70,000 - $90,000",
        description: "Ensure customer satisfaction and drive product adoption through excellent service. You will onboard new customers, provide support, and drive product adoption.",
        requirements: "2+ years of customer success experience, strong communication skills, technical aptitude, and experience with CRM systems.",
        responsibilities: "Onboard new customers, provide support, drive product adoption, and maintain customer relationships.",
        postedDate: "2024-01-01",
        skills: ["Customer Service", "Communication", "Product Knowledge", "Analytics"],
        benefits: ["Health Insurance", "401k", "Remote Work", "Performance Bonuses"]
    }
];

// Utility functions
const careerUtils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Display name mappings
const displayMappings = {
    categories: {
        'Engineering': 'Engineering',
        'Product': 'Product',
        'Design': 'Design',
        'Marketing': 'Marketing',
        'Sales': 'Sales'
    },
    locations: {
        'Remote': 'Remote',
        'New York': 'New York',
        'Los Angeles': 'Los Angeles',
        'Chicago': 'Chicago',
        'Toronto': 'Toronto',
        'Vancouver': 'Vancouver'
    },
    types: {
        'Full-time': 'Full-time',
        'Part-time': 'Part-time',
        'Contract': 'Contract',
        'Internship': 'Internship'
    }
};

// Job management system
class JobManager {
    constructor() {
        this.jobs = [...jobsData];
        this.filteredJobs = [...jobsData];
        this.currentPage = 1;
        this.init();
    }

    init() {

        this.bindEvents();
        this.displayJobs();
        this.displayPagination();

    }

    bindEvents() {
        const searchInput = careerUtils.getElement('#job-search');
        const departmentFilter = careerUtils.getElement('#department-filter');
        const locationFilter = careerUtils.getElement('#location-filter');
        const typeFilter = careerUtils.getElement('#type-filter');

        if (searchInput) {
            searchInput.addEventListener('input', careerUtils.debounce(() => this.performSearch(), CAREER_CONFIG.SEARCH_DEBOUNCE));
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => this.performSearch());
        }

        if (locationFilter) {
            locationFilter.addEventListener('change', () => this.performSearch());
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.performSearch());
        }
    }

    performSearch() {
        const searchTerm = careerUtils.getElement('#job-search')?.value.toLowerCase() || '';
        const department = careerUtils.getElement('#department-filter')?.value || '';
        const location = careerUtils.getElement('#location-filter')?.value || '';
        const type = careerUtils.getElement('#type-filter')?.value || '';

        this.filteredJobs = this.jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm) ||
                                job.description.toLowerCase().includes(searchTerm) ||
                                job.department.toLowerCase().includes(searchTerm) ||
                                job.skills?.some(skill => skill.toLowerCase().includes(searchTerm));

            const matchesDepartment = !department || job.department === department;
            const matchesLocation = !location || job.location === location;
            const matchesType = !type || job.type === type;

            return matchesSearch && matchesDepartment && matchesLocation && matchesType;
        });

        this.currentPage = 1;
        this.displayJobs();
        this.displayPagination();
    }

    displayJobs() {

        const jobsContainer = careerUtils.getElement('#jobs-container');
        const loadingState = careerUtils.getElement('#loading');
        const noResults = careerUtils.getElement('#no-results');



        if (!jobsContainer) {
            console.error('JobManager: jobs-container not found!');
            return;
        }

        // Add a simple test message to see if the container is working
        if (jobsContainer.innerHTML === '') {
            jobsContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Loading jobs...</div>';
        }

        // Show loading state
        if (loadingState) {
            loadingState.style.display = 'block';
            loadingState.style.opacity = '0';
            setTimeout(() => loadingState.style.opacity = '1', 10);
        }

        jobsContainer.innerHTML = '';

        // Simulate loading delay for better UX
        setTimeout(() => {

            
            // Hide loading state
            if (loadingState) {
                loadingState.style.opacity = '0';
                setTimeout(() => loadingState.style.display = 'none', CAREER_CONFIG.ANIMATION_DURATION);
            }


            if (this.filteredJobs.length === 0) {
                if (noResults) {
                    noResults.style.display = 'block';
                    noResults.style.opacity = '0';
                    setTimeout(() => noResults.style.opacity = '1', 10);
                }
                return;
            }

            if (noResults) noResults.style.display = 'none';

                    const startIndex = (this.currentPage - 1) * CAREER_CONFIG.JOBS_PER_PAGE;
        const endIndex = startIndex + CAREER_CONFIG.JOBS_PER_PAGE;
            const jobsToShow = this.filteredJobs.slice(startIndex, endIndex);

            // Clear the container first
            jobsContainer.innerHTML = '';
            
            // Animate job cards appearance
            jobsToShow.forEach((job, index) => {
                const jobCard = this.createJobCard(job);
                jobCard.style.opacity = '0';
                jobCard.style.transform = 'translateY(20px)';
                jobsContainer.appendChild(jobCard);
      
                setTimeout(() => {
                    jobCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    jobCard.style.opacity = '1';
                    jobCard.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, CAREER_CONFIG.ANIMATION_DURATION);
    }

    createJobCard(job) {
        const card = document.createElement('div');
        card.className = 'job-card';
        card.innerHTML = `
            <div class="job-header">
                <h3>${this.escapeHtml(job.title)}</h3>
                <span class="job-type ${job.type.toLowerCase().replace(' ', '-')}">${displayMappings.types[job.type] || job.type}</span>
            </div>
            <div class="job-meta">
                <span class="job-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    ${displayMappings.locations[job.location] || job.location}
                </span>
                <span class="job-department">
                    <i class="fas fa-building" aria-hidden="true"></i>
                    ${displayMappings.categories[job.department] || job.department}
                </span>
            </div>
            <p class="job-description">${this.escapeHtml(job.description.substring(0, 150))}...</p>
            <div class="job-footer">
                <span class="job-salary">${this.escapeHtml(job.salary)}</span>
                <button class="view-details" onclick="jobManager.showJobDetails(${job.id})" aria-label="View details for ${this.escapeHtml(job.title)}">
                    View Details
                </button>
            </div>
        `;
        return card;
    }

    displayPagination() {
        const paginationInfo = careerUtils.getElement('#pagination-info');
        const pageNumbers = careerUtils.getElement('#page-numbers');
        const prevBtn = careerUtils.getElement('#prev-page');
        const nextBtn = careerUtils.getElement('#next-page');

        if (!paginationInfo || !pageNumbers || !prevBtn || !nextBtn) return;

        const totalPages = Math.ceil(this.filteredJobs.length / CAREER_CONFIG.JOBS_PER_PAGE);
        const startIndex = (this.currentPage - 1) * CAREER_CONFIG.JOBS_PER_PAGE + 1;
        const endIndex = Math.min(this.currentPage * CAREER_CONFIG.JOBS_PER_PAGE, this.filteredJobs.length);

        // Update pagination info
        paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${this.filteredJobs.length} jobs`;

        // Update button states
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        // Generate page numbers
        pageNumbers.innerHTML = '';
        const maxVisiblePages = CAREER_CONFIG.MAX_VISIBLE_PAGES;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.setAttribute('aria-label', `Go to page ${i}`);
            pageBtn.onclick = () => this.changePage(i);
            pageNumbers.appendChild(pageBtn);
        }
    }

    changePage(page) {
        this.currentPage = page;
        this.displayJobs();
        this.displayPagination();

        // Scroll to jobs section
        const targetElement = careerUtils.getElement('#current-positions');
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - CAREER_CONFIG.SCROLL_OFFSET,
                behavior: 'smooth'
            });
        }
    }

    showJobDetails(jobId) {
        const job = this.jobs.find(j => j.id === jobId);
        if (!job) return;

        const modal = careerUtils.getElement('#job-modal');
        if (!modal) return;

        // Update modal content
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = this.escapeHtml(job.title);
        }

        // Update meta badges
        const locationBadge = modal.querySelector('.meta-badge.location span');
        const typeBadge = modal.querySelector('.meta-badge.type span');
        const departmentBadge = modal.querySelector('.meta-badge.department span');

        if (locationBadge) locationBadge.textContent = displayMappings.locations[job.location] || job.location;
        if (typeBadge) typeBadge.textContent = displayMappings.types[job.type] || job.type;
        if (departmentBadge) departmentBadge.textContent = displayMappings.categories[job.department] || job.department;

        // Update job description
        const jobDescription = modal.querySelector('#modal-job-description');
        if (jobDescription) {
            jobDescription.innerHTML = `<p>${this.escapeHtml(job.description)}</p>`;
        }

        // Update requirements
        const jobRequirements = modal.querySelector('#modal-job-requirements');
        if (jobRequirements) {
            jobRequirements.innerHTML = `<p>${this.escapeHtml(job.requirements)}</p>`;
        }

        // Update benefits
        const jobBenefits = modal.querySelector('#modal-job-benefits');
        if (jobBenefits) {
            if (job.benefits && job.benefits.length > 0) {
                jobBenefits.innerHTML = `<ul class="benefits-list">${job.benefits.map(benefit => `<li>${this.escapeHtml(benefit)}</li>`).join('')}</ul>`;
            } else {
                jobBenefits.innerHTML = '<p>Benefits information will be provided during the interview process.</p>';
            }
        }

        // Update job details grid
        const jobDetailsGrid = modal.querySelector('#modal-job-details');
        if (jobDetailsGrid) {
            jobDetailsGrid.innerHTML = `
                <div class="detail-item">
                    <strong>Department</strong>
                    <span>${displayMappings.categories[job.department] || job.department}</span>
                </div>
                <div class="detail-item">
                    <strong>Location</strong>
                    <span>${displayMappings.locations[job.location] || job.location}</span>
                </div>
                <div class="detail-item">
                    <strong>Type</strong>
                    <span>${displayMappings.types[job.type] || job.type}</span>
                </div>
                <div class="detail-item">
                    <strong>Salary</strong>
                    <span>${this.escapeHtml(job.salary)}</span>
                </div>
                <div class="detail-item">
                    <strong>Posted</strong>
                    <span>${careerUtils.formatDate(job.postedDate)}</span>
                </div>
            `;
        }

        // Add skills section if skills exist
        const modalSections = modal.querySelector('.modal-sections');
        if (modalSections && job.skills && job.skills.length > 0) {
            let skillsSection = modalSections.querySelector('.skills-section');
            if (!skillsSection) {
                skillsSection = document.createElement('div');
                skillsSection.className = 'modal-section skills-section';
                skillsSection.innerHTML = `
                    <h3 class="section-title">
                        <i class="fas fa-code"></i>
                        Skills
                    </h3>
                    <div class="section-content">
                        <div class="skills-list"></div>
                    </div>
                `;
                const jobDetailsSection = modalSections.querySelector('.modal-section:last-child');
                if (jobDetailsSection) {
                    modalSections.insertBefore(skillsSection, jobDetailsSection);
                }
            }
            const skillsList = skillsSection.querySelector('.skills-list');
            if (skillsList) {
                skillsList.innerHTML = job.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('');
            }
        } else {
            const skillsSection = modalSections?.querySelector('.skills-section');
            if (skillsSection) {
                skillsSection.remove();
            }
        }

        // Bind event listeners
        this.bindModalEvents(modal);

        modal.style.display = 'flex';
        document.body.classList.add('modal-open');

        // Focus management for accessibility
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }

    bindModalEvents(modal) {
        // Close modal events
        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Apply button event
        const applyButton = modal.querySelector('.apply-btn');
        if (applyButton) {
            applyButton.addEventListener('click', () => this.scrollToApplication());
        }

        // Close on overlay click
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeModal());
        }
    }

    closeModal() {
        const modal = careerUtils.getElement('#job-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    scrollToApplication() {
        this.closeModal();
        const contactSection = careerUtils.getElement('.contact-section');
        if (contactSection) {
            window.scrollTo({
                top: contactSection.offsetTop - CAREER_CONFIG.SCROLL_OFFSET,
                behavior: 'smooth'
            });
        }
    }

    // Security: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Image slider with better performance
// Image slider with better performance
class ImageSlider {
    constructor() {
        this.currentSlideIndex = 0;
        this.slideInterval = null;
        this.slides = [];
        this.init();
    }

    init() {
        this.slides = document.querySelectorAll('.background-slide');
        if (this.slides.length === 0) return;

        // Set initial slide
        this.slides[this.currentSlideIndex].style.opacity = '1';
        this.startAutoSlide();
        this.bindEvents();
        this.updateSliderImages();
    }

    bindEvents() {
        const hero = careerUtils.getElement('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', () => this.pauseAutoSlide());
            hero.addEventListener('mouseleave', () => this.startAutoSlide());
        }

        // Optimized resize handler
        window.addEventListener('resize', careerUtils.debounce(() => this.updateSliderImages(), 250));
    }

    startAutoSlide() {
        if (this.slideInterval) clearInterval(this.slideInterval);
        this.slideInterval = setInterval(() => this.changeSlide(), CAREER_CONFIG.SLIDE_DURATION);
    }

    pauseAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    changeSlide() {
        if (this.slides.length === 0) return;

        this.slides[this.currentSlideIndex].style.opacity = '0';
        this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
        this.slides[this.currentSlideIndex].style.opacity = '1';
        this.updateSliderImages();
    }

    updateSliderImages() {
        const isMobile = window.innerWidth <= 768;
        this.slides.forEach(slide => {
            const desktopImage = slide.getAttribute('data-desktop');
            const mobileImage = slide.getAttribute('data-mobile');
            
            if (isMobile && mobileImage) {
                slide.style.backgroundImage = `url(${mobileImage})`;
            } else if (desktopImage) {
                slide.style.backgroundImage = `url(${desktopImage})`;
            }
        });
    }
}

// Form handler with better validation and UX
class FormHandler {
    constructor() {
        this.form = null;
        this.init();
    }

    init() {
        this.form = careerUtils.getElement('#resume-form');
        if (this.form) {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // File upload preview
        const fileInput = this.form.querySelector('#resume');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileChange(e));
        }
    }

    handleFileChange(e) {
        const file = e.target.files[0];
        const fileUploadContent = this.form.querySelector('.file-upload-content');
        
        if (file && fileUploadContent) {
            const fileName = file.name;
            const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
            
            fileUploadContent.innerHTML = `
                <i class="fas fa-file-alt"></i>
                <span>${fileName}</span>
                <small>${fileSize} MB</small>
            `;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Submit to Vercel serverless API
            const response = await fetch('/api/career', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Submission failed');
            }

            // Show success message
            this.showSuccessMessage();
            e.target.reset();

        } catch (error) {
            console.error('Form submission error:', error);
            alert(error.message || 'There was an error submitting your application. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        const requiredFields = ['name', 'email', 'resume'];
        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailField = this.form.querySelector('[name="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError(emailField, 'Please enter a valid email address');
                isValid = false;
            }
        }

        return isValid;
    }

    showFieldError(field, message) {
        if (!field) return;
        
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        if (!field) return;
        
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showSuccessMessage() {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h3>Application Submitted!</h3>
            <p>Thank you for your application. We will review your information and get back to you soon.</p>
        `;
        
        this.form.parentNode.insertBefore(successDiv, this.form);

        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }
}

// Main application class
class CareerApp {
    constructor() {
        this.jobManager = null;
        this.slider = null;
        this.formHandler = null;
    }

    init() {
        try {

            
            // Initialize components
            this.jobManager = new JobManager();
            this.slider = new ImageSlider();
            this.formHandler = new FormHandler();

            // Set global references
            state.isInitialized = true;

            // Bind global events
            this.bindGlobalEvents();

      

        } catch (error) {
            console.error('Failed to initialize career application:', error);
        }
    }

    bindGlobalEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            const modal = careerUtils.getElement('#job-modal');
            if (e.target === modal) {
                this.jobManager.closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.jobManager.closeModal();
            }
        });

        // Pagination button events
        const prevBtn = careerUtils.getElement('#prev-page');
        const nextBtn = careerUtils.getElement('#next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.jobManager.currentPage > 1) {
                    this.jobManager.changePage(this.jobManager.currentPage - 1);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.jobManager.filteredJobs.length / CAREER_CONFIG.JOBS_PER_PAGE);
                if (this.jobManager.currentPage < totalPages) {
                    this.jobManager.changePage(this.jobManager.currentPage + 1);
                }
            });
        }
    }
}

// Initialize application
let careerApp;
let jobManager;



// Function to initialize the application
function initializeCareerApp() {
    try {
        careerApp = new CareerApp();
        careerApp.init();
        jobManager = careerApp.jobManager;
    } catch (error) {
        console.error('Error initializing Career App:', error);
    }
}

// Try to initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCareerApp);
} else {
    // DOM is already ready
    initializeCareerApp();
}

// Also try initializing when window loads (as a fallback)
window.addEventListener('load', () => {
   if (!careerApp) {
        initializeCareerApp();
    }
    
    // Initialize slider when window is loaded (for images)
    if (careerApp && careerApp.slider) {
        careerApp.slider.init();
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];

        }, 0);
    });
}

// Career Page Background Slider - Performance Optimized
document.addEventListener('DOMContentLoaded', function() {
    
    // Background slider functionality
    const backgroundSlider = document.querySelector('.background-slider');
    const backgroundSlides = document.querySelectorAll('.background-slide');
    
    if (backgroundSlider && backgroundSlides.length > 0) {
        let currentSlide = 0;
        const totalSlides = backgroundSlides.length;
        
        // Initialize first slide
        if (backgroundSlides[0]) {
            backgroundSlides[0].classList.add('active');
        }
        
        // Function to change slides with performance optimization
        function changeSlide() {
            // Remove active class from current slide
            backgroundSlides[currentSlide].classList.remove('active');
            
            // Move to next slide
            currentSlide = (currentSlide + 1) % totalSlides;
            
            // Add active class to new slide
            backgroundSlides[currentSlide].classList.add('active');
        }
        
        // Start automatic slide change every 5 seconds
        const slideInterval = setInterval(changeSlide, 5000);
        
        // Pause on hover for better UX
        backgroundSlider.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        backgroundSlider.addEventListener('mouseleave', () => {
            // Restart interval when mouse leaves
            setInterval(changeSlide, 5000);
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(slideInterval);
        });
    }
    
    // Job search functionality (placeholder for future implementation)
    const jobSearchInput = document.getElementById('job-search');
    if (jobSearchInput) {
        jobSearchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // TODO: Implement actual job search functionality
        });
    }
    
    // Filter functionality (placeholder for future implementation)
    const departmentFilter = document.getElementById('department-filter');
    const locationFilter = document.getElementById('location-filter');
    const typeFilter = document.getElementById('type-filter');
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function(e) {
            // TODO: Implement actual filtering
        });
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', function(e) {
            // TODO: Implement actual filtering
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function(e) {
            // TODO: Implement actual filtering
        });
    }
    
    // Resume form functionality (placeholder for future implementation)
    const resumeForm = document.getElementById('resume-form');
    if (resumeForm) {
        resumeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Implement actual form submission
        });
    }
    
    // File upload functionality
    const fileUpload = document.getElementById('resume');
    const fileUploadContent = document.querySelector('.file-upload-content');
    
    if (fileUpload && fileUploadContent) {
        fileUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Update the display to show selected file
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
                
                fileUploadContent.innerHTML = `
                    <i class="fa fa-check" style="color: #10b981;"></i>
                    <span>${fileName}</span>
                    <small>${fileSize} MB</small>
                `;
            }
        });
        
        // Drag and drop functionality
        const fileUploadContainer = fileUpload.closest('.file-upload');
        if (fileUploadContainer) {
            fileUploadContainer.addEventListener('dragover', function(e) {
                e.preventDefault();
                fileUploadContainer.style.borderColor = '#6A89A7';
                fileUploadContainer.style.backgroundColor = '#f8fafc';
            });
            
            fileUploadContainer.addEventListener('dragleave', function(e) {
                e.preventDefault();
                fileUploadContainer.style.borderColor = '#e2e8f0';
                fileUploadContainer.style.backgroundColor = 'transparent';
            });
            
            fileUploadContainer.addEventListener('drop', function(e) {
                e.preventDefault();
                fileUploadContainer.style.borderColor = '#e2e8f0';
                fileUploadContainer.style.backgroundColor = 'transparent';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileUpload.files = files;
                    fileUpload.dispatchEvent(new Event('change'));
                }
            });
        }
    }
    
    // Job modal functionality (placeholder for future implementation)
    const jobCards = document.querySelectorAll('.job-card');
    const jobModal = document.getElementById('job-modal');
    const modalClose = document.querySelector('.modal-close');
    
    if (jobCards.length > 0 && jobModal) {
        jobCards.forEach(card => {
            card.addEventListener('click', function() {
                // TODO: Implement modal opening with job details
                jobModal.style.display = 'block';
                document.body.classList.add('modal-open');
            });
        });
        
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                jobModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        // Close modal when clicking overlay
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function() {
                jobModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
    }
    
    // Pagination functionality (placeholder for future implementation)
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', function() {
            // TODO: Implement pagination
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', function() {
            // TODO: Implement pagination
        });
    }
    
});

