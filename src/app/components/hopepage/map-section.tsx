import React from 'react';
import Image from 'next/image';
import Icon from '../ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';
import HtmlRenderer from '@/lib/i18n/htmlRenderer';

// Map dot data - Only countries with business connections
const mapDots = [
    { country: "Turkey", left: "55%", top: "41.4%" },
    { country: "United Arab Emirates", left: "61%", top: "48.9%" },
    { country: "Germany", left: "49%", top: "34.3%" },
    { country: "India", left: "68%", top: "49%" },
    { country: "Egypt", left: "55%", top: "45%" },
    { country: "Canada", left: "16%", top: "30%" },
    { country: "Italy", left: "49.5%", top: "39.6%" },
    { country: "United States", left: "18%", top: "40.5%" },
    { country: "Uzbekistan", left: "63.3%", top: "39.3%" },
    { country: "France", left: "46.5%", top: "37.8%" }
];

// Map dot component
const MapDot = ({ country, left, top }: { country: string; left: string; top: string }) => (
    <div 
        className="dot dot-item group/dot pointer-events-auto absolute min-lg:opacity-0 duration-350 min-lg:delay-350 [&.is-active]:opacity-100 hover:z-5 [&.is-active]:delay-450 is-active" 
        style={{ left, top }}
    >
        <div className="text-selector absolute left-[100%] top-0 w-max p-7 flex flex-col items-center justify-center duration-450 translate-y-[10px] opacity-0 group-hover/dot:!opacity-100 group-hover/dot:translate-y-0 before:absolute before:left-0 before:bottom-[-10px] before:bg-transparent before:w-full before:h-[20px] bg-primary rounded-4 border border-solid border-white/24 pointer-events-none shadow-[0px_0px_60px_0px_rgba(246,_148,_30,_0.10);] sm:left-[50%] sm:translate-x-[-50%] sm:top-[100%]">
            <div className="text-content flex justify-center items-center relative z-20">
                <p className="text text-[12px] sm:text-[10px] font-normal leading-[14px] text-white text-center line-clamp-4 uppercase">
                    {country}
                </p>
            </div>
        </div>
        <div className="content w-[30px] h-[30px] lg:w-[25px] lg:h-[25px] md:w-[20px] md:h-[20px] relative flex items-center justify-center duration-450 group-hover/dot scale-105:">
            <div className="dot-item rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 duration-350">
                <Icon 
                name="icon-location"
                style={{color: "rgb(246, 149, 30)"}} 
                className="ho-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white" 
                size={14}
                />
            </div>
        </div>
    </div>
);

export default function MapSection() {
    const { tHtml } = useTranslation();
    
    return (
        <section className="world-map-section py-[100px] 2xl:py-[80px] xl:py-[60px] lg:py-[45px] md:py-[30px] relative lg:h-full bg-white overflow-hidden isolate">
            <div className="container max-w-[1680px] lg:my-auto">
                <div className="title sm:text-center mb-50 md:mb-30">
                    <div className="text-editor max-w-full editor-strong:font-bold editor-strong:text-primary editor-h2:leading-relaxed editor-h4:text-gray editor-h5:text-gray text-center">
                        <HtmlRenderer 
                            content={tHtml('homepage.map.title')}
                            tag="h2"
                        />
                        <HtmlRenderer 
                            content={tHtml('homepage.map.subtitle')}
                            tag="h5"
                        />
                    </div>
                </div>
                <div className="wrapper relative">
                    <div className="map-field relative">
                        <div className="image aspect-[1920/1200] max-h-[150vh] max-w-[1680px] w-full overflow-hidden translate-z-0 relative z-20 mx-auto">
                            <Image 
                                src="/imgs/map.png" 
                                className="w-full h-full object-contain object-center" 
                                alt="Seen Group | HOME" 
                                width={1680}
                                height={1200}
                                priority={false}
                            />
                        </div>

                        {/* Interactive Map Dots */}
                        <div className="dot-field absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] aspect-[1920/1200] max-h-[150vh] w-full h-full pointer-events-none z-20">
                            {mapDots.map((dot, index) => (
                                <MapDot 
                                    key={index}
                                    country={dot.country}
                                    left={dot.left}
                                    top={dot.top}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
