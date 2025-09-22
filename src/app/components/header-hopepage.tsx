
"use client";

import Link from 'next/link';
import Image from 'next/image';
import Icon from './ui/Icon';
import './header/style.css';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface HeaderProps {
    headerBgColor?: string;
}

export default function Header({ headerBgColor = 'transparent' }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shouldAnimateLogo, setShouldAnimateLogo] = useState(false);
    const [animationState, setAnimationState] = useState<'idle' | 'animating' | 'complete' | 'error'>('idle');
    const pathname = usePathname();
    const { language, setLanguage, t } = useTranslation();
    
    // Refs for performance optimization
    const logoRef = useRef<HTMLDivElement>(null);
    const animationTimeoutRef = useRef<number | null>(null);
    const transitionTimeoutRef = useRef<number | null>(null);
    
    // Debug logging (can be disabled in production)
    const debugLog = () => {
        if (process.env.NODE_ENV === 'development') {
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // Also toggle body class for global styling
        if (!isMenuOpen) {
            document.body.classList.add('active');
        } else {
            document.body.classList.remove('active');
        }
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        document.body.classList.remove('active');
    };

    // Handle escape key to close menu
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        };

        if (isMenuOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Check if we should animate logo when pathname changes
    useEffect(() => {
        // Only animate when we're on the homepage (root path)
        if (pathname === '/') {
            debugLog();
            setShouldAnimateLogo(true);
            setAnimationState('idle');
        } else {
            // Reset animation state when leaving homepage
            setAnimationState('idle');
        }
    }, [pathname]);

    // Logo entrance animation - invisible prep, rAF-batched
    useLayoutEffect(() => {
        if (!shouldAnimateLogo) return;

        // Clean up any existing timeouts
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }

        // Enhanced element selection with better fallbacks
        const logoField = logoRef.current || document.querySelector('.logo-field') as HTMLDivElement;
        const otherMenus = document.querySelectorAll('.other-menu');
        const menus = document.querySelectorAll('.menu');

        if (!logoField) {
            debugLog();
            setShouldAnimateLogo(false);
            setAnimationState('error');
            return;
        }

        // Check if elements are actually in the DOM
        if (otherMenus.length === 0 || menus.length === 0) {
            debugLog();
        }

        // Reset animation state
        setShouldAnimateLogo(false);
        setAnimationState('animating');

        // Performance and compatibility checks
        const isLowPerformance = () => {
            // Check for reduced motion preference
            if (typeof window !== 'undefined' && window.matchMedia) {
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                if (prefersReducedMotion) return true;
            }
            
            // Check for low-end devices (basic heuristic)
            const connection = (navigator as Navigator & { connection?: { effectiveType?: string }; mozConnection?: { effectiveType?: string }; webkitConnection?: { effectiveType?: string } }).connection || 
                              (navigator as Navigator & { mozConnection?: { effectiveType?: string } }).mozConnection || 
                              (navigator as Navigator & { webkitConnection?: { effectiveType?: string } }).webkitConnection;
            if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
                return true;
            }
            
            // Check for older browsers that might have issues
            const isOldBrowser = !window.requestAnimationFrame || !window.matchMedia;
            if (isOldBrowser) return true;
            
            return false;
        };

        // Instantly hide menus without transitions to avoid flicker
        const previousMenuStyles = new WeakMap<Element, { transition: string; opacity: string; visibility: string; transform: string; pointerEvents: string }>();
        const hideElementsInstantly = (elements: NodeListOf<Element>) => {
            elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (!htmlEl) return; // Safety check
                
                previousMenuStyles.set(el, {
                    transition: htmlEl.style.transition || '',
                    opacity: htmlEl.style.opacity || '',
                    visibility: htmlEl.style.visibility || '',
                    transform: htmlEl.style.transform || '',
                    pointerEvents: htmlEl.style.pointerEvents || '',
                });
                htmlEl.style.transition = 'none';
                htmlEl.style.opacity = '0';
                htmlEl.style.visibility = 'hidden';
                htmlEl.style.pointerEvents = 'none';
                htmlEl.style.transform = 'translateY(-200%)';
            });
        };
        
        const restoreElements = (elements: NodeListOf<Element>) => {
            elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (!htmlEl) return; // Safety check
                
                const prev = previousMenuStyles.get(el);
                htmlEl.style.transition = prev ? prev.transition : '';
                htmlEl.style.opacity = prev ? prev.opacity : '';
                htmlEl.style.visibility = prev ? prev.visibility : '';
                htmlEl.style.transform = prev ? prev.transform : '';
                htmlEl.style.pointerEvents = prev ? prev.pointerEvents : '';
            });
        };

        try {
            // Get the original position before moving to center
            const originalRect = logoField.getBoundingClientRect();
            const headerTop = originalRect.top;
            
            // Enhanced reduced motion detection
            const prefersReducedMotion = isLowPerformance();

            hideElementsInstantly(otherMenus);
            hideElementsInstantly(menus);

            // Step 1: Position logo in center of screen (before paint)
            logoField.style.position = 'fixed';
            logoField.style.top = '50vh';
            logoField.style.left = '50vw';
            logoField.style.transform = 'translate(-50%, -50%)';
            logoField.style.zIndex = '9999';
            logoField.style.opacity = '1';

            const START_DELAY_MS = prefersReducedMotion ? 0 : 1000;
            const startLogoMove = () => {
                // Original duration
                const DURATION_MS = prefersReducedMotion ? 0 : 1200;
                const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                logoField.style.transition = DURATION_MS ? `all ${DURATION_MS}ms ${EASE}` : 'none';

                // Recompute target top in case of scroll drift
                const currentRect = logoField.getBoundingClientRect();
                const deltaTop = headerTop - currentRect.top;
                logoField.style.top = `${currentRect.top + deltaTop}px`;
                logoField.style.transform = 'translate(-50%, -50%)';

                const handleTransitionEnd = () => {
                    // Safety check - ensure logoField still exists
                    if (!logoField || !logoField.parentNode) {
                        debugLog();
                        setAnimationState('error');
                        return;
                    }
                    
                    debugLog();
                    setAnimationState('complete');
                    
                    logoField.style.position = '';
                    logoField.style.top = '';
                    logoField.style.left = '';
                    logoField.style.transform = '';
                    logoField.style.zIndex = '';
                    logoField.style.opacity = '';
                    logoField.style.transition = '';
                    logoField.removeEventListener('transitionend', handleTransitionEnd);

                    restoreElements(otherMenus);
                    restoreElements(menus);
                };
                
                if (DURATION_MS === 0) {
                    handleTransitionEnd();
                } else {
                    // Enhanced event listener with better error handling
                    const transitionEndHandler = (event: Event) => {
                        if (event.target === logoField) {
                            handleTransitionEnd();
                        }
                    };
                    
                    logoField.addEventListener('transitionend', transitionEndHandler, { once: true } as AddEventListenerOptions);
                    
                    // Fallback timeout with longer duration for slower devices
                    const fallbackTimeout = DURATION_MS + 500; // Increased buffer
                    transitionTimeoutRef.current = window.setTimeout(() => {
                        logoField.removeEventListener('transitionend', transitionEndHandler);
                        handleTransitionEnd();
                    }, fallbackTimeout);
                }
            };

            // Enhanced rAF batching with error handling
            const startAnimation = () => {
                try {
                    // Reveal header by removing SSR pre-anim class
                    const preAnimAncestor = logoField.closest('.pre-anim') || document.documentElement;
                    if (preAnimAncestor) {
                        preAnimAncestor.classList.remove('pre-anim');
                    }
                    
                    animationTimeoutRef.current = window.setTimeout(() => {
                        startLogoMove();
                    }, START_DELAY_MS);
                } catch {
                    debugLog();
                    setAnimationState('error');
                    // Fallback: just show the logo without animation
                    logoField.style.position = '';
                    logoField.style.top = '';
                    logoField.style.left = '';
                    logoField.style.transform = '';
                    logoField.style.zIndex = '';
                    logoField.style.opacity = '';
                    // Restore menu elements
                    otherMenus.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        if (htmlEl) {
                            const prev = previousMenuStyles.get(el);
                            htmlEl.style.transition = prev ? prev.transition : '';
                            htmlEl.style.opacity = prev ? prev.opacity : '';
                            htmlEl.style.visibility = prev ? prev.visibility : '';
                            htmlEl.style.transform = prev ? prev.transform : '';
                            htmlEl.style.pointerEvents = prev ? prev.pointerEvents : '';
                        }
                    });
                    menus.forEach((el) => {
                        const htmlEl = el as HTMLElement;
                        if (htmlEl) {
                            const prev = previousMenuStyles.get(el);
                            htmlEl.style.transition = prev ? prev.transition : '';
                            htmlEl.style.opacity = prev ? prev.opacity : '';
                            htmlEl.style.visibility = prev ? prev.visibility : '';
                            htmlEl.style.transform = prev ? prev.transform : '';
                            htmlEl.style.pointerEvents = prev ? prev.pointerEvents : '';
                        }
                    });
                }
            };

            // Batch with rAF to ensure initial styles commit before transition
            if (typeof window.requestAnimationFrame === 'function') {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        startAnimation();
                    });
                });
            } else {
                // Fallback for browsers without rAF
                setTimeout(startAnimation, 16);
            }

        } catch {
            debugLog();
            setAnimationState('error');
            // Enhanced error recovery
            try {
                if (logoField) {
                    logoField.style.position = '';
                    logoField.style.top = '';
                    logoField.style.left = '';
                    logoField.style.transform = '';
                    logoField.style.zIndex = '';
                    logoField.style.opacity = '';
                    logoField.style.transition = '';
                }
                // Restore menu elements
                otherMenus.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    if (htmlEl) {
                        const prev = previousMenuStyles.get(el);
                        htmlEl.style.transition = prev ? prev.transition : '';
                        htmlEl.style.opacity = prev ? prev.opacity : '';
                        htmlEl.style.visibility = prev ? prev.visibility : '';
                        htmlEl.style.transform = prev ? prev.transform : '';
                        htmlEl.style.pointerEvents = prev ? prev.pointerEvents : '';
                    }
                });
                menus.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    if (htmlEl) {
                        const prev = previousMenuStyles.get(el);
                        htmlEl.style.transition = prev ? prev.transition : '';
                        htmlEl.style.opacity = prev ? prev.opacity : '';
                        htmlEl.style.visibility = prev ? prev.visibility : '';
                        htmlEl.style.transform = prev ? prev.transform : '';
                        htmlEl.style.pointerEvents = prev ? prev.pointerEvents : '';
                    }
                });
            } catch {
                debugLog();
            }
            setShouldAnimateLogo(false);
        }

        // Enhanced cleanup function
        return () => {
            const animationTimeout = animationTimeoutRef.current;
            const transitionTimeout = transitionTimeoutRef.current;
            
            if (animationTimeout) {
                clearTimeout(animationTimeout);
                animationTimeoutRef.current = null;
            }
            if (transitionTimeout) {
                clearTimeout(transitionTimeout);
                transitionTimeoutRef.current = null;
            }
        };
    }, [shouldAnimateLogo]);

    // Fallback effect to ensure logo is always visible
    useEffect(() => {
        const logoField = logoRef.current || document.querySelector('.logo-field') as HTMLDivElement;
        if (logoField && animationState === 'error') {
            // Force logo to be visible if animation failed
            logoField.style.opacity = '1';
            logoField.style.position = '';
            logoField.style.top = '';
            logoField.style.left = '';
            logoField.style.transform = '';
            logoField.style.zIndex = '';
            logoField.style.transition = '';
            debugLog();
        }
    }, [animationState]);

    return (
        <>
        <header className={`group/header header-field h-[150px] group-[&amp;.active]/body:h-150 sm:group-[&amp;.active]/body:h-120 sm:h-[120px] z-[100] fixed w-full left-0 top-0 duration-450 will-change-[height, transform]  [&amp;.is-fixed_.header-bottom]:shadow-[0_0px_30px_rgb(0,0,0,0.12)] [&amp;.is-hidden.is-fixed]:!-translate-y-full [&amp;.no-scroll]:absolute [&amp;.bg-active]:bg-white [&amp;.bg-active_.menu-item-link_span]:text-[#414243] [&amp;.bg-active_.menu-item-link_.icon]:text-[#414243] [&amp;.bg-active_.logo-field_.logo-fill]:fill-[#575756] [&amp;.bg-active_.language-flag_.text]:text-[#414243] [&amp;.bg-active_.language-flag_.icon]:text-[#414243] [&amp;.bg-active_.order_.text]:text-[#414243] ${animationState === 'animating' ? 'logo-animating' : ''} ${animationState === 'complete' ? 'logo-animation-complete' : ''} ${animationState === 'error' ? 'logo-animation-error' : ''}`}>
            <div className="container max-w-[1730px] w-full container-space"></div>
            <div 
                className="header-bottom relative h-full flex items-center append-content"
                style={{ 
                    backgroundColor: headerBgColor,
                    transition: 'background-color 0.3s ease'
                }}
            >
                <div className="gradient-blur absolute left-0 top-0 backdrop-blur-[20px] opacity-0 w-full h-full duration-350 group-[&.active]/body:opacity-0"></div>
                <div className="container max-w-full px-0 h-full relative z-[101]">
                    <div className="wrapper grid grid-cols-[minmax(0,_5fr)_minmax(0,_250px)_minmax(0,_5fr)] md:grid-cols-[minmax(0,_5fr)_minmax(0,_150px)_minmax(0,_5fr)] h-full justify-between items-center duration-450 gap-[40px] xsm:gap-20 xs:gap-15">
                        <div className="menu menu-animate group/menu-cont h-full border-0 border-b border-solid border-white/15 relative after:absolute after:-right-43 sm:after:-right-35 after:bottom-0 after:contet after:w-1 after:h-full after:bg-white/15 after:-skew-x-[30deg] padding-left-content delay-active duration-600 md:pl-30 xsm:pl-20">
                            <ul className="flex justify-start items-center gap-50 lg:gap-30 lg:overflow-hidden lg:isolate h-full">
                                <li className="group/menu-item lg:relative"> 
                                    <div 
                                        className={`mobile-menu-field menu-btn group/mobile-menu h-full flex items-center cursor-pointer gap-20 pl-4 md:pl-0 ${isMenuOpen ? 'active' : ''}`}
                                        onClick={toggleMenu}
                                    >
                                        <div className="space-y-10 min-h-[40px] xsm:min-h-[33px] flex flex-col items-start justify-center">
                                            <div className="line w-[40px] xsm:w-30 h-[1px] bg-white group-hover/mobile-menu:bg-primary group-hover/mobile-menu:w-[40px] duration-350 flex justify-end group-[.active]/mobile-menu:w-[33px] group-[.page-subs-header]/header:bg-[#000F24] group-[.active]/mobile-menu:opacity-0 group-[&.transparent]/header:bg-[#000F24] group-[&.transparent.is-fixed]/header:bg-[#000F24]"></div>
                                            <div className="line w-[28px] h-[1px] xsm:w-18 bg-white group-hover/mobile-menu:bg-primary group-hover/mobile-menu:w-[40px] duration-350 flex justify-end group-[.active]/mobile-menu:w-[33px] group-[.page-subs-header]/header:bg-[#000F24] group-[.active]/mobile-menu:rotate-45 group-[.active]/mobile-menu:m-[-1px] group-[&.transparent]/header:bg-[#000F24] group-[&.transparent.is-fixed]/header:bg-[#000F24]"></div>
                                            <div className="line w-[40px] xsm:w-30 h-[1px] bg-white group-hover/mobile-menu:bg-primary group-hover/mobile-menu:w-[40px] duration-350 flex justify-end group-[.active]/mobile-menu:w-[33px] group-[.page-subs-header]/header:bg-[#000F24] group-[.active]/mobile-menu:-rotate-45 group-[.active]/mobile-menu:m-[-1px] group-[&.transparent]/header:bg-[#000F24] group-[&.transparent.is-fixed]/header:bg-[#000F24]"></div>
                                        </div>
                                        <span className="text text-[#ffffff] text-[18px] xl:text-[16px] xsm:text-14 font-medium leading-tight duration-450 group-hover/menu-item:!text-primary xs:hidden">{t('navigation.menu')}</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="logo-field w-full flex items-center relative justify-center" ref={logoRef}>
                            <Link href="/" className="logo-link flex justify-start w-full h-full max-w-[190px] xl:max-w-[160px] duration-350 opacity-0" style={{opacity: 1}}>
                                <div className="image w-full h-110 2xl:h-80 group-[&.active]/body:!h-110 2xl:group-[&.active]/body:!h-80 group-[&.is-fixed]/header:h-80 sm:h-65 sm:group-[&.active]/body:!h-65 sm:group-[&.is-fixed]/header:!h-65 duration-450">
                                    <Image 
                                        src="/imgs/site-logo.png" 
                                        alt="logo" 
                                        id="site-logo"  
                                        className="w-full h-full object-cover"
                                        width={190}
                                        height={110}
                                    />
                                </div>
                            </Link>
                        </div>
                        <div className="other-menu items-center justify-end flex gap-[20px] md:gap-[10px] h-full border-0 border-b border-solid border-white/15 relative after:absolute after:-left-43 sm:after:-left-35 after:bottom-0 after:content-[''] after:w-1 after:h-full after:bg-white/15 after:skew-x-[30deg] padding-right-content delay-active duration-600 md:pr-30 xsm:pr-20">
                            <div className="relative language md:[position:unset;] flex items-center gap-50 md:gap-30 sm:gap-15 xsm:gap-10 offer menu-li">
                                <button 
                                    onClick={() => setLanguage('en')}
                                    className={`language-flag group/lang relative h-full flex items-center duration-350 border-0 border-solid border-b-2 border-transparent hover:border-white ${language === 'en' ? 'border-white' : ''}`}
                                >
                                    <div className="current cursor-pointer px-3 xsm:px-0 flex items-center justify-center gap-[7.5px] duration-350 text-18 md:text-16 font-normal xsm:text-14 text-[#ffffff]">
                                        <div className="text whitespace-nowrap duration-450 leading-tight">EN</div>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setLanguage('tr')}
                                    className={`language-flag group/lang relative h-full flex items-center duration-350 border-0 border-solid border-b-2 border-transparent hover:border-white ${language === 'tr' ? 'border-white' : ''}`}
                                >
                                    <div className="current cursor-pointer px-3 xsm:px-0 flex items-center justify-center gap-[7.5px] duration-350 text-18 md:text-16 font-normal xsm:text-14 text-[#ffffff]">
                                        <div className="text whitespace-nowrap duration-450 leading-tight">TR</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="all-info-boxes absolute top-0 right-0 w-full h-full z-[100] pointer-events-none">
                    <div className="all-info-wrapper relative w-full h-full">
                                                        <div 
                                    className={`info-box max-w-full w-full h-screen fixed top-0 left-0 scale-90 opacity-0 invisible [&.is-active]:scale-100 [&.is-active]:opacity-100 [&.is-active]:translate-x-0 [&.is-active]:visible [&.is-active]:pointer-events-auto ease-manidar duration-450 z-[20] py-[50px] 2xl:pb-30 pt-150 2xl:pt-120 bg-[#383838]/60 backdrop-blur-[40px] ${isMenuOpen ? 'is-active' : ''}`}
                                    onClick={(e) => {
                                        // Close menu when clicking on the backdrop
                                        if (e.target === e.currentTarget) {
                                            closeMenu();
                                        }
                                    }}
                                >
                                    {/* Close button for mobile menu */}
                                    <button 
                                        onClick={closeMenu}
                                        className="absolute top-[30px] right-[30px] z-[30] text-white hover:text-primary transition-colors duration-300"
                                        aria-label="Close menu"
                                        style={{paddingTop: "30px"}}
                                    >
                                        <Icon 
                                            name="icon-cross" 
                                            className="text-[24px] h-[24px]" 
                                            size={24}
                                        />
                                    </button>
                                    <div className="content overflow-hidden justify-between md:justify-start flex flex-col gap-[30px] md:gap-0 max-w-[1440px] px-30 mx-auto h-full scrollbar scrollbar-w-[5px] scrollbar-track-rounded-[5px] scrollbar-thumb-rounded-[5px] scrollbar-thumb-main-500 scrollbar-track-main-500/10 overflow-x-hidden overflow-y-auto mobile-menu-list">
                                <div className="bottom-wrapper flex h-full justify-between md:order-2 flex-col pt-70 md:pt-60 sm:pt-30 xsm:pt-20">
                                    <ul className="menu-list flex flex-col gap-0 fax-list relative mb-50 xsm:mb-20 wrapper-append">

                                                                <li className="group/menu-item lg:relative lg:w-full duration-450">
                            <Link href="/" className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30" onClick={closeMenu}>
                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.home')}</span>
                            </Link>
                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                        </li>
              
                                        <li className="group/menu-item drop-fax lg:relative lg:w-full duration-450">
                                            <Link href="/product" className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30 gap-20 sm:gap-10" onClick={closeMenu}>
                                                <div className="title-field flex w-max relative">
                                                    <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-[&.active]/menu-item:text-primary group-hover/menu-item:text-primary">{t('navigation.products')}</span>
                                                
                                                </div>
                                            </Link>
                                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                                        </li>
                                        <li className="group/menu-item lg:relative lg:w-full duration-450">
                                            <Link href="/career" className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30" onClick={closeMenu}>
                                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.career')}</span>
                                            </Link>
                                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                                        </li>
                                    
                                        <li className="group/menu-item lg:relative lg:w-full duration-450">
                                            <Link 
                                                href="/contact" 
                                                className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30" 
                                                onClick={() => {
                                                    closeMenu();
                                                    // Ensure page scrolls to top when navigating via menu
                                                    setTimeout(() => {
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }, 100);
                                                }}
                                            >
                                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.contact')}</span>
                                            </Link>
                                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                                        </li>
                                      
                                    </ul>
                                    <div className="info-content flex flex-col gap-20 xsm:pb-50">
                                      
                                        <div className="copyright-field flex items-center justify-center">
                                            <p className="text text-[16px] xsm:text-14 font-normal text-white/60 [&_a]:duration-350 [&_a:hover]:text-primary md:text-center">
                                                 <Link href="/" className="uppercase">Seen Group</Link> | All Right reserved
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
        </>

    );
}
