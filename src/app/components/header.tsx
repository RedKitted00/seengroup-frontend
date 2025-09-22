"use client";
import Link from 'next/link';
import Image from 'next/image';
import Icon from './ui/Icon';
import './header/style.css';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
    
interface HeaderProps {
    headerBgColor?: string;
}

export default function Header({ headerBgColor = 'transparent' }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { language, setLanguage, t } = useTranslation();

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
        // Restore body scroll and position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
    }, []);

    // Close menu when pathname changes (navigation)
    useEffect(() => {
        if (isMenuOpen) {
            closeMenu();
        }
    }, [pathname]);

    // Keyboard support for closing menu
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen, closeMenu]);

    const handleNavigation = (path: string, resetParams?: Record<string, string>) => {
        // Close menu first
        closeMenu();
        
        // Check if we're navigating to the same page
        if (pathname === path) {
            // If same page, force a refresh to reset state
            if (resetParams) {
                const params = new URLSearchParams();
                Object.entries(resetParams).forEach(([key, value]) => {
                    params.set(key, value);
                });
                router.replace(`${path}?${params.toString()}`);
            } else {
                // Force refresh for same page without params
                router.refresh();
            }
        } else {
            // Different page, normal navigation
            if (resetParams) {
                const params = new URLSearchParams();
                Object.entries(resetParams).forEach(([key, value]) => {
                    params.set(key, value);
                });
                router.push(`${path}?${params.toString()}`);
            } else {
                router.push(path);
            }
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        // Improved body scroll management to prevent scrolling issues
        if (!isMenuOpen) {
            // When opening menu, preserve scroll position and prevent body scroll
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        } else {
            closeMenu();
        }
    };

    return (
        <>
        <header className="group/header header-field h-[150px] group-[&amp;.active]/body:h-150 sm:group-[&amp;.active]/body:h-120 sm:h-[120px] z-[100] fixed w-full left-0 top-0 duration-450 will-change-[height, transform]  [&amp;.is-fixed_.header-bottom]:shadow-[0_0px_30px_rgb(0,0,0,0.12)] [&amp;.is-hidden.is-fixed]:!-translate-y-full [&amp;.no-scroll]:absolute [&amp;.bg-active]:bg-white [&amp;.bg-active_.menu-item-link_span]:text-[#414243] [&amp;.bg-active_.menu-item-link_.icon]:text-[#414243] [&amp;.bg-active_.logo-field_.logo-fill]:fill-[#575756] [&amp;.bg-active_.language-flag_.text]:text-[#414243] [&amp;.bg-active_.language-flag_.icon]:text-[#414243] [&amp;.bg-active_.order_.text]:text-[#414243]">
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
                        <div className="menu menu-animate group/menu-cont h-full border-0 border-b border-solid border-white/15 relative after:absolute after:-right-43 sm:after:-right-35 after:bottom-0 after:content-[''] after:w-1 after:h-full after:bg-white/15 after:-skew-x-[30deg] padding-left-content delay-active  duration-600 md:pl-30 xsm:pl-20">
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
                        <div className="logo-field w-full flex items-center relative justify-center">
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
                        <div className="other-menu items-center justify-end flex gap-[20px] md:gap-[10px] h-full border-0 border-b border-solid border-white/15 relative after:absolute after:-left-43 sm:after:-left-35 after:bottom-0 after:content-[''] after:w-1 after:h-full after:bg-white/15 after:skew-x-[30deg] padding-right-content delay-active  duration-600 md:pr-30 xsm:pr-20">
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
                            className="info-box max-w-full w-full h-screen fixed top-0 left-0 ease-manidar duration-450 z-[20] py-[50px] 2xl:pb-30 pt-150 2xl:pt-120 bg-[#383838]/60 backdrop-blur-[40px]"
                            style={{
                                transform: isMenuOpen ? 'scale(1)' : 'scale(0.9)',
                                opacity: isMenuOpen ? 1 : 0,
                                visibility: isMenuOpen ? 'visible' : 'hidden',
                                pointerEvents: isMenuOpen ? 'auto' : 'none'
                            }}
                            onClick={closeMenu}
                        >
                            <div className="content overflow-hidden justify-between md:justify-start flex flex-col gap-[30px] md:gap-0 max-w-[1440px] px-30 mx-auto h-full scrollbar scrollbar-w-[5px] scrollbar-track-rounded-[5px] scrollbar-thumb-rounded-[5px] scrollbar-thumb-main-500 scrollbar-track-main-500/10 overflow-x-hidden overflow-y-auto mobile-menu-list" onClick={(e) => e.stopPropagation()}>
                                {/* Close button */}
                                <button 
                                    onClick={closeMenu}
                                    style={{paddingTop: "30px"}}
                                    className="absolute top-30 right-30 text-white hover:text-primary duration-350 z-50"
                                >
                                    <Icon 
                                        name="icon-close" 
                                        className="text-[24px] h-[24px]" 
                                        size={24}
                                        
                                    />
                                </button>
                                <div className="bottom-wrapper flex h-full justify-between md:order-2 flex-col pt-70 md:pt-60 sm:pt-30 xsm:pt-20">
                                    <ul className="menu-list flex flex-col gap-0 fax-list relative mb-50 xsm:mb-20 wrapper-append">

                                                                <li className="group/menu-item lg:relative lg:w-full duration-450">
                            <button 
                                onClick={() => handleNavigation('/')}
                                className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30 w-full text-left bg-transparent border-none cursor-pointer"
                            >
                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.home')}</span>
                            </button>
                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                        </li>
                 
                                        <li className="group/menu-item drop-fax lg:relative lg:w-full duration-450">
                                            <button 
                                                onClick={() => handleNavigation('/product', {
                                                    view: 'grid',
                                                    accordion: 'auxiliary',
                                                    auxiliary: 'Show All'
                                                })}
                                                className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30 gap-20 sm:gap-10 w-full text-left bg-transparent border-none cursor-pointer"
                                            >
                                                <div className="title-field flex w-max relative">
                                                    <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-[&.active]/menu-item:text-primary group-hover/menu-item:text-primary">{t('navigation.products')}</span>
                                                
                                                </div>
                                            </button>
                                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                                        </li>
                                        <li className="group/menu-item lg:relative lg:w-full duration-450">
                                            <button 
                                                onClick={() => handleNavigation('/career')}
                                                className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30 w-full text-left bg-transparent border-none cursor-pointer"
                                            >
                                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.career')}</span>
                                            </button>
                                            <div className="split w-full h-[1px] relative bg-white/14 flex"></div>
                                        </li>
                                  
                                        <li className="group/menu-item lg:relative lg:w-full duration-450">
                                            <button 
                                                onClick={() => handleNavigation('/contact')}
                                                className="menu-item-link flex items-center justify-start text-base font-light duration-450 relative py-20 md:py-15 px-10 md:px-30 w-full text-left bg-transparent border-none cursor-pointer"
                                            >
                                                <span className="text text-white/50 text-[32px] 2xl:text-28 xl:text-24 lg:text-22 md:text-20 sm:text-18 duration-450 group-hover/menu-item:text-primary">{t('navigation.contact')}</span>
                                            </button>
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
