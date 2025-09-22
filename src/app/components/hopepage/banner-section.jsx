"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function BannerSection() {
  const { t } = useTranslation();
  const swiperRef = useRef(null);
  const swiperInstanceRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState({
    first: false,
    second: false
  });
  const [imageError, setImageError] = useState({
    first: false,
    second: false
  });

  useEffect(() => {
    // Dynamically import Swiper to avoid SSR issues
    const initSwiper = async () => {
      const { Swiper } = await import('swiper');
      const { Autoplay, Pagination, EffectFade, Parallax } = await import('swiper/modules');
      
      // Import Swiper styles
      await import('swiper/css');
      await import('swiper/css/autoplay');
      await import('swiper/css/effect-fade');

      if (swiperRef.current && !swiperInstanceRef.current) {
        swiperInstanceRef.current = new Swiper(swiperRef.current, {
          modules: [Autoplay, Pagination, EffectFade, Parallax],
          effect: 'fade',
          fadeEffect: {
            crossFade: true
          },
          speed: 1000,
          autoplay: {
            delay: 7000, // 7 seconds to match CSS animation
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: true
          },
          pagination: {
            el: '.banner-pagination',
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
            renderBullet: function (index, className) {
              return `<div class="${className} group relative w-[40px] h-[40px] min-h-[40px] min-w-[40px] flex items-center justify-center opacity-100 bg-transparent before:absolute before:w-[8px] [&.swiper-pagination-bullet-active]:before:w-[8px] before:aspect-square before:rounded-full before:bg-[#ffffff25] [&.swiper-pagination-bullet-active]:before:bg-primary duration-300 ease-courier !scale-100">
                <svg class="opacity-0 duration-300 ease-courier group-[&.swiper-pagination-bullet-active]:opacity-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle class="outer" opacity="1" cx="19.5" cy="19.5" r="20" transform="rotate(90 19.5 19.5)" stroke="#FFFFFF20"></circle>
                  <circle class="inner group-[&.swiper-pagination-bullet-active]:animate-fillCircle" style="stroke-dashoffset: 125; stroke-dasharray: 125" opacity="1" cx="19.5" cy="19.5" r="20" transform="rotate(90 19.5 19.5)" stroke="#6A89A7" stroke-width="1px"></circle>
                </svg>
              </div>`;
            }
          },
          loop: true,
          allowTouchMove: true,
          grabCursor: true,
          on: {
            init: function () {
              // Wait for logo animation to complete before starting banner animation
              // Logo animation: 1000ms delay + 1200ms transition = 2200ms total
              setTimeout(() => {
                const activeBullet = document.querySelector('.swiper-pagination-bullet-active .inner');
                if (activeBullet) {
                  // Reset and start animation
                  activeBullet.style.strokeDashoffset = '125';
                  activeBullet.style.animation = 'fillCircle 7s linear';
                }
              }, 2300); // Wait for logo animation to complete + small buffer
            },
            slideChange: function () {
              // Reset animation for new slide
              const activeBullet = document.querySelector('.swiper-pagination-bullet-active .inner');
              if (activeBullet) {
                // Reset the stroke dash offset
                activeBullet.style.strokeDashoffset = '125';
                // Remove any existing animation
                activeBullet.style.animation = 'none';
                
                // Force a reflow
                activeBullet.offsetHeight;
                
                // Start the animation again
                setTimeout(() => {
                  activeBullet.style.animation = 'fillCircle 7s linear';
                }, 50);
              }
            },
            autoplayStart: function () {
              // Ensure animation runs when autoplay starts
              const activeBullet = document.querySelector('.swiper-pagination-bullet-active .inner');
              if (activeBullet) {
                activeBullet.style.strokeDashoffset = '125';
                activeBullet.style.animation = 'none';
                activeBullet.offsetHeight;
                setTimeout(() => {
                  activeBullet.style.animation = 'fillCircle 7s linear';
                }, 50);
              }
            },
            autoplayStop: function () {
              // Pause animation when autoplay stops
              const activeBullet = document.querySelector('.swiper-pagination-bullet-active .inner');
              if (activeBullet) {
                activeBullet.style.animationPlayState = 'paused';
              }
            },
            autoplayResume: function () {
              // Resume animation when autoplay resumes
              const activeBullet = document.querySelector('.swiper-pagination-bullet-active .inner');
              if (activeBullet) {
                activeBullet.style.animationPlayState = 'running';
              }
            }
          }
        });
      }
    };

    initSwiper();

    // Cleanup function
    return () => {
      if (swiperInstanceRef.current) {
        swiperInstanceRef.current.destroy(true, true);
        swiperInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <section className="banner-field relative overflow-hidden isolate pb-[120px] 2xl:pb-[80px] xl:pb-[60px] lg:pb-[45px] md:pb-[30px]">
        <div className="carousel-field relative w-full">
          <div 
            ref={swiperRef}
            className="banner-carousel swiper h-fit overflow-hidden isolate swiper-horizontal swiper-watch-progress swiper-backface-hidden"
            role="region" aria-roledescription="carousel" aria-label="Homepage hero"
          >
            <div className="swiper-wrapper">
              {/* Slide 1 */}
              <div className="swiper-slide group/slide overflow-hidden isolate" role="group" aria-roledescription="slide" aria-label="1 of 2">
                <div className="content relative">
                  <div 
                    className="image-field translate-z-0 absolute left-0 top-0 w-full h-full"
                    data-swiper-parallax-x="40%"
                    data-swiper-parallax-scale="1.5"
                  >
                    <div className="gradient bg-[linear-gradient(180deg,_rgba(56,_56,_56,_0.75)_0%,_rgba(56,_56,_56,_0.00)_61.17%,_rgba(56,_56,_56,_0.75)_100%);] absolute top-0 left-0 w-full h-full z-[2] pointer-events-none translate-z-0"></div>
                    <div className="image w-full h-[100dvh] overflow-hidden translate-z-0 relative">
                      {/* Loading indicator */}
                      {!imageLoaded.first && !imageError.first && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                      )}
                      
                      {/* Error fallback */}
                      {imageError.first && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                          <div className="text-white text-center">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p className="text-sm">Image failed to load</p>
                          </div>
                        </div>
                      )}
                      
                      <Image
                        src="https://pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev/product-images/smiling-stylish-woman-in-sunglasses-looking-out-fr-2024-11-17-17-27-26-utc.jpg"
                        fill
                        className={`object-cover object-center scale-105 transition-opacity duration-500 ${
                          imageLoaded.first ? 'opacity-100' : 'opacity-0'
                        }`}
                        alt="Professional woman in sunglasses representing business growth and success"
                        priority
                        quality={90}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1440px) 100vw, 100vw"
                        onLoad={() => {
                          setImageLoaded(prev => ({ ...prev, first: true }));
                        }}
                        onError={(e) => {
                          setImageError(prev => ({ ...prev, first: true }));
                          console.warn('First slide image failed to load, showing fallback');
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-field relative z-20 flex items-end max-w-[1700px] mx-auto px-[30px] h-[calc(100dvh)] sm:h-[calc(100dvh)] pb-90 sm:pb-120">
                    <div className="content flex flex-col gap-[50px] xl:gap-[40px] lg:gap-[30px] md:gap-[20px] translate-z-0 w-[calc(100%-300px)] sm:w-full">
                      <div className="title-field flex flex-col gap-[30px] md:gap-[20px] sm:gap-[15px] w-full md:max-w-full sm:text-center">
                        <h1 className="title text-[120px] 2xl:text-[80px] xl:text-[75px] lg:text-[60px] md:text-50 sm:text-[42px] xsm:text-36 font-normal text-white leading-[1] tracking-[-2.4px]">
                          {t('homepage.hero_title')}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 */}
              <div className="swiper-slide group/slide overflow-hidden isolate" role="group" aria-roledescription="slide" aria-label="2 of 2">
                <div className="content relative">
                  <div 
                    className="image-field translate-z-0 absolute left-0 top-0 w-full h-full"
                    data-swiper-parallax-x="40%"
                    data-swiper-parallax-scale="1.5"
                  >
                    <div className="gradient bg-[linear-gradient(180deg,_rgba(56,_56,_56,_0.75)_0%,_rgba(56,_56,_56,_0.00)_61.17%,_rgba(56,_56,_56,_0.75)_100%);] absolute top-0 left-0 w-full h-full z-[2] pointer-events-none translate-z-0"></div>
                    <div className="image w-full h-[100dvh] overflow-hidden translate-z-0 relative">
                      {/* Loading indicator */}
                      {!imageLoaded.second && !imageError.second && (
                        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                      )}
                      
                      {/* Error fallback */}
                      {imageError.second && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                          <div className="text-white text-center">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p className="text-sm">Image failed to load</p>
                          </div>
                        </div>
                      )}
                      
                      <Image
                        src="https://pub-8b25a422bd234ffab965d339ba7bc4aa.r2.dev/product-images/high-speed-passenger-train-on-tracks-with-motion-b-2024-12-05-08-19-42-utc.jpg"
                        fill
                        className={`object-cover object-center scale-105 transition-opacity duration-500 ${
                          imageLoaded.second ? 'opacity-100' : 'opacity-0'
                        }`}
                        alt="High-speed train representing fast, efficient transportation and logistics solutions"
                        loading="lazy"
                        quality={90}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1440px) 100vw, 100vw"
                        onLoad={() => {
                          setImageLoaded(prev => ({ ...prev, second: true }));
                        }}
                        onError={(e) => {
                          setImageError(prev => ({ ...prev, second: true }));
                          console.warn('Second slide image failed to load, showing fallback');
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-field relative z-20 flex items-end max-w-[1700px] mx-auto px-[30px] h-[calc(100dvh)] sm:h-[calc(100dvh)] pb-90 sm:pb-120">
                    <div className="content flex flex-col gap-[50px] xl:gap-[40px] lg:gap-[30px] md:gap-[20px] translate-z-0 w-[calc(100%-300px)] sm:w-full">
                      <div className="title-field flex flex-col gap-[30px] md:gap-[20px] sm:gap-[15px] w-full md:max-w-full sm:text-center">
                        <h2 className="title text-[120px] 2xl:text-[80px] xl:text-[75px] lg:text-[60px] md:text-50 sm:text-[42px] xsm:text-36 font-normal text-white leading-[1] tracking-[-2.4px]" aria-hidden="true">
                          {t('homepage.hero_title')}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 */}
              {/* <div className="swiper-slide group/slide overflow-hidden isolate">
                <div
                  className="content relative"
                  data-swiper-parallax-x="40%"
                  data-swiper-parallax-scale="1.5"
                >
                  <div className="image-field translate-z-0 absolute left-0 top-0 w-full h-full">
                    <div className="gradient bg-[linear-gradient(180deg,_rgba(56,_56,_56,_0.75)_0%,_rgba(56,_56,_56,_0.00)_61.17%,_rgba(56,_56,_56,_0.75)_100%);] absolute top-0 left-0 w-full h-full z-[2] pointer-events-none translate-z-0"></div>
                    <div className="image w-full h-[100dvh] overflow-hidden translate-z-0">
                      <img
                        src="/imgs/Home_Slider_2-3.jpg"
                        data-speed="0.75"
                        className="w-full h-full object-cover object-center scale-105"
                        alt="Seen Group | HOME"
                      />
                    </div>
                  </div>

                  <div className="text-field relative z-20 flex items-end max-w-[1700px] mx-auto px-[30px] h-[calc(100dvh)] sm:h-[calc(100dvh)] pb-90 sm:pb-120">
                    <div className="content flex flex-col gap-[50px] xl:gap-[40px] lg:gap-[30px] md:gap-[20px] translate-z-0 w-[calc(100%-300px)] sm:w-full">
                      <div className="title-field flex flex-col gap-[30px] md:gap-[20px] sm:gap-[15px] w-full md:max-w-full sm:text-center">
                        <h2 className="title text-[120px] 2xl:text-[80px] xl:text-[75px] lg:text-[60px] md:text-50 sm:text-[42px] xsm:text-36 font-normal text-white leading-[1] tracking-[-2.4px]">
                          {t('homepage.hero_title')}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Carousel bottom */}
          <div className="carousel-bottom-field absolute bottom-0 left-1/2 -translate-x-1/2 w-full z-20">
            <div className="bottom-container container max-w-[1700px] mx-auto px-[30px] pb-[40px] sm:pb-0">
              <div className="banner-content flex justify-end items-center w-full pt-40 sm:pt-30 xsm:pt-20 pb-30 px-22 xsm:flex-col xsm:gap-15 sm:justify-center">
                {/* Scroll down button */}
                <div id='scroll-down' className="scroll-down absolute bottom-30 min-xs:left-[50%] min-xs:translate-x-[-50%] xs:left-0 home-panel-button group/down gap-10 flex flex-col justify-center items-center z-3 cursor-pointer px-15 2xl:px-10">
                  <div
                    className="group/scroll content scrollable flex flex-col gap-20 md:gap-5 items-center cursor-pointer pointer-events-auto w-25"
                    onClick={() => {
                      const target = document.querySelector('.scrollable-field');
                      if (target) {
                        const offset = -75; // matches data-smooth-offset="-75"
                        const targetPosition = target.offsetTop + offset;
                        window.scrollTo({
                          top: targetPosition,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    <div className="icon h-40 xl:scale-75">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 34 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          className="stroke-white/25 group-hover/scroll:stroke-white duration-350"
                          x="0.625"
                          y="0.625"
                          width="32.75"
                          height="54.75"
                          rx="16.375"
                          strokeWidth="1.25"
                        ></rect>
                        <path
                          className="group-hover/scroll:translate-y-[12px] duration-450"
                          d="M17 15L17 23"
                          stroke="white"
                          strokeWidth="4"
                          strokeLinecap="round"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Pagination bullets - Swiper will automatically populate this */}
                <div className="banner-pagination relative flex flex-row gap-8 items-center justify-start sm:justify-center !translate-x-0 !left-0 mt-15 pt-5 sm:pl-50 swiper-pagination-clickable swiper-pagination-bullets swiper-pagination-horizontal swiper-pagination-bullets-dynamic" style={{ width: "240px" }}>
                  {/* Swiper will automatically generate bullets here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
  