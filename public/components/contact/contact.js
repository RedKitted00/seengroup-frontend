
const CONTACT_CONFIG = {
    ANIMATION_DURATION: 300,
    SEARCH_DEBOUNCE: 300
};

const contactUtils = {
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

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};

class ContactFormHandler {
    constructor() {
        this.form = null;
        this.requirementsTable = null;
        this.addRowBtn = null;
        this.submitBtn = null;
        this.successMessage = null;
        this.productData = null;
        this.init();
    }

    init() {
        this.form = contactUtils.getElement('#lead-form');
        this.requirementsTable = contactUtils.getElement('#requirements-table');
        this.addRowBtn = contactUtils.getElement('#add-row-btn');
        this.submitBtn = contactUtils.getElement('#submit-btn');
        this.successMessage = contactUtils.getElement('#success-message');
        
        // Check for product data in URL
        this.checkForProductData();
        
        if (this.form) {
            this.bindEvents();
            this.initializeTable();
        } else {
            console.error('ContactFormHandler: Form not found!');
        }
    }

    checkForProductData() {
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');
        
        if (productParam) {
            try {
                this.productData = JSON.parse(decodeURIComponent(productParam));
            } catch (error) {
                console.error('Error parsing product data:', error);
            }
        }
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        if (this.addRowBtn) {
            this.addRowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTableRow();
            });
        } else {
            console.error('ContactFormHandler: add-row-btn not found!');
        }

        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', contactUtils.debounce(() => this.validateField(input), 300));
        });

        const phoneInput = contactUtils.getElement('#phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e.target));
        }
    }

    initializeTable() {
        if (this.requirementsTable) {
            this.addTableRow();
        }
    }

    addTableRow() {
        if (!this.requirementsTable) {
            console.error('ContactFormHandler: requirementsTable not found!');
            return;
        }

        const tbody = contactUtils.getElement('#requirements-tbody');
        if (!tbody) {
            console.error('ContactFormHandler: requirements-tbody not found!');
            return;
        }

        const row = document.createElement('tr');
        row.className = 'requirement-row';
        row.innerHTML = `
            <td>
                <input type="text" name="productName[]" placeholder="Enter product name" required>
            </td>
            <td>
                <input type="text" name="partNumber[]" placeholder="Enter part number">
            </td>
            <td>
                <input type="number" name="quantity[]" placeholder="Qty" min="1" required>
            </td>
            <td>
                <select name="leadTime[]" required>
                    <option value="">Select</option>
                    <option value="immediate">Immediate</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2+ months">2+ months</option>
                </select>
            </td>
            <td>
                <button type="button" class="remove-row-btn" onclick="contactFormHandler.removeTableRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        this.animateRowIn(row);
    }

    removeTableRow(button) {
        const row = button.closest('tr');
        if (row) {
            this.animateRowOut(row, () => {
                row.remove();
                const remainingRows = contactUtils.getElement('#requirements-tbody').querySelectorAll('tr');
                if (remainingRows.length === 0) {
                    this.addTableRow();
                }
            });
        }
    }

    animateRowIn(row) {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        });
    }

    animateRowOut(row, callback) {
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateY(-20px)';
        
        setTimeout(callback, 300);
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 3) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
            }
        }
        
        input.value = value;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        if (field.type === 'email' && value && !contactUtils.validateEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        if (field.name === 'phone' && value && !contactUtils.validatePhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        if (field.name === 'quantity[]' && value) {
            const quantity = parseInt(value);
            if (isNaN(quantity) || quantity < 1) {
                isValid = false;
                errorMessage = 'Please enter a valid quantity (minimum 1)';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.seen-contact-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'seen-contact-error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.seen-contact-error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        const tableRows = contactUtils.getElement('#requirements-tbody').querySelectorAll('tr');
        if (tableRows.length === 0) {
            isValid = false;
            contactUtils.showNotification('Please add at least one product requirement', 'error');
        }

        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            contactUtils.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        const originalText = this.submitBtn.innerHTML;
        
        this.submitBtn.disabled = true;
        this.submitBtn.querySelector('.seen-contact-loading').classList.add('show');
        this.submitBtn.querySelector('.seen-contact-btn-text').style.opacity = '0';

        try {
            const formData = new FormData(this.form);
            
            const tableRows = contactUtils.getElement('#requirements-tbody').querySelectorAll('tr');
            const requirements = [];
            
            tableRows.forEach(row => {
                const inputs = row.querySelectorAll('input, select');
                const requirement = {};
                inputs.forEach(input => {
                    requirement[input.name.replace('[]', '')] = input.value;
                });
                requirements.push(requirement);
            });
            
            formData.append('requirements', JSON.stringify(requirements));
            
            // Add product context if available
            if (this.productData) {
                formData.append('productContext', JSON.stringify({
                    sourceProduct: this.productData,
                    sourcePage: 'product-modal',
                    timestamp: new Date().toISOString()
                }));
            }

            // Use the frontend API route which will forward to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    company: formData.get('company'),
                    country: formData.get('country'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                    requirements: formData.get('requirements'),
                    productContext: formData.get('productContext')
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Submission failed');
            }

            this.showSuccessMessage();
            this.form.reset();
            this.resetTable();
            
        } catch (error) {
            console.error('Form submission error:', error);
            contactUtils.showNotification(error.message || 'There was an error submitting your request. Please try again.', 'error');
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.querySelector('.seen-contact-loading').classList.remove('show');
            this.submitBtn.querySelector('.seen-contact-btn-text').style.opacity = '1';
        }
    }

    showSuccessMessage() {
        if (this.successMessage) {
            this.successMessage.classList.add('show');
            
            setTimeout(() => {
                this.successMessage.classList.remove('show');
            }, 5000);
        }
        
        contactUtils.showNotification('Thank you! Your request has been submitted successfully.', 'success');
    }

    resetTable() {
        const tbody = contactUtils.getElement('#requirements-tbody');
        if (tbody) {
            tbody.innerHTML = '';
            this.addTableRow();
        }
    }
}

// Initialize application
let contactFormHandler;

document.addEventListener('DOMContentLoaded', () => {
    contactFormHandler = new ContactFormHandler();
});

// Also try initializing when window loads (in case DOMContentLoaded already fired)
window.addEventListener('load', () => {
    if (!contactFormHandler) {
        contactFormHandler = new ContactFormHandler();
    }
});

