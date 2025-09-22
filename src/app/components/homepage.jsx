"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from "./header-hopepage";
import Footer from "./footer";
import BannerSection from './hopepage/banner-section';
import AboutSection from './hopepage/about-section';
import MapSection from './hopepage/map-section';
import BrandsSection from './hopepage/brans-section';
import Icon from './ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';
import '../../../public/css/style.css';
import '../../../public/css/tailwind.css';

export default function HomePage() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [loaderHidden, setLoaderHidden] = useState(false);

    // Refs for performance optimization
    const tickingRef = useRef(false);
    const styleRef = useRef(null);

    useEffect(() => {
        // Simulate loading time or wait for actual content to load
        const timer = setTimeout(() => {
            setIsLoading(false);
            // Add a delay before hiding the loader to ensure animation completes
            setTimeout(() => {
                setLoaderHidden(true);
            }, 500); // 500ms delay after loading completes
        }, 2000); // 2 seconds loading time

        return () => {
            clearTimeout(timer);
        };
    }, []);

    // Scroll-based header background management
    useEffect(() => {
        // Inject dynamic CSS styles
        const injectStyles = () => {
            if (styleRef.current) return; // Prevent duplicate injection
            
            const style = document.createElement('style');
            style.textContent = `
                .header-bottom {
                    transition: background-color 0.3s ease !important;
                }
                .header-bottom[style*="background-color"] {
                    background-color: var(--header-bg-color) !important;
                }
            `;
            document.head.appendChild(style);
            styleRef.current = style;
        };

        // Get DOM elements
        const getElements = () => {
            return {
                headerBottom: document.querySelector('.header-bottom'),
                bannerField: document.querySelector('.banner-field.relative.overflow-hidden.isolate'),
                carouselField: document.querySelector('.carousel-field.relative.w-full'),
                aboutField: document.querySelector('.about-field'),
                worldMapSection: document.querySelector('.world-map-section'),
                brandsField: document.querySelector('.brands-field'),
                footerField: document.querySelector('.footer-field')
            };
        };

        // Check if element is in viewport
        const isElementInViewport = (element) => {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
        };

        // Update header background based on scroll position
        const updateHeaderBackground = () => {
            try {
                const elements = getElements();
                const { headerBottom, bannerField, carouselField, aboutField, worldMapSection, brandsField, footerField } = elements;

                if (!headerBottom) {
                    return;
                }

                const bannerInView = isElementInViewport(bannerField);
                const carouselInView = isElementInViewport(carouselField);
                const aboutInView = isElementInViewport(aboutField);
                const worldMapInView = isElementInViewport(worldMapSection);
                const brandsInView = isElementInViewport(brandsField);
                const footerInView = isElementInViewport(footerField);

                // Apply background color based on section visibility
                if ((aboutInView || worldMapInView || brandsInView) && !bannerInView) {
                    // Gray background for content sections
                    headerBottom.style.setProperty('--header-bg-color', '#383838');
                    headerBottom.style.backgroundColor = '#383838';
                    headerBottom.style.transition = 'background-color 0.3s ease';
                } else if (bannerInView) {
                    // Transparent background for banner section
                    headerBottom.style.setProperty('--header-bg-color', 'transparent');
                    headerBottom.style.backgroundColor = 'transparent';
                } else if (footerInView && !aboutInView && !worldMapInView && !brandsInView) {
                    // Transparent background for footer section
                    headerBottom.style.setProperty('--header-bg-color', 'transparent');
                    headerBottom.style.backgroundColor = 'transparent';
                }
                // Default case: no explicit background change needed
            } catch (error) {
                console.error('Header background update failed:', error);
            }
        };

        // Throttled scroll handler for performance
        const requestTick = () => {
            if (!tickingRef.current) {
                requestAnimationFrame(() => {
                    updateHeaderBackground();
                    tickingRef.current = false;
                });
                tickingRef.current = true;
            }
        };

        // Initialize
        const initializeHeaderBackground = () => {
            injectStyles();
            
            // Wait for DOM elements to be available
            const checkElements = () => {
                const elements = getElements();
                if (elements.headerBottom) {
                    updateHeaderBackground();
                    window.addEventListener('scroll', requestTick, { passive: true });
                } else {
                    // Retry after a short delay if elements aren't ready
                    setTimeout(checkElements, 100);
                }
            };
            
            checkElements();
        };

        // Start initialization after a short delay to ensure DOM is ready
        const initTimer = setTimeout(initializeHeaderBackground, 100);

        // Cleanup function
        return () => {
            clearTimeout(initTimer);
            window.removeEventListener('scroll', requestTick);
            
            // Remove injected styles
            if (styleRef.current) {
                document.head.removeChild(styleRef.current);
                styleRef.current = null;
            }
            
            // Reset header background
            const headerBottom = document.querySelector('.header-bottom');
            if (headerBottom) {
                headerBottom.style.removeProperty('--header-bg-color');
                headerBottom.style.removeProperty('background-color');
                headerBottom.style.removeProperty('transition');
            }
        };
    }, []); // Empty dependency array - runs once on mount

    return (
        <>
            <Header />
            <div className="block">
                <div id="smooth-wrapper" className="block">
                    <div id="smooth-content">
                      
                        {/* Loader with proper animation states */}
                        {!loaderHidden && (
                            <div 
                                className={`loader-wrap z-60 fixed top-0 left-0 bg-black ${
                                    isLoading ? '' : 'hidden'
                                }`}
                                style={{ 
                                    pointerEvents: 'none'
                                }}
                            ></div>
                        )}

                        <main className="main-field home-animation">
                            <BannerSection />
                            <AboutSection />
                            <MapSection />
                            <BrandsSection />
                        </main>
                        <Footer />
                    </div>
                </div>
                <div className="bg-overlay-general fixed left-0 top-0 z-[90] opacity-0 invisible duration-500 [&amp;.active]:opacity-100 [&amp;.active]:visible [&amp;.black]:bg-black/30 w-full h-full group"></div>

                <div className="cookie-box fixed top-auto bottom-[20px] right-[20px] left-[20px] mr-0 ml-auto w-fit max-w-[550px] md:max-w-full z-[200] duration-450 xs:w-full xs:left-0 xs:bottom-0 xs:right-0 bg-cookie p-[30px] rounded-[20px] xs:rounded-none translate-y-[150%] [&amp;.accepted]:opacity-0 [&amp;.accepted]:invisible [&amp;.accepted]:translate-y-[250%] sm:sm:max-h-[calc(100dvh-40px)] sm:scrollbar sm:scrollbar-w-[5px] sm:scrollbar-track-rounded-[5px] sm:scrollbar-thumb-rounded-[5px] sm:scrollbar-thumb-primary sm:scrollbar-track-primary/10 sm:overflow-x-hidden sm:overflow-y-auto accepted">
                    <div className="close close-cookie absolute right-[20px] top-[20px] cursor-pointer group/close">
                        <Icon
                            name="icon-cross"
                            className="group-hover/close:text-primary group-hover/close:rotate-90 text-white text-[14px] h-[14px] block leading-none duration-350"
                            size={14}
                        />
                    </div>
                    <div className="text-field text-white">
                        <div className="title font-medium text-[18px] mb-[15px]">{t('homepage.cookie.title')}</div>
                        <div className="expo text-[14px] sm:text-[12px] text-white/50">{t('homepage.cookie.description')}</div>
                    </div>
                    <div className="split my-[20px] sm:my-[10px] bg-white/5 w-full h-[1px]"></div>
                    <div className="action-field flex items-center justify-between gap-[20px] sm:flex-col">
                        <button className="accept-cookie close-cookie button group/button w-full flex justify-center items-center gap-[20px] bg-primary px-[20px] hover:bg-secondary h-[45px] md:h-[50px] duration-350">
                            <div className="text text-[13px] text-white font-medium relative z-2 whitespace-nowrap duration-350">{t('homepage.cookie.accept')}</div>
                        </button>
                        <button className="close-cookie close-cookie button group/button w-full flex justify-center items-center gap-[20px] bg-transparent px-[20px] h-[45px] md:h-[50px] duration-350 border border-solid border-primary">
                            <div className="text text-[13px] text-white/50 duration-350 font-medium relative z-2 whitespace-nowrap group-hover/button:text-white">{t('homepage.cookie.reject')}</div>
                        </button>
                    </div>
                  
                </div>
            </div>

        </>

    )
}