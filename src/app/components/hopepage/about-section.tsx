import Icon from '../ui/Icon';
import { useTranslation } from '@/lib/i18n/useTranslation';
import HtmlRenderer from '@/lib/i18n/htmlRenderer';

export default function AboutSection() {
    const { t, tHtml } = useTranslation();
    
    return (
      <section className="about-field relative overflow-hidden isolate pb-[120px] 2xl:pb-[80px] xl:pb-[60px] lg:pb-[45px] md:pb-[30px] scrollable-field">
        <div className="container max-w-[1700px] mx-auto px-[30px]">
          <div
            className="text-content mb-100 sm:mb-50 xsm:mb-30 srb"
            data-sr-id="1"
          >
            <div className="text-editor max-w-full editor-strong:font-bold editor-strong:italic editor-h2:leading-relaxed">
              <HtmlRenderer 
                content={tHtml('homepage.about_title')}
                tag="h2"
              />
            </div>
          </div>
  
          <div className="wrapper grid grid-cols-[minmax(0,_6fr)_minmax(0,_5fr)] md:grid-cols-1 sm:grid-cols-1 gap-90 xl:gap-75 sm:gap-50 xsm:gap-30">
            {/* Left Side */}
            <div className="text-field flex flex-col justify-start gap-50 sm:gap-30 relative z-10 srb-all">
              <div
                className="text-content flex xsm:flex-col items-center justify-between gap-20"
                data-sr-id="12"
              >
                <div className="text-editor editor-h5:text-[#8B8B8B] editor-h6:text-[#8B8B8B] max-w-[530px]">
                  <h5>
                    {t('homepage.about_description')}
                  </h5>
                </div>
  
                <div className="button-field h-auto md:w-full flex flex-wrap sm:justify-center gap-50 sm:gap-[25px] max-w-[500px] md:max-w-full hover-target">
                  <a
                    href="#"
                    className="button group min-w-[150px] max-w-[300px] justify-center items-center w-fit min-h-[60px] md:min-h-[50px] flex px-[40px] bg-transparent relative space-x-[20px] transition-all !duration-450 overflow-hidden isolate rounded-full border-2 border-solid border-primary before:content before:absolute before:left-[-100%] before:top-0 before:w-full before:h-full before:bg-primary hover:border-primary hover:before:left-0 before:duration-450 sm:before:w-0 sm:h-[50px] menu-link xs:justify-center rtl:gap-2 md:px-30"
                  >
                    <div className="text-[14px] xs:text-[12px] font-semibold flex items-center text-primary group-hover:text-white relative sm:!text-primary z-2 duration-450 w-max uppercase">
                      {t('homepage.about_button')}
                    </div>
                    <div className="text-[12px] flex items-center relative z-2 duration-450 ease-samedown group-hover:translate-x-1">
                      <div className="icon relative flex justify-center items-center z-2">
                        <Icon 
                            name="icon-arrow-skew" 
                            className="h-[14px] text-[14px] md:text-12 md:h-12 text-primary duration-450 relative z-20 flex sm:!text-primary justify-center items-center group-hover:text-white group-hover:rotate-45" 
                            size={14}
                        />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
  
              {/* Counters */}
              <div
                className="counters-content max-w-[760px] w-full"
                data-sr-id="13"
              >
                <div className="project-counter relative h-fit grid grid-cols-2 xsm:grid-cols-2 gap-40 lg:gap-25 xsm:gap-15 items-center">
                  {/* Counter 1 */}
                  <div className="count-bg cursor-auto xs:h-full xs:items-end z-[1] bg-transparent flex justify-center items-center min-h-[100px] xs:min-h-[75px] relative group/counter overflow-hidden isolate duration-350">
                    <div className="text-field w-full border-0 border-solid border-b border-[#DDDDDD] group-hover/counter:border-primary group-[.active]/counter:border-primary duration-350 pb-25 sm:pb-15 h-full">
                      <div className="place-content">
                        <div className="placeholder-counter text-48 xl:text-42 lg:text-36 md:text-30 sm:text-24 xsm:text-20 h-50 xl:h-40 md:h-30 sm:h-25 xsm:h-20 font-medium leading-[1] text-black group-[.active]/counter:text-primary group-hover/counter:text-primary duration-350">
                          + 20
                        </div>
                      </div>
                      <p className="text-20 xl:text-18 xsm:text-16 xs:text-10 font-normal text-gray mt-10 sm:mt-10 sm:text-16 !leading-6 duration-350">
                        {t('homepage.stats.years_experience')}
                      </p>
                    </div>
                  </div>
  
                  {/* Counter 2 */}
                  <div className="count-bg cursor-auto xs:h-full xs:items-end z-[1] bg-transparent flex justify-center items-center min-h-[100px] xs:min-h-[75px] relative group/counter overflow-hidden isolate duration-350">
                    <div className="text-field w-full border-0 border-solid border-b border-[#DDDDDD] group-hover/counter:border-primary group-[.active]/counter:border-primary duration-350 pb-25 sm:pb-15 h-full">
                      <div className="place-content">
                        <div className="placeholder-counter text-48 xl:text-42 lg:text-36 md:text-30 sm:text-24 xsm:text-20 h-50 xl:h-40 md:h-30 sm:h-25 xsm:h-20 font-medium leading-[1] text-black group-[.active]/counter:text-primary group-hover/counter:text-primary duration-350">
                          + 10
                        </div>
                      </div>
                      <p className="text-20 xl:text-18 xsm:text-16 xs:text-10 font-normal text-gray mt-10 sm:mt-10 sm:text-16 !leading-6 duration-350">
                        {t('homepage.stats.operation_centers')}
                      </p>
                    </div>
                  </div>
  
                  {/* Counter 3 */}
                  <div className="count-bg cursor-auto xs:h-full xs:items-end z-[1] bg-transparent flex justify-center items-center min-h-[100px] xs:min-h-[75px] relative group/counter overflow-hidden isolate duration-350">
                    <div className="text-field w-full border-0 border-solid border-b border-[#DDDDDD] group-hover/counter:border-primary group-[.active]/counter:border-primary duration-350 pb-25 sm:pb-15 h-full">
                      <div className="place-content">
                        <div className="placeholder-counter text-48 xl:text-42 lg:text-36 md:text-30 sm:text-24 xsm:text-20 h-50 xl:h-40 md:h-30 sm:h-25 xsm:h-20 font-medium leading-[1] text-black group-[.active]/counter:text-primary group-hover/counter:text-primary duration-350">
                          + 10
                        </div>
                      </div>
                      <p className="text-20 xl:text-18 xsm:text-16 xs:text-10 font-normal text-gray mt-10 sm:mt-10 sm:text-16 !leading-6 duration-350">
                        {t('homepage.stats.countries')}
                      </p>
                    </div>
                  </div>
  
                  {/* Counter 4 */}
                  <div className="count-bg cursor-auto xs:h-full xs:items-end z-[1] bg-transparent flex justify-center items-center min-h-[100px] xs:min-h-[75px] relative group/counter overflow-hidden isolate duration-350">
                    <div className="text-field w-full border-0 border-solid border-b border-[#DDDDDD] group-hover/counter:border-primary group-[.active]/counter:border-primary duration-350 pb-25 sm:pb-15 h-full">
                      <div className="place-content">
                        <div className="placeholder-counter text-48 xl:text-42 lg:text-36 md:text-30 sm:text-24 xsm:text-20 h-50 xl:h-40 md:h-30 sm:h-25 xsm:h-20 font-medium leading-[1] text-black group-[.active]/counter:text-primary group-hover/counter:text-primary duration-350">
                          + 30.000
                        </div>
                      </div>
                      <p className="text-20 xl:text-18 xsm:text-16 xs:text-10 font-normal text-gray mt-10 sm:mt-10 sm:text-16 !leading-6 duration-350">
                        {t('homepage.stats.daily_operations')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Right Side Video */}
            <div
              className="image-content relative w-full h-full flex justify-center items-center srr"
              data-sr-id="6"
            >
              <div className="image-field w-full max-w-[1000px] max-h-[500px] aspect-[760/480] relative overflow-hidden isolate rounded-20">
                <video
                  className="myvideos w-full h-full object-cover object-center"
                  loop
                  muted
                  autoPlay
                >
                  <source src="https://www.seengroup.com/wp-content/uploads/2021/04/Header-5-optimized.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
