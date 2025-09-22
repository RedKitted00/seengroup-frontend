"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import './style.css';
import Icon from '../ui/Icon';
import API_CONFIG from '../../../config/api';
import { useTranslation } from '@/lib/i18n/useTranslation';
// Extend Window interface for API_CONFIG
declare global {
    interface Window {
        API_CONFIG?: typeof API_CONFIG;
        onTurnstileSuccess?: (token: string) => void;
        onTurnstileExpired?: () => void;
        onTurnstileError?: () => void;
    }
}

interface ProductInfo {
    id: string;
    name: string;
    oemNumber: string;
    manufacturer: string;
    category: string;
    price?: number;
}

interface FormData {
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    phone: string;
    email: string;
    contactReason: string;
    message: string;
}

interface ProductRequirement {
    id: string;
    productName: string;
    partNumber: string;
    manufacturer: string;
    price: number | null;
    quantity: number;
    leadTime: string;
    isPreFilled?: boolean;
}


interface FormErrors {
    firstName?: string;
    lastName?: string;
    company?: string;
    country?: string;
    phone?: string;
    email?: string;
    contactReason?: string;
    message?: string;
    products?: string;
    submit?: string;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    duration?: number;
}

// Country to phone number mapping
const countryPhoneMapping: { [key: string]: { code: string; format: string; example: string } } = {
    'Turkey': { code: '+90', format: '+90 XXX XXX XX XX', example: '+90 212 438 75 50' },
    'United States': { code: '+1', format: '+1 (XXX) XXX-XXXX', example: '+1 (555) 123-4567' },
    'United Kingdom': { code: '+44', format: '+44 XXXX XXX XXX', example: '+44 20 7946 0958' },
    'Germany': { code: '+49', format: '+49 XXX XXXXXXX', example: '+49 30 12345678' },
    'France': { code: '+33', format: '+33 X XX XX XX XX', example: '+33 1 42 86 83 26' },
    'Italy': { code: '+39', format: '+39 XXX XXX XXXX', example: '+39 06 1234 5678' },
    'Spain': { code: '+34', format: '+34 XXX XXX XXX', example: '+34 91 123 45 67' },
    'Canada': { code: '+1', format: '+1 (XXX) XXX-XXXX', example: '+1 (416) 123-4567' },
    'Australia': { code: '+61', format: '+61 X XXXX XXXX', example: '+61 2 1234 5678' },
    'Japan': { code: '+81', format: '+81 X-XXXX-XXXX', example: '+81 3-1234-5678' },
    'South Korea': { code: '+82', format: '+82 XX-XXXX-XXXX', example: '+82 2-1234-5678' },
    'China': { code: '+86', format: '+86 XXX XXXX XXXX', example: '+86 10 1234 5678' },
    'India': { code: '+91', format: '+91 XXXXX XXXXX', example: '+91 98765 43210' },
    'Brazil': { code: '+55', format: '+55 XX XXXXX-XXXX', example: '+55 11 91234-5678' },
    'Mexico': { code: '+52', format: '+52 XX XXXX XXXX', example: '+52 55 1234 5678' },
    'Netherlands': { code: '+31', format: '+31 X XXXX XXXX', example: '+31 20 123 4567' },
    'Switzerland': { code: '+41', format: '+41 XX XXX XX XX', example: '+41 44 123 45 67' },
    'Sweden': { code: '+46', format: '+46 XX XXX XX XX', example: '+46 8 123 45 67' },
    'Norway': { code: '+47', format: '+47 XXX XX XXX', example: '+47 22 12 34 56' },
    'Denmark': { code: '+45', format: '+45 XX XX XX XX', example: '+45 12 34 56 78' },
    'Finland': { code: '+358', format: '+358 XX XXX XXXX', example: '+358 9 123 4567' },
    'Poland': { code: '+48', format: '+48 XXX XXX XXX', example: '+48 22 123 45 67' },
    'Czech Republic': { code: '+420', format: '+420 XXX XXX XXX', example: '+420 2 1234 5678' },
    'Austria': { code: '+43', format: '+43 X XXXXXXX', example: '+43 1 1234567' },
    'Belgium': { code: '+32', format: '+32 X XXX XX XX', example: '+32 2 123 45 67' },
    'Portugal': { code: '+351', format: '+351 XXX XXX XXX', example: '+351 21 123 4567' },
    'Greece': { code: '+30', format: '+30 XXX XXX XXXX', example: '+30 21 1234 5678' },
    'Other': { code: '+', format: '+XXX XXX XXX XXX', example: '+123 456 789 012' }
};

// Function to get country code for a country
const getCountryCode = (country: string): string => {
    const mapping = countryPhoneMapping[country];
    if (!mapping) return '';

    // Return only the country code
    return mapping.code;
};

export default function Contact() {
    const { t } = useTranslation();
    const router = useRouter();
    const [productData, setProductData] = useState<ProductInfo | null>(null);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        company: '',
        country: '',
        phone: '',
        email: '',
        contactReason: '',
        message: ''
    });
    const [productRequirements, setProductRequirements] = useState<ProductRequirement[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [isContactReasonDisabled, setIsContactReasonDisabled] = useState<boolean>(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);


    // Handle product data from URL parameters and set API config
    useEffect(() => {
        // Make API configuration available to client-side JavaScript
        if (typeof window !== 'undefined') {
            window.API_CONFIG = API_CONFIG;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');

        if (productParam) {
            try {
                const raw = JSON.parse(decodeURIComponent(productParam));

                // Normalize incoming product object to expected shape
                const normalized: ProductInfo = {
                    id: String(raw.id ?? raw._id ?? ''),
                    name: raw.name ?? raw.productName ?? raw.title ?? raw.modelName ?? raw.model ?? '',
                    oemNumber: raw.oemNumber ?? raw.partNumber ?? raw.sku ?? raw.oem ?? '',
                    manufacturer: raw.manufacturer ?? raw.brand ?? '',
                    category: raw.category ?? raw.type ?? '',
                    price: typeof raw.price === 'number' ? raw.price : (typeof raw.price?.value === 'number' ? raw.price.value : undefined)
                };

                setProductData(normalized);

                // Auto-add the product to the requirements table
                addProductToTable(normalized);
                
                // Auto-select "sales" as contact reason when coming from product page
                setFormData(prev => ({
                    ...prev,
                    contactReason: 'sales'
                }));
                
                // Disable contact reason dropdown when coming from product page
                setIsContactReasonDisabled(true);

                // Bug A Fix: Scroll to contact form when coming from product page
                setTimeout(() => {
                    const formElement = document.getElementById('lead-form');
                    if (formElement) {
                        formElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                }, 100); // Small delay to ensure DOM is ready
            } catch (error) {
                console.error('Error parsing product data:', error);
            }
        }
    }, []);

    // Clean URL to remove query parameters
    const cleanUrl = useCallback(() => {
        if (window.location.search) {
            router.replace('/contact', { scroll: false });
        }
    }, [router]);


    // Handle URL parameters and clean URL when needed
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const productParam = urlParams.get('product');
        
        // Always clean URL on component mount
        // This handles both refresh and navigation scenarios
        cleanUrl();
        
        // If there's a product parameter, process it (from product page navigation)
        if (productParam) {
            // Product data will be processed by the first useEffect
            // Just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // No product parameter, just scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [cleanUrl]);

    // Optimized background image loading
    useEffect(() => {
        // Set background as loaded immediately to prevent CORS issues
        setBackgroundLoaded(true);
    }, []);

    // Load Cloudflare Turnstile script and set callbacks
    useEffect(() => {
        const existing = document.querySelector('script[data-turnstile]') as HTMLScriptElement | null;
        if (!existing) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.setAttribute('data-turnstile', 'true');
            document.head.appendChild(script);
        }

        const showInlineError = (message: string, duration: number = 5000) => {
            const id = Date.now().toString();
            const notification: Notification = { id, type: 'error', message, duration };
            setNotifications(prev => [...prev, notification]);
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        };

        // Expose callbacks for the Turnstile widget
        window.onTurnstileSuccess = (token: string) => {
            setCaptchaToken(token);
        };
        window.onTurnstileExpired = () => {
            setCaptchaToken(null);
        };
        window.onTurnstileError = () => {
            setCaptchaToken(null);
            showInlineError('Captcha verification failed. Please try again.');
        };

        return () => {
            delete window.onTurnstileSuccess;
            delete window.onTurnstileExpired;
            delete window.onTurnstileError;
        };
    }, []);


    // Function to remove notification
    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    // Function to add notification
    const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string, duration: number = 5000) => {
        const id = Date.now().toString();
        const notification: Notification = { id, type, message, duration };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after duration
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    }, [removeNotification]);

    // Function to add product to requirements table
    const addProductToTable = (product: ProductInfo) => {
        const newRequirement: ProductRequirement = {
            id: Date.now().toString(),
            productName: product.name,
            partNumber: product.oemNumber,
            manufacturer: product.manufacturer,
            price: product.price || null,
            quantity: 1,
            leadTime: '',
            isPreFilled: true
        };
        setProductRequirements(prev => [...prev, newRequirement]);
    };

    // Function to add empty row for manual product input
    const addEmptyRow = () => {
        const newRequirement: ProductRequirement = {
            id: Date.now().toString(),
            productName: '',
            partNumber: '',
            manufacturer: '',
            price: null,
            quantity: 1,
            leadTime: ''
        };
        setProductRequirements(prev => [...prev, newRequirement]);
    };

    // Function to remove row
    const removeRow = (id: string) => {
        setProductRequirements(prev => prev.filter(item => item.id !== id));
    };

    // Function to update product requirement field
    const updateProductRequirement = (id: string, field: keyof ProductRequirement, value: string | number | null) => {
        setProductRequirements(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };



    // Handle form input changes
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => {
            const newFormData = { ...prev, [field]: value };

            // Auto-fill country code when country is selected
            if (field === 'country' && value && value !== '') {
                const countryCode = getCountryCode(value);
                if (countryCode) {
                    newFormData.phone = countryCode;
                }
            }

            return newFormData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Validation functions
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Required field validation
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.company.trim()) newErrors.company = 'Company name is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.contactReason) newErrors.contactReason = 'Please select a contact reason';

        // Message validation for non-sales contacts
        if (formData.contactReason && formData.contactReason !== 'sales' && !formData.message.trim()) {
            newErrors.message = 'Please provide details about your inquiry';
        }

        // Format validation
        if (formData.email && !validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Product requirements validation (only for sales)
        if (formData.contactReason === 'sales') {
            if (productRequirements.length === 0) {
                newErrors.products = 'At least one product is required';
            } else {
                const invalidProducts = productRequirements.some(req =>
                    !req.productName.trim() || 
                    !req.partNumber.trim() || 
                    !req.manufacturer.trim() || 
                    (req.price !== null && req.price <= 0) || 
                    !req.leadTime || 
                    req.quantity < 1
                );
                if (invalidProducts) {
                    newErrors.products = 'Please fill in all product details (name, part number, manufacturer, quantity, and lead time). Price is optional.';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Focus the first invalid field when validation fails
    const focusFirstError = (errs: FormErrors) => {
        const order: (keyof FormErrors)[] = ['firstName','lastName','company','country','phone','email','contactReason','message','products','submit'];
        const firstKey = order.find(k => errs[k] !== undefined);
        if (!firstKey) return;
        const targetId = firstKey === 'products' ? 'requirements-table' : String(firstKey);
        const el = document.getElementById(targetId);
        if (el && 'focus' in el) {
            (el as HTMLElement).focus();
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            addNotification('error', 'Please fix the errors in the form before submitting.');
            // ensure the first error receives focus
            focusFirstError({ ...errors });
            return;
        }


        setIsSubmitting(true);
        addNotification('info', 'Submitting your request...', 3000);

        try {
            // Format data according to backend expectations
            const submissionData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                company: formData.company,
                country: formData.country,
                phone: formData.phone,
                email: formData.email,
                contactReason: formData.contactReason,
                message: formData.message,
                requirements: formData.contactReason === 'sales' ? JSON.stringify(productRequirements) : undefined,
                productContext: productData ? JSON.stringify(productData) : undefined,
                captchaToken: captchaToken
            };


            // Always use the Next.js API route; it will forward to the backend server-side
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout to allow cold starts
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to submit form');
            }

            setIsSubmitted(true);
            addNotification('success', 'Your request has been submitted successfully! We&rsquo;ll contact you within 24 hours.');

            // Move focus to success message for screen readers
            setTimeout(() => {
                const success = document.getElementById('success-message');
                success?.focus?.();
            }, 0);

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                company: '',
                country: '',
                phone: '',
                email: '',
                contactReason: '',
                message: ''
            });
            setProductRequirements([]);
            setErrors({});
            setCaptchaToken(null);
            cleanUrl();

        } catch (error) {
            console.error('Form submission error:', error);
            let errorMessage = 'Failed to submit form. Please try again.';
            if (error instanceof DOMException && error.name === 'AbortError') {
                errorMessage = 'The request timed out. Please try again in a moment.';
            } else if (error instanceof Error && error.message) {
                errorMessage = error.message;
            }

            // In development, show more detailed error information
            if (process.env.NODE_ENV === 'production') {
                console.error('Detailed error:', error);
            }

            setErrors({ submit: errorMessage });
            addNotification('error', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <link
                    rel="preload"
                    as="image"
                    href="https://pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev/product-images/World%20map-09.jpg"
                    type="image/jpeg"
                    fetchPriority="high"
                />
            </Head>
            
            {/* Notification Container with aria-live */}
            <div className="notification-container" role="status" aria-live="polite" aria-atomic="true">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`notification notification-${notification.type} show`}
                        onClick={() => removeNotification(notification.id)}
                    >
                        <div className="notification-icon">
                            {notification.type === 'success' && <Icon name="icon-check" size={16} />}
                            {notification.type === 'error' && <Icon name="icon-alert" size={16} />}
                            {notification.type === 'info' && <Icon name="icon-spinner" className="animate-spin" size={16} />}
                        </div>
                        <div className="notification-content">
                            <div className="notification-message">{notification.message}</div>
                        </div>
                        <button
                            className="notification-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                        >
                            <Icon name="icon-cross" size={12} />
                        </button>
                    </div>
                ))}
            </div>


            <div className={`seen-contact-form-container ${backgroundLoaded ? 'background-loaded' : 'background-loading'}`}>
                {/* Background Image */}
                <div className="seen-contact-background-image">
                    <Image
                        src="https://pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev/product-images/World%20map-09.jpg"
                        alt="World Map Background"
                        fill
                        priority
                        quality={85}
                        className="seen-contact-bg-img"
                        onLoad={() => setBackgroundLoaded(true)}
                        onError={() => setBackgroundLoaded(true)}
                    />
                </div>
                
                {/* Office Locations Section */}
                <div className="seen-contact-offices-section">
                    <h2 className="seen-contact-offices-title">
                        <Icon name="icon-location" className="text-orange-500" size={20} />
                        {t('contact.global_offices')}
                    </h2>
                    <div className="seen-contact-offices-grid">


                    {/* Turkey Office */}
                    <div className="seen-contact-office-card">
                        <div className="seen-contact-office-header">
                            <div className="seen-contact-office-icon">
                                <Image 
                                    src="/imgs/globe_2.png" 
                                    alt="Turkey Office" 
                                    width={40} 
                                    height={40}
                                    className="seen-contact-globe-icon"
                                    priority
                                />
                            </div>
                            <div className="seen-contact-office-info">
                                <h3 className="seen-contact-office-name">SEEN GROUP</h3>
                                <p className="seen-contact-office-country">Turkey</p>
                            </div>
                        </div>
                       
                        <a
                            href="https://maps.app.goo.gl/W1x9R5D6Zi6vTBqe7?g_st=atm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="seen-contact-directions-btn"
                        >
                            <Icon name="icon-location" size={16} />
                            {t('contact.get_directions')}
                        </a>
                    </div>

                    {/* Germany Office */}
                    <div className="seen-contact-office-card">
                        <div className="seen-contact-office-header">
                            <div className="seen-contact-office-icon">
                                <Image 
                                    src="/imgs/globe_3.png" 
                                    alt="Germany Office" 
                                    width={40} 
                                    height={40}
                                    className="seen-contact-globe-icon"
                                    priority
                                />
                            </div>
                            <div className="seen-contact-office-info">
                                <h3 className="seen-contact-office-name">SEEN GmbH</h3>
                                <p className="seen-contact-office-country">Germany</p>
                            </div>
                        </div>
                      
                        <a
                            href="https://maps.app.goo.gl/pkTo5kv8gcQbEvBc8?g_st=atm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="seen-contact-directions-btn"
                        >
                            <Icon name="icon-location" size={16} />
                            {t('contact.get_directions')}
                        </a>
                    </div>

                    {/* UAE Office */}
                    <div className="seen-contact-office-card">
                        <div className="seen-contact-office-header">
                            <div className="seen-contact-office-icon">
                                <Image 
                                    src="/imgs/globle-1.png" 
                                    alt="UAE Office" 
                                    width={40} 
                                    height={40}
                                    className="seen-contact-globe-icon"
                                    priority
                                />
                            </div>
                            <div className="seen-contact-office-info">
                                <h3 className="seen-contact-office-name">SEEN GROUP UAE</h3>
                                <p className="seen-contact-office-country">United Arab Emirates</p>
                            </div>
                        </div>
               
                        <a
                            href="https://maps.app.goo.gl/tTbrFEvQxdn6FEAG9?g_st=atm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="seen-contact-directions-btn"
                        >
                            <Icon name="icon-location" size={16} />
                            {t('contact.get_directions')}
                        </a>
                    </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="seen-contact-form-header">
                        <h1 className="seen-contact-form-title">{t('contact.title')}</h1>
                        <p className="seen-contact-form-subtitle">
                            {t('contact.subtitle')}
                        </p>


                        {productData && (
                            <div className="seen-contact-product-info">
                                <div className="seen-contact-product-badge">
                                    <Icon name="icon-package" size={16} />
                                    <span>{t('contact.product_prefilled')}</span>
                                </div>
                                <div className="seen-contact-product-details">
                                    <strong>{productData.name}</strong>
                                    <span>OEM: {productData.oemNumber}</span>
                                    <span>Manufacturer: {productData.manufacturer}</span>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="seen-contact-form-card">

                        {isSubmitted && (
                            <div id="success-message" className="seen-contact-success-message" tabIndex={-1} role="status" aria-live="polite">
                                <Icon name="icon-check" className="mr-2" size={16} />
                                Thank you! Your request has been submitted successfully. We&apos;ll contact
                                you soon.
                            </div>
                        )}

                        {errors.submit && (
                            <div className="seen-contact-error-message" role="alert">
                                {errors.submit}
                            </div>
                        )}

                        <form id="lead-form" noValidate onSubmit={handleSubmit}>
                            <div className="seen-contact-form-section">
                                <h2 className="seen-contact-section-title">
                                    <Icon name="icon-user" className="text-orange-500" size={16} />
                                    {t('contact.contact_info')}
                                </h2>

                                <div className="seen-contact-form-grid">
                                    <div className="seen-contact-form-group">
                                        <label htmlFor="firstName" className="seen-contact-form-label">
                                            {t('contact.form.first_name')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            className={`seen-contact-form-input ${errors.firstName ? 'error' : ''}`}
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            aria-invalid={!!errors.firstName}
                                            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                                        />
                                        {errors.firstName && <div id="firstName-error" className="seen-contact-error-message">{errors.firstName}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="lastName" className="seen-contact-form-label">
                                            {t('contact.form.last_name')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className={`seen-contact-form-input ${errors.lastName ? 'error' : ''}`}
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            aria-invalid={!!errors.lastName}
                                            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                                        />
                                        {errors.lastName && <div id="lastName-error" className="seen-contact-error-message">{errors.lastName}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="company" className="seen-contact-form-label">
                                            {t('contact.form.company')} *
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            className={`seen-contact-form-input ${errors.company ? 'error' : ''}`}
                                            required
                                            value={formData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            aria-invalid={!!errors.company}
                                            aria-describedby={errors.company ? 'company-error' : undefined}
                                        />
                                        {errors.company && <div id="company-error" className="seen-contact-error-message">{errors.company}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="country" className="seen-contact-form-label">
                                            {t('contact.form.country')} *
                                        </label>
                                        <select
                                            id="country"
                                            name="country"
                                            className={`seen-contact-form-select ${errors.country ? 'error' : ''}`}
                                            required
                                            value={formData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            aria-invalid={!!errors.country}
                                            aria-describedby={errors.country ? 'country-error' : undefined}
                                        >
                                            <option value="">{t('contact.form.select_country')}</option>
                                            <option value="Turkey">Turkey</option>
                                            <option value="United States">United States</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Japan">Japan</option>
                                            <option value="South Korea">South Korea</option>
                                            <option value="China">China</option>
                                            <option value="India">India</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Denmark">Denmark</option>
                                            <option value="Finland">Finland</option>
                                            <option value="Poland">Poland</option>
                                            <option value="Czech Republic">Czech Republic</option>
                                            <option value="Austria">Austria</option>
                                            <option value="Belgium">Belgium</option>
                                            <option value="Portugal">Portugal</option>
                                            <option value="Greece">Greece</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {errors.country && <div id="country-error" className="seen-contact-error-message">{errors.country}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="phone" className="seen-contact-form-label">
                                            {t('contact.form.phone')} *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            className={`seen-contact-form-input ${errors.phone ? 'error' : ''}`}
                                            required
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder={formData.country ? countryPhoneMapping[formData.country]?.example : 'Enter your phone number'}
                                            aria-invalid={!!errors.phone}
                                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                                        />
                                        {errors.phone && <div id="phone-error" className="seen-contact-error-message">{errors.phone}</div>}
                                    </div>

                                    <div className="seen-contact-form-group">
                                        <label htmlFor="email" className="seen-contact-form-label">
                                            {t('contact.form.email')} *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            className={`seen-contact-form-input ${errors.email ? 'error' : ''}`}
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            aria-invalid={!!errors.email}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                        />
                                        {errors.email && <div id="email-error" className="seen-contact-error-message">{errors.email}</div>}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Reason Section */}
                            <div className="seen-contact-form-section">
                                <h2 className="seen-contact-section-title">
                                    <Icon name="icon-message" className="text-orange-500" size={16} />
                                    {t('contact.contact_reason')}
                                </h2>

                                <div className="seen-contact-form-group">
                                    <label htmlFor="contactReason" className="seen-contact-form-label">
                                        {t('contact.how_can_help')} *
                                    </label>
                                    <select
                                        id="contactReason"
                                        name="contactReason"
                                        className={`seen-contact-form-select ${errors.contactReason ? 'error' : ''} ${isContactReasonDisabled ? 'disabled' : ''}`}
                                        required
                                        value={formData.contactReason}
                                        onChange={(e) => handleInputChange('contactReason', e.target.value)}
                                        disabled={isContactReasonDisabled}
                                        aria-invalid={!!errors.contactReason}
                                        aria-describedby={errors.contactReason ? 'contactReason-error' : undefined}
                                    >
                                        <option value="">{t('contact.form.select_reason')}</option>
                                        <option value="sales">{t('contact.reasons.sales')}</option>
                                        <option value="complaint">{t('contact.reasons.complaint')}</option>
                                        <option value="follow-up">{t('contact.reasons.follow_up')}</option>
                                        <option value="quality-warranty">{t('contact.reasons.quality_warranty')}</option>
                                        <option value="financial">{t('contact.reasons.financial')}</option>
                                    </select>
                                    {errors.contactReason && <div id="contactReason-error" className="seen-contact-error-message">{errors.contactReason}</div>}
                                </div>

                                {/* Conditional Message Field */}
                                {formData.contactReason && formData.contactReason !== 'sales' && (
                                    <div className="seen-contact-form-group">
                                        <label htmlFor="message" className="seen-contact-form-label">
                                            {t('contact.please_provide_details')} *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            className={`seen-contact-form-textarea ${errors.message ? 'error' : ''}`}
                                            required
                                            rows={4}
                                            placeholder={`Please describe your ${formData.contactReason.replace('-', ' ')} in detail...`}
                                            value={formData.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            aria-invalid={!!errors.message}
                                            aria-describedby={errors.message ? 'message-error' : undefined}
                                        />
                                        {errors.message && <div id="message-error" className="seen-contact-error-message">{errors.message}</div>}
                                    </div>
                                )}
                            </div>

                            {/* Product Requirements Section - Only show for Sales */}
                            {formData.contactReason === 'sales' && (
                                <div className="seen-contact-form-section">
                                    <h2 className="seen-contact-section-title">
                                        <Icon name="icon-package" className="text-orange-500" size={16} />
                                        {productData ? t('contact.product_inquiry') : t('contact.product_requirements')}
                                    </h2>

                                    {/* Show context message when product is pre-selected */}
                                    {productData && (
                                        <p className="seen-contact-section-subtitle">
                                            You&apos;re inquiring about: <strong>{productData.name}</strong>
                                            <br />
                                            <small>Please fill in the lead time and quantity details below.</small>
                                        </p>
                                    )}

                                    {/* Show help message for manual product input */}
                                    {!productData && (
                                        <p className="seen-contact-section-subtitle">
                                            <small>Please enter the product details manually. Include the product name, part number, manufacturer, and quantity for accurate quote processing. Price is optional.</small>
                                        </p>
                                    )}

                                    <div className="seen-contact-table-container">
                                        <table
                                            className={`seen-contact-requirements-table ${productData ? 'single-product' : ''}`}
                                            id="requirements-table"
                                            aria-invalid={!!errors.products}
                                            aria-describedby={errors.products ? 'products-error' : undefined}
                                            tabIndex={errors.products ? -1 : undefined}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>{t('contact.table.product_name')}</th>
                                                    <th>{t('contact.table.part_number')}</th>
                                                    <th>Manufacturer</th>
                                                  
                                                    <th>{t('contact.table.quantity')}</th>
                                                    <th>{t('contact.table.lead_time')}</th>
                                                    <th>{t('contact.table.action')}</th>
                                                </tr>
                                            </thead>
                                            <tbody id="requirements-tbody">
                                                {productRequirements.map(req => (
                                                    <tr key={req.id} className={req.isPreFilled ? 'pre-filled-product' : ''} style={{color: "#000000"}}>
                                                        <td data-label={t('contact.table.product_name')}>
                                                            <input
                                                                type="text"
                                                                name="productName[]"
                                                                value={req.productName}
                                                                placeholder="Enter product name"
                                                                readOnly={req.isPreFilled}
                                                                className={req.isPreFilled ? 'readonly-input' : ''}
                                                                style={{ width: '24ch' }}
                                                                onChange={(e) => updateProductRequirement(req.id, 'productName', e.target.value)}
                                                            />
                                                        </td>
                                                        <td data-label={t('contact.table.part_number')}>
                                                            <input
                                                                type="text"
                                                                name="partNumber[]"
                                                                value={req.partNumber}
                                                                placeholder="Enter part number"
                                                                readOnly={req.isPreFilled}
                                                                className={req.isPreFilled ? 'readonly-input' : ''}
                                                                style={{ width: '13ch' }}
                                                                onChange={(e) => updateProductRequirement(req.id, 'partNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        <td data-label="Manufacturer">
                                                            <input
                                                                type="text"
                                                                name="manufacturer[]"
                                                                value={req.manufacturer}
                                                                placeholder="Enter manufacturer"
                                                                readOnly={req.isPreFilled}
                                                                className={req.isPreFilled ? 'readonly-input' : ''}
                                                                style={{ width: '20ch' }}
                                                                onChange={(e) => {
                                                                    updateProductRequirement(req.id, 'manufacturer', e.target.value);
                                                                }}
                                                            />
                                                        </td>
                                                       
                                                        <td data-label={t('contact.table.quantity')}>
                                                            <input
                                                                type="number"
                                                                name="quantity[]"
                                                                value={req.quantity}
                                                                placeholder={t('contact.table.qty')}
                                                                min="1"
                                                                max="99999"
                                                                required
                                                                onChange={(e) => {
                                                                    let num = parseInt(e.target.value || '0', 10);
                                                                    if (Number.isNaN(num) || num < 1) num = 1;
                                                                    if (num > 99999) num = 99999;
                                                                    updateProductRequirement(req.id, 'quantity', num);
                                                                }}
                                                            />
                                                        </td>
                                                        <td data-label={t('contact.table.lead_time')}>
                                                            <select 
                                                                name="leadTime[]" 
                                                                value={req.leadTime}
                                                                required 
                                                                onChange={(e) => updateProductRequirement(req.id, 'leadTime', e.target.value)}
                                                            >
                                                                <option value="">{t('contact.form.select_lead_time')}</option>
                                                                <option value="immediate">{t('contact.lead_times.immediate')}</option>
                                                                <option value="1-2 weeks">{t('contact.lead_times.1_2_weeks')}</option>
                                                                <option value="2-4 weeks">{t('contact.lead_times.2_4_weeks')}</option>
                                                                <option value="1-2 months">{t('contact.lead_times.1_2_months')}</option>
                                                                <option value="2+ months">{t('contact.lead_times.2_plus_months')}</option>
                                                            </select>
                                                        </td>
                                                        <td data-label={t('contact.table.action')}>
                                                            <button type="button" className="remove-row-btn" onClick={() => removeRow(req.id)} aria-label="Remove row">
                                                                <Icon name="icon-trash" size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Add product button */}
                                        <div className="seen-contact-add-buttons">
                                            <button
                                                type="button"
                                                className="seen-contact-add-row-btn"
                                                id="add-row-btn"
                                                onClick={addEmptyRow}
                                            >
                                                <Icon name="icon-plus" size={16} />
                                                {productData ? 'Add another product' : 'Add Product'}
                                            </button>
                                        </div>
                                    </div>
                                    {errors.products && <div id="products-error" className="seen-contact-error-message">{errors.products}</div>}
                                </div>
                            )}


                            {/* Submit Button */}
                            <div className="seen-contact-form-section">
                                {/* Cloudflare Turnstile Captcha */}
                                <div className="seen-contact-form-group">
                                    <div
                                        className="cf-turnstile"
                                        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                        data-appearance="interaction-only"
                                        data-callback="onTurnstileSuccess"
                                        data-expired-callback="onTurnstileExpired"
                                        data-error-callback="onTurnstileError"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="seen-contact-submit-buttons">
                                    <button
                                        type="submit"
                                        className="seen-contact-submit-btn"
                                        id="submit-btn"
                                        disabled={isSubmitting || !captchaToken}
                                    >
                                        <span className="seen-contact-loading" id="loading">
                                            {isSubmitting ? (
                                                <Icon name="icon-spinner" className="animate-spin" size={16} />
                                            ) : (
                                                <Icon name="icon-send" size={16} />
                                            )}
                                        </span>
                                        <span className="seen-contact-btn-text">
                                            {isSubmitting ? t('contact.submitting') : (isSubmitted ? t('contact.submitted') : t('contact.submit_request'))}
                                        </span>
                                    </button>
                                    
                                    {/* Reset Form Button - only show when there's data to reset */}
                                   
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


        </>
    )
}











