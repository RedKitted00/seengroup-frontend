
import React from 'react';
import Icon from './ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <>

            <footer className="footer-field w-full relative" style={{ backgroundColor: "#383838" }}>

                <div className="footer-top md:pt-30 relative overflow-hidden isolate z-1">
                    <div className="foot-top-info grid grid-cols-[minmax(0,_5fr)_minmax(0,_260px)_minmax(0,_5fr)] 2xl:grid-cols-[minmax(0,_5fr)_minmax(0,_200px)_minmax(0,_5fr)] 2xl:gap-30 md:grid-cols-1 gap-50 md:gap-0">
                        <div className="foot-contact flex items-center gap-80 2xl:gap-40 lg:gap-20 border-0 border-b border-solid border-white/15 relative after:absolute after:-right-44 2xl:after:-right-35 after:bottom-0 after:content after:w-1 after:h-full after:bg-white/15 after:-skew-x-[30deg] padding-left-content md:px-30 md:py-30 md:justify-center md:order-2 sm:flex-wrap sm:justify-center" style={{ paddingLeft: "32px" }}>
                            <div className="item information-item group/item relative ">
                                <a href="mailto:info@seengrp.com" className="content flex justify-center gap-20 sm:gap-[15px] group/link">
                                    <Icon
                                        name="icon-mail"
                                        className="text-[34px] h-[34px] lg:text-[24px] lg:h-[24px] sm:text-20 sm:h-20 group-hover/link:!text-primary text-[#86888A] leading-none flex items-center duration-450"
                                        size={34}
                                    />
                                    <div className="text-field relative w-full my-auto">
                                        <p className="text text-20 2xl:text-18 sm:text-16 text-[#86888A] leading-tight duration-350 group-hover/link:text-white font-normal group-hover/link:translate-x-[3px] sm:[&_br]:hidden break-all">info@seengrp.com</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="inner-content sm:space-y-5 mx-auto max-w-[220px] md:max-w-[350px] sm:max-w-full relative z-[2] md:order-1">
                            <div className="footer-logo-field w-auto pt-70 2xl:pt-50 -mb-44 md:mb-0 md:pt-0">
                                <a href="#" className="flex justify-start">
                                    <div className="image overflow-hidden w-full max-w-[260px] md:max-w-[130px]">
                                        <img src="/imgs/site-logo.png" alt="Seen Group | Leading the Way in National Technology: A Productive Meeting with Minister of Industry and Technology Mehmet Fatih Kacır" className="w-full h-full object-contain object-center" />
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="social-media-field flex items-center justify-end sm:justify-center xsm:justify-center border-0 border-b border-solid border-white/15 relative after:absolute after:-left-44 2xl:after:-left-35 after:bottom-0 after:content after:w-1 after:h-full after:bg-white/15 after:skew-x-[30deg] padding-right-content md:px-30 md:py-10 md:justify-center md:order-3" style={{ paddingRight: "32px" }}>

                        </div>
                    </div>
                    <div className="container max-w-full px-0">
                        <div className="wrapper w-full">
                            <div className="footer-menu-content xs:space-y-5">
                                <div className="newsletter-field">
                                    <div className="wrapper grid grid-cols-1 justify-center">
                                        <div className="other-link-box w-full max-w-[760px] mx-auto">
                                            <ul className="flex space-x-5 sm:space-x-0 sm:space-y-5 mt-130 my-[85px] md:my-[40px] sm:my-[30px] justify-between px-[30px] sm:flex-col sm:items-center sm:gap-10">
                                                <li>
                                                    <a href="/" className="group/link flex items-center duration-450">
                                                        <div className="text text-[20px] xl:text-[18px] md:text-[16px] text-[#86888A] leading-tight duration-450 group-hover/link:text-white relative before:absolute before:left-0 before:bottom-0 before:-translate-y-1/2 before:w-0 before:h-[1px] before:bg-white before:duration-450 group-hover/link:before:w-full">{t('navigation.home').toUpperCase()}</div>
                                                    </a>
                                                </li>

                                                <li>
                                                    <a href="/product" className="group/link flex items-center duration-450">
                                                        <div className="text text-[20px] xl:text-[18px] md:text-[16px] text-[#86888A] leading-tight duration-450 group-hover/link:text-white relative before:absolute before:left-0 before:bottom-0 before:-translate-y-1/2 before:w-0 before:h-[1px] before:bg-white before:duration-450 group-hover/link:before:w-full">{t('navigation.products').toUpperCase()}</div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/career" className="group/link flex items-center duration-450">
                                                        <div className="text text-[20px] xl:text-[18px] md:text-[16px] text-[#86888A] leading-tight duration-450 group-hover/link:text-white relative before:absolute before:left-0 before:bottom-0 before:-translate-y-1/2 before:w-0 before:h-[1px] before:bg-white before:duration-450 group-hover/link:before:w-full">{t('navigation.career').toUpperCase()}</div>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="/contact" className="group/link flex items-center duration-450">
                                                        <div className="text text-[20px] xl:text-[18px] md:text-[16px] text-[#86888A] leading-tight duration-450 group-hover/link:text-white relative before:absolute before:left-0 before:bottom-0 before:-translate-y-1/2 before:w-0 before:h-[1px] before:bg-white before:duration-450 group-hover/link:before:w-full">{t('navigation.contact').toUpperCase()}</div>
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="split w-full h-[1px] bg-white/14 flex xs:!mt-0"></div>
                                <div className="footer-menu-field ">
                                    <div className="wrapper grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                                        <div className="footer-menu-inner relative p-[40px] sm:p-20 group/mpft [&amp;::nth-child(3)]:hidden">
                                            <div className="split w-[1px] h-full bg-white/14 absolute top-0 right-0 sm:hidden"></div>
                                            <div className="gradient duration-450 bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.05)_0%,_rgba(255,_255,_255,_0.00)_100%);] absolute top-0 left-0 w-full h-full -z-[1] opacity-0 group-hover/mpft:opacity-100"></div>
                                            <div className="list grid sm:justify-center sm:text-center gap-[30px] max-w-[450px] mx-auto">
                                                <div className="title font-semibold text-white text-[20px] sm:text-18 xsm:text-16 mb-[15px] xs:mb-[10px] group-[.active]/mpbox:text-white duration-450 relative before:absolute before:left-0 sm:before:left-[50%] sm:before:translate-x-[-50%] before:-bottom-20 before:-translate-y-1/2 before:w-30 before:h-[4px] before:bg-primary before:duration-450 group-hover/mpft:before:w-60">SEEN GROUP </div>
                                                <a href="https://maps.app.goo.gl/W1x9R5D6Zi6vTBqe7?g_st=atm" target="_blank" className="item group/item w-fit text-[#86888A] group-[.active]/mpbox:text-white  flex gap-[10px] hover:text-white">
                                                    <div className="text-field group-hover/item:translate-x-2 duration-450 gap-[5px]">
                                                        <div className="text text-[16px] font-light inline ">
                                                        Turkey  </div>
                                                    </div>
                                                </a>
                                                <div className="button-field h-auto md:w-full flex flex-wrap sm:justify-center gap-50 sm:gap-[25px]">
                                                    <a href="https://maps.app.goo.gl/W1x9R5D6Zi6vTBqe7?g_st=atm" target="_blank" className="button group min-w-[150px] max-w-[300px] justify-center items-center w-auto flex py-9 px-15 bg-white/10 relative space-x-[5px] transition-all !duration-450 overflow-hidden isolate rounded-full before:content before:absolute before:left-[-100%] before:top-0 before:w-full before:h-full before:bg-primary hover:border-primary hover:before:left-0 before:duration-450 sm:before:w-0 menu-link xs:justify-center rtl:gap-2">
                                                        <div className="text-[12px] flex items-center relative z-2 duration-450 ease-samedown group-hover:translate-x-1 ">
                                                            <div className="icon relative flex justify-center items-center z-2">
                                                                <Icon
                                                                    name="icon-location"
                                                                    className="h-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white"
                                                                    size={14}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-[14px] xs:text-[12px] font-medium flex items-center text-white group-hover:text-white relative sm:!text-white z-2 duration-450 w-max">{t('footer.get_directions')}</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="footer-menu-inner relative p-[40px] sm:p-20 group/mpft [&::nth-child(3)]:hidden">
                                            <div className="split w-[1px] h-full bg-white/14 absolute top-0 right-0 sm:hidden"></div>
                                            <div className="gradient duration-450 bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.05)_0%,_rgba(255,_255,_255,_0.00)_100%);] absolute top-0 left-0 w-full h-full -z-[1] opacity-0 group-hover/mpft:opacity-100"></div>
                                            <div className="list grid sm:justify-center sm:text-center gap-[30px] max-w-[450px] mx-auto">
                                                <div className="title font-semibold text-white text-[20px] sm:text-18 xsm:text-16 mb-[15px] xs:mb-[10px] group-[.active]/mpbox:text-white duration-450 relative before:absolute before:left-0 sm:before:left-[50%] sm:before:translate-x-[-50%] before:-bottom-20 before:-translate-y-1/2 before:w-30 before:h-[4px] before:bg-primary before:duration-450 group-hover/mpft:before:w-60">SEEN GmbH </div>
                                                <a href="https://maps.app.goo.gl/pkTo5kv8gcQbEvBc8?g_st=atm" target="_blank" className="item group/item w-fit text-[#86888A] group-[.active]/mpbox:text-white  flex gap-[10px] hover:text-white">
                                                    <div className="text-field group-hover/item:translate-x-2 duration-450 gap-[5px]">
                                                        <div className="text text-[16px] font-light inline ">
                                                      Germany</div>
                                                    </div>
                                                </a>
                                                <div className="button-field h-auto md:w-full flex flex-wrap sm:justify-center gap-50 sm:gap-[25px]">
                                                    <a href="https://maps.app.goo.gl/pkTo5kv8gcQbEvBc8?g_st=atm" target="_blank" className="button group min-w-[150px] max-w-[300px] justify-center items-center w-auto flex py-9 px-15 bg-white/10 relative space-x-[5px] transition-all !duration-450 overflow-hidden isolate rounded-full before:content before:absolute before:left-[-100%] before:top-0 before:w-full before:h-full before:bg-primary hover:border-primary hover:before:left-0 before:duration-450 sm:before:w-0 menu-link xs:justify-center rtl:gap-2">
                                                        <div className="text-[12px] flex items-center relative z-2 duration-450 ease-samedown group-hover:translate-x-1 ">
                                                            <div className="icon relative flex justify-center items-center z-2">
                                                                <Icon
                                                                    name="icon-location"
                                                                    className="h-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white"
                                                                    size={14}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-[14px] xs:text-[12px] font-medium flex items-center text-white group-hover:text-white relative sm:!text-white z-2 duration-450 w-max">{t('footer.get_directions')}</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="footer-menu-inner relative p-[40px] sm:p-20 group/mpft [&::nth-child(3)]:hidden">
                                            <div className="split w-[1px] h-full bg-white/14 absolute top-0 right-0 sm:hidden"></div>
                                            <div className="gradient duration-450 bg-[linear-gradient(180deg,_rgba(255,_255,_255,_0.05)_0%,_rgba(255,_255,_255,_0.00)_100%);] absolute top-0 left-0 w-full h-full -z-[1] opacity-0 group-hover/mpft:opacity-100"></div>
                                            <div className="list grid sm:justify-center sm:text-center gap-[30px] max-w-[450px] mx-auto">
                                                <div className="title font-semibold text-white text-[20px] sm:text-18 xsm:text-16 mb-[15px] xs:mb-[10px] group-[.active]/mpbox:text-white duration-450 relative before:absolute before:left-0 sm:before:left-[50%] sm:before:translate-x-[-50%] before:-bottom-20 before:-translate-y-1/2 before:w-30 before:h-[4px] before:bg-primary before:duration-450 group-hover/mpft:before:w-60">SEEN GROUP UAE </div>
                                                <a href="https://maps.app.goo.gl/tTbrFEvQxdn6FEAG9?g_st=atm" target="_blank" className="item group/item w-fit text-[#86888A] group-[.active]/mpbox:text-white  flex gap-[10px] hover:text-white">
                                                    <div className="text-field group-hover/item:translate-x-2 duration-450 gap-[5px]">
                                                        <div className="text text-[16px] font-light inline ">
                                                         United Arab Emirates</div>
                                                    </div>
                                                </a>
                                                <div className="button-field h-auto md:w-full flex flex-wrap sm:justify-center gap-50 sm:gap-[25px]">
                                                    <a href="https://maps.app.goo.gl/tTbrFEvQxdn6FEAG9?g_st=atm" target="_blank" className="button group min-w-[150px] max-w-[300px] justify-center items-center w-auto flex py-9 px-15 bg-white/10 relative space-x-[5px] transition-all !duration-450 overflow-hidden isolate rounded-full before:content before:absolute before:left-[-100%] before:top-0 before:w-full before:h-full before:bg-primary hover:border-primary hover:before:left-0 before:duration-450 sm:before:w-0 menu-link xs:justify-center rtl:gap-2">
                                                        <div className="text-[12px] flex items-center relative z-2 duration-450 ease-samedown group-hover:translate-x-1 ">
                                                            <div className="icon relative flex justify-center items-center z-2">
                                                                <Icon
                                                                    name="icon-location"
                                                                    className="h-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white"
                                                                    size={14}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="text-[14px] xs:text-[12px] font-medium flex items-center text-white group-hover:text-white relative sm:!text-white z-2 duration-450 w-max">{t('footer.get_directions')}</div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div className="split w-full h-[1px] bg-white/14 flex xs:!mt-0"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom relative z-10 ">
                    <div className="container max-w-[1700px] py-30">
                        <div className="wrapper grid grid-cols-[minmax(0,_1fr)_minmax(0,_1fr)_minmax(0,_1fr)] md:grid-cols-1 gap-6 md:gap-15">
                            <div className="copyright-field flex items-center md:justify-center sm:order-2">
                                <div className="copyright text-[#86888A] leading-tight sm:text-center">{t('footer.copyright')}</div>
                            </div>
                            <div className="link-field flex items-center justify-center sm:order-1">
                                <ul className="flex space-x-8 sm:space-x-0 sm:space-y-5 sm:flex-col gap-50 md:gap-30 sm:gap-10">

                                </ul>
                            </div>
                            <div className="signature flex justify-end md:justify-center sm:order-3">
                                {/* PENTA LOGO | START */}
                                <div className="penta-logo group/py overflow-hidden flex items-center w-[94px] duration-500 hover:w-[88px]">
                                </div>
                                {/* PENTA LOGO | END */}
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
