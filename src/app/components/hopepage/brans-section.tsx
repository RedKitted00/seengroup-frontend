"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Icon from '../ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';
import HtmlRenderer from '@/lib/i18n/htmlRenderer';

type Brand = {
    name: string;
    description: string;
    image: string;
    link: string;
};

// Swiper type for better type safety
type SwiperInstance = any; // eslint-disable-line @typescript-eslint/no-explicit-any


const brands: Brand[] = [
    {
        name: "AAR",
        description:
            "By requiring AAR certification from its railway partners, Seen Group has positioned itself as a benchmark for quality in the industry.",
        image: "/imgs/AAR Logo.png",
        link: "https://www.aar.org/",
    },
    {
        name: "ABB",
        description:
            "ABB is a pioneering force in global electrification. Seen Group integrates ABB's high-quality products into its railway and signaling solutions, creating advanced and reliable system architectures.",
        image: "/imgs/ABB.png",
        link: "https://www.abb.com/",
    },
    {
        name: "EKOL",
        description:
            "Ekol has been Seen Group's most trusted partner for years, driving our logistics and customs operations seamlessly.",
        image: "/imgs/Ekol Logo.png",
        link: "https://www.ekol.com/",
    },
    {
        name: "EMD",
        description:
            "Seen Group is a global brand and expert in supplying aftermarket spare parts for Electro Motive Diesel (EMD) locomotives.",
        image: "/imgs/Electro Motive.png",
        link: "https://www.progressrail.com/",
    },
    {
        name: "FEDEX",
        description:
            "For over five years, Seen Group has trusted FedEx to handle its Far East shipping.",
        image: "/imgs/Fedex Logo.png",
        link: "https://www.fedex.com/",
    },
    {
        name: "GE",
        description:
            "For over a decade, Seen Group has been delivering high-quality spare parts for GE locomotive and electric motors worldwide — with speed and expertise.",
        image: "/imgs/GE Transportation.png",
        link: "https://www.ge.com/",
    },
    {
        name: "ITT CANNON",
        description:
            "Seen Group successfully commissioned ITT Cannon's railway-dedicated connectors in 2025, creating a significant industry added value of USD 750,000.",
        image: "/imgs/ITT Canon.png",
        link: "https://www.ittcannon.com/",
    },
    {
        name: "MINCO",
        description:
            "Seen Group has successfully engineered and integrated over 1,000 Minco temperature sensors into high-speed trains — delivering more than €1 million in added value to the industry.",
        image: "/imgs/Minco.png",
        link: "https://www.minco.com/",
    },
    {
        name: "SIEMENS",
        description:
            "Seen Group, Harnessing SIEMENS's pioneering electrification for advanced railway and signaling architectures.",
        image: "/imgs/Siemens Logo.png",
        link: "https://www.siemens.com/",
    },
    {
        name: "TE CONNECTIVITY",
        description:
            "In its proprietary engineering solutions, Seen Group proudly incorporates TE Connectivity's best-in-class products.",
        image: "/imgs/TE Connectivity.png",
        link: "https://www.te.com/",
    },
    {
        name: "UCRS",
        description:
            "Seen Group relies on UCRS for a wide range of EMD locomotive aftermarket parts.",
        image: "/imgs/UCRS Logo.png",
        link: "https://www.ucrs.com/",
    },
    {
        name: "UPS",
        description:
            "Seen Group carries out nearly all of its global operations with UPS — moving tons of cargo across the world every year through hundreds of waybills.",
        image: "/imgs/UPS Logo.png",
        link: "https://www.ups.com/",
    },
    {
        name: "NORIS",
        description:
            "Seen Group leads the integration of NORIS speed and temperature sensors into newly developed trains — designing, managing, and commissioning projects across its active regions.",
        image: "/imgs/NORIS.png",
        link: "https://www.noris-group.com/",
    },
];



function BrandCard({ brand }: { brand: Brand }) {
    const { t } = useTranslation();
    
    return (
        <div
        className="swiper-slide group/slide flex justify-center items-center [&_.brands-box]:border-0 [&_.brands-box]:!border-[#DDDDDD] [&.swiper-slide-active_.brands-box]:border-l [&.swiper-slide-active_.brands-box]:border-solid [&.swiper-slide-active_.brands-box]:border-[#DDDDDD] [&_.brands-box]:border-t [&_.brands-box]:border-r [&_.brands-box]:border-solid [&_.brands-box]:text-[#DDDDDD] [&_.brands-box]:border-b overflow-visible hover:z-20 w-full max-w-[400px] xsm:max-w-[280px]"
    >
        <div className="brands-box relative w-full h-full group/brands shadow-transparent hover:shadow-[0px_0px_60px_0px_rgba(0,_0,_0,_0.10);] duration-350">
            <div className="image-field bg-transparent py-50 group-hover/brands:pb-20 xl:py-40 lg:py-30 md:py-25 sm:py-20 xsm:py-15 sm:group-hover/brands:pb-30 xsm:bg-white w-full h-auto duration-350 flex flex-col justify-center items-center overflow-hidden isolate border-solid border-transparent">
                <div className="img h-[200px] xl:h-[180px] lg:h-150 md:h-[140px] sm:h-120 xsm:h-[100px] w-full overflow-hidden isolate relative">
                    <Image
                        className="h-full w-full object-contain opacity-100 duration-350"
                        src={brand.image}
                        alt={`${brand.name} - Seen Group Partner`}
                        width={300}
                        height={200}
                        priority={false}
                    />
                </div>
            </div>

            <div className="brands-content group/box flex flex-col h-auto justify-center gap-[15px] p-50 pt-30 2xl:p-40 xl:p-30 lg:p-25 md:p-20 sm:p-15 xsm:p-12 md:gap-[10px] md:items-center group-hover/brands:pt-0 sm:pt-0 xsm:pt-0 duration-350">
                <div
                    className="blog-title text-[24px] xl:text-[22px] lg:text-[20px] md:text-[18px] sm:text-[16px] xsm:text-[14px] text-black font-medium leading-[36px] xl:leading-[32px] lg:leading-[28px] md:leading-[26px] sm:leading-snug xsm:leading-snug line-clamp-2 md:text-center"
                    lang="en-US"
                >
                    {brand.name}
                </div>

                <div className="expo text-[14px] xl:text-[13px] lg:text-[12px] sm:text-12 xsm:text-[11px] hyphens-auto text-gray font-normal leading-[24px] xl:leading-[22px] lg:leading-[20px] sm:leading-snug xsm:leading-snug line-clamp-2 md:text-center">
                      {brand.description}
                </div>

                <div className="button-field md:w-full flex flex-wrap sm:justify-center gap-50 xl:gap-40 lg:gap-30 md:gap-25 sm:gap-[25px] xsm:gap-20 max-w-[500px] md:max-w-full duration-350 h-0 group-hover/brands:h-45 translate-y-20 group-hover/brands:translate-y-0 mt-10 group-hover/brands:mt-30 sm:!mt-10 xsm:group-hover/brands:mt-15 overflow-hidden isolate sm:translate-y-0 sm:!h-50 absolute left-0 bottom-40 xl:bottom-25 lg:bottom-20 md:bottom-15 px-50 xl:px-30 lg:px-25 md:px-20 sm:px-15 xsm:px-10 sm:relative sm:bottom-0">
                    <a
                        href={brand.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/button w-auto h-auto max-h-[45px] xl:max-h-[40px] lg:max-h-[38px] md:max-h-[36px] sm:max-h-[34px] xsm:max-h-[32px] m-auto py-10 xl:py-8 lg:py-7 md:py-6 sm:py-5 xsm:py-4 px-25 xl:px-20 lg:px-18 md:px-15 sm:px-12 xsm:px-10 bg-primary border border-solid border-white/15 text-white relative flex flex-row justify-center items-center font-bold rounded-[8px] duration-450 overflow-hidden isolate shadow-[0_0_20px_-10px] shadow-transparent hover:shadow-white active:scale-95"
                    >
                        <div className="text-content flex gap-10 xl:gap-8 lg:gap-7 md:gap-6 sm:gap-5 xsm:gap-4 items-center">
                            <div className="text text-white text-[16px] xl:text-[15px] lg:text-[14px] md:text-[13px] sm:text-12 xsm:text-[11px] font-normal leading-[41px] xl:leading-[36px] lg:leading-8 md:leading-6 sm:leading-5 xsm:leading-4 duration-450 group-hover/menu-item:!text-white relative z-2">
                                {t('homepage.brands.go_to_website')}
                            </div>
                            <div className="icon relative flex justify-center items-center z-2">
                                <Icon 
                                    name="icon-arrow-right" 
                                    className="h-[14px] text-[14px] xl:h-[13px] xl:text-[13px] lg:h-12 lg:text-12 md:h-11 md:text-11 sm:w-10 sm:h-10 xsm:w-9 xsm:h-9 text-white duration-450 relative z-20 flex sm:!text-white justify-center items-center group-hover:text-white group-hover:rotate-45 group-hover/button:translate-x-5" 
                                    size={14}
                                />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
    );
}
export default function BrandsSection() {
    const { t, tHtml } = useTranslation();
    const swiperRef = useRef<HTMLDivElement>(null);
    const swiperInstanceRef = useRef<SwiperInstance>(null);

    useEffect(() => {

        const initSwiper = async () => {
            try {
                const { Swiper } = await import('swiper');
                const { Navigation, Pagination, Autoplay } = await import('swiper/modules');
           
                if (swiperRef.current && !swiperInstanceRef.current) {
                    swiperInstanceRef.current = new Swiper(swiperRef.current, {
                        modules: [Navigation, Pagination, Autoplay],
                        slidesPerView: 'auto',
                        spaceBetween: 0,
                        centeredSlides: false,
                        loop: true,
                        width: null,
                        autoplay: {
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        },
                        navigation: {
                            nextEl: '.areas-icon-next',
                            prevEl: '.areas-icon-prev',
                            disabledClass: 'swiper-button-disabled',
                        },
                        pagination: {
                            el: '.ares-icon-pagination',
                            clickable: true,
                            bulletClass: 'swiper-pagination-bullet',
                            bulletActiveClass: 'swiper-pagination-bullet-active',
                            renderBullet: function (index: number, className: string) {
                                return `<div class="${className} w-[8px] h-[8px] rounded-full bg-black/20 transition-all duration-300 ease-in-out [&.swiper-pagination-bullet-active]:bg-primary [&.swiper-pagination-bullet-active]:w-[24px]"></div>`;
                            }
                        },
                        breakpoints: {
                            320: {
                                slidesPerView: 1,
                
                                centeredSlides: true,
                                slidesOffsetBefore: 0,
                                slidesOffsetAfter: 0,
                            },
                            480: {
                                slidesPerView: 1.2,
                            
                                centeredSlides: true,
                            },
                            640: {
                                slidesPerView: 1.5,
                       
                                centeredSlides: false,
                            },
                            768: {
                                slidesPerView: 2,
                         
                                centeredSlides: false,
                            },
                            1024: {
                                slidesPerView: 3,
                           
                                centeredSlides: false,
                            },
                            1280: {
                                slidesPerView: 3.5,
                              
                                centeredSlides: false,
                            },
                            1440: {
                                slidesPerView: 4,
                        
                                centeredSlides: false,
                            },
                            1600: {
                                slidesPerView: 4,
                             
                                centeredSlides: false,
                            }
                        },
                        speed: 600,
                        grabCursor: true,
                        allowTouchMove: true,
                        threshold: 5,
                        simulateTouch: true,
                        resistance: true,
                        resistanceRatio: 0.85,
                        on: {
                            init: function () {
                      
                            },
                            slideChange: function () {
                                // Handle slide change events if needed
                            },
                            beforeDestroy: function () {
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Failed to initialize Brands Swiper:', error);
            }
        };

        // Initialize after a small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            initSwiper();
        }, 100);

        // Add resize listener to update swiper on window resize
        const handleResize = () => {
            if (swiperInstanceRef.current) {
                swiperInstanceRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
            if (swiperInstanceRef.current) {
                swiperInstanceRef.current.destroy(true, true);
                swiperInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <section
            className="brands-field relative overflow-hidden isolate pt-[150px] 2xl:pt-[80px] xl:pt-[60px] lg:pt-[45px] md:pt-[30px] bg-white"
        >
            <div className="image absolute top-0 left-0 w-full h-full overflow-hidden isolate mx-auto z-0 pointer-events-none">
                <Image
                    src="/imgs/brands-bg.png"
                    className="w-full h-full object-cover object-center"
                    alt="Seen Group | HOME"
                    fill
                    priority={false}
                />
            </div>
            <div className="container max-w-[1800px]">
                <div className="wrapper grid grid-cols-1 srb-short-all">
                    <div className="title-field relative flex flex-col justify-center gap-30 max-w-[1220px] mx-auto px-200 mb-30 md:px-150 sm:px-0 sm:mb-0"
                        data-sr-id="18"
                        style={{ visibility: "visible", opacity: 1, transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)", transition: "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)" }}>
                        <div
                            className="text-editor max-w-full editor-strong:font-bold editor-strong:italic editor-h2:leading-relaxed editor-h4:text-gray editor-h5:text-gray text-center gap-20">
                            <h1>{t('homepage.brands.title')}</h1>
                            <HtmlRenderer 
                                content={tHtml('homepage.brands.subtitle')}
                                tag="h5"
                            />
                        </div>
                        <div
                            className="controller z-2 w-full absolute left-0 top-[50%] translate-y-[-50%] sm:relative sm:translate-y-0 sm:top-[unset] sm:left-[unset]">
                            <div
                                className="carousel-navigation flex gap-15 items-center justify-between pointer-events-none mb-0 sm:justify-center xsm:gap-10">
                                <div
                                    className="areas-icon-prev pointer-events-auto [&.swiper-button-disabled]:pointer-events-none duration-450 ease-samedown slides-nav__item group">
                                    <div
                                        className="icon group/item flex items-center justify-center rounded-full cursor-pointer duration-500 ease-samedown ml-auto border border-solid border-black/35 p-19 sm:p-15 xsm:p-12 group-hover:border-primary group-[&.swiper-button-disabled]:border-black/20 group-active:scale-95">
                                        <div className="icon-arrow w-full h-full">
                                            <Icon
                                                name="icon-arrow-left"
                                                className="text-20 h-20 sm:text-16 sm:h-16 xsm:text-14 xsm:h-14 text-black/35 group-hover:-translate-x-3 group-hover:text-primary group-[&.swiper-button-disabled]:text-black/35 duration-500 relative z-20 flex justify-center items-center"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="areas-icon-next pointer-events-auto [&.swiper-button-disabled]:pointer-events-none duration-450 ease-samedown slides-nav__item group">
                                    <div
                                        className="icon group/item flex items-center justify-center rounded-full cursor-pointer duration-500 ease-samedown ml-auto border border-solid border-black/35 p-19 sm:p-15 xsm:p-12 group-hover:border-primary group-[&.swiper-button-disabled]:border-black/20 group-active:scale-95">
                                        <div className="icon-arrow w-full h-full">
                                            <Icon
                                                name="icon-arrow-right"
                                                className="text-20 h-20 sm:text-16 sm:h-16 xsm:text-14 xsm:h-14 text-black/35 group-hover:translate-x-3 group-hover:text-primary group-[&.swiper-button-disabled]:text-black/35 duration-500 relative z-20 flex justify-center items-center"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div 
                        ref={swiperRef}
                        className="swiper areas-icon-slider w-full p-50 xl:p-40 lg:p-30 md:p-20 sm:p-15 xsm:p-10 sm:my-30 xsm:my-20 animate-carousel swiper-initialized swiper-horizontal"
                        data-sr-id="19"
                        style={{
                            visibility: "visible",
                            opacity: 1,
                            transform:
                                "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                            transition:
                                "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)",
                        }}
                    >
                        <div className="swiper-wrapper">
                            {brands.map((brand) => (
                                <BrandCard key={brand.name} brand={brand} />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="banner-content flex justify-center items-center w-full p pb-30 xl:pb-25 lg:pb-20 md:pb-15 sm:pb-12 xsm:pb-10 px-22 xl:px-20 lg:px-18 md:px-15 sm:px-12 xsm:px-10 xsm:flex-col xsm:gap-15 sm:justify-center"
                    data-sr-id="20"
                    style={{
                        visibility: "visible",
                        opacity: 1,
                        transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
                        transition:
                            "all, opacity 1s cubic-bezier(0.5, 0, 0, 1), transform 1s cubic-bezier(0.5, 0, 0, 1)",
                    }}
                >
                    
                </div>
            </div>
        </section>
    )
}
