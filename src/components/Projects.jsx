import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Verified Portfolio Projects (8 slots preserving 3x3 folder dispersion geometry)
const projectsData = [
  {
    title: "GamingPCWorld",
    category: "LIVE WEBSITE",
    description: "Contribution: Complete Website Development",
    contribution: "Complete Website Development",
    tags: ["Website Development"],
    status: "LIVE",
    liveUrl: "https://www.gamingpcworld.com/",
    episode: "S01 E01"
  },
  {
    title: "TruPahadi",
    category: "LIVE WEBSITE",
    description: "Contribution: Complete Website Development",
    contribution: "Complete Website Development",
    tags: ["Website Development"],
    status: "LIVE",
    liveUrl: "https://trupahadi.com/",
    episode: "S01 E02"
  },
  {
    title: "Sahota Hospital",
    category: "LIVE WEBSITE",
    description: "Contribution: Complete Website Development",
    contribution: "Complete Website Development",
    tags: ["Website Development"],
    status: "LIVE",
    liveUrl: "https://sahotahospitalksp.com/",
    episode: "S01 E03"
  },
  {
    title: "JJM Hospital Kashipur",
    category: "LIVE WEBSITE",
    description: "Contribution: Complete Website Development",
    contribution: "Complete Website Development",
    tags: ["Website Development"],
    status: "LIVE",
    liveUrl: "https://jjmhospitalkashipur.com/",
    episode: "S01 E04"
  },
  {
    title: "WebMate",
    category: "PERSONAL AI PROJECT",
    phase: "PHASE 0 FOUNDATION",
    description: "Interactive AI-Powered Browser Companion.",
    tags: ["WXT", "React 18", "TypeScript", "Tailwind CSS", "Zustand", "GSAP", "Node.js", "Fastify 5.x", "pnpm"],
    status: "IN DEVELOPMENT",
    githubUrl: "https://github.com/kunaalsengar/WebMate",
    episode: "S01 E05"
  },
  {
    title: "Project 06 — Pending",
    category: "PERSONAL AI PROJECT",
    description: "Project details coming soon.",
    tags: [],
    status: "PENDING",
    episode: "S01 E06"
  },
  {
    title: "Project 07 — Pending",
    category: "PERSONAL AI PROJECT",
    description: "Project details coming soon.",
    tags: [],
    status: "PENDING",
    episode: "S01 E07"
  },
  {
    title: "Project 08 — Pending",
    category: "PERSONAL AI PROJECT",
    description: "Project details coming soon.",
    tags: [],
    status: "PENDING",
    episode: "S01 E08"
  }
];

const Projects = () => {
  const containerRef = useRef(null);
  const folderBackRef = useRef(null);
  const folderFrontRef = useRef(null);
  const cardsRef = useRef([]);
  const mobileCardsRef = useRef([]);
  const mobileCarouselRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Set initial origins (Centered in viewport)
      gsap.set([folderBackRef.current, folderFrontRef.current], { 
        xPercent: -50, 
        yPercent: -50 
      });
      gsap.set(folderFrontRef.current, { transformOrigin: "bottom center" });
      
      const getGridPos = (index) => {
        let row, col;
        if (index < 3) { row = 0; col = index; }
        else if (index === 3) { row = 1; col = 0; }
        else if (index === 4) { row = 1; col = 2; }
        else { row = 2; col = index - 5; }
        return { row, col };
      };

      cardsRef.current.forEach((card) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50,
          rotation: gsap.utils.random(-6, 6),
          scale: 0.85,
          x: 0,
          y: 0,
        });
      });

      let mm = gsap.matchMedia();

      mm.add({
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)"
      }, (context) => {
        let { isDesktop, isMobile } = context.conditions;

        if (isDesktop) {
          let floatTween;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 50%", 
              end: "bottom 50%",
              toggleActions: "play reverse play reverse",
              onEnter: () => { if (floatTween) floatTween.kill(); },
              onEnterBack: () => { if (floatTween) floatTween.kill(); },
              onLeave: () => { if (floatTween) floatTween.kill(); },
              onLeaveBack: () => { if (floatTween) floatTween.kill(); }
            },
            onComplete: () => {
              floatTween = gsap.to(cardsRef.current, {
                y: "+=12",
                rotation: "+=1",
                duration: 3.5,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                stagger: { amount: 1.5, from: "random" }
              });
            }
          });

          // 1. Folder opens with smooth rotation
          tl.to(folderFrontRef.current, {
            rotationX: -130,
            duration: 1.2,
            ease: "power3.inOut"
          });

          // 2. Cards rise up collectively
          tl.to(cardsRef.current, {
            y: -140,
            scale: 0.9,
            zIndex: 70,
            duration: 0.6,
            stagger: 0.04,
            ease: "back.out(1.2)"
          }, "-=0.6");

          // 3. Cards magically spread out into an ultra-clean blockbuster grid layout
          tl.to(cardsRef.current, {
            x: (i) => {
              const w = Math.max(...cardsRef.current.map(c => c?.offsetWidth || 0)) || 360;
              const gap = 40;
              const { col } = getGridPos(i);
              return (col - 1) * (w + gap);
            },
            y: (i) => {
              const h = Math.max(...cardsRef.current.map(c => c?.offsetHeight || 0)) || 240;
              const gap = 40;
              const { row } = getGridPos(i);
              return (row - 1) * (h + gap);
            },
            rotation: () => gsap.utils.random(-3, 3),
            scale: 1,
            duration: 1.4,
            stagger: { amount: 0.4, from: "center" },
            ease: "expo.out"
          }, "-=0.2");
        }

        if (isMobile) {
          const cardW = window.innerWidth * 0.8;
          const gap = 20;
          
          mobileCardsRef.current.forEach((card, i) => {
            gsap.set(card, {
              x: -(i * (cardW + gap)), 
              y: 0,
              scale: 0.4,
              opacity: 0,
              rotation: gsap.utils.random(-15, 15)
            });
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 60%",
            }
          });

          tl.to(folderFrontRef.current, {
            rotationX: -130,
            duration: 0.8,
            ease: "power3.inOut"
          });

          tl.to(mobileCardsRef.current, {
            y: -100,
            opacity: 1,
            scale: 0.85,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(1.2)"
          }, "-=0.4");

          tl.to(mobileCardsRef.current, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: (i) => i === 0 ? 1 : 0.92,
            opacity: (i) => i === 0 ? 1 : 0.5,
            duration: 0.8,
            stagger: 0.08,
            ease: "expo.out",
            onComplete: () => {
              if (mobileCarouselRef.current) {
                mobileCarouselRef.current.style.overflowX = 'auto';
                mobileCarouselRef.current.style.pointerEvents = 'auto';
              }
            }
          }, "-=0.2");
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={containerRef} className="bg-[#0b0b0b] min-h-[100svh] md:min-h-[170vh] relative font-sans overflow-x-clip text-white w-full flex items-center justify-center py-24 md:py-40 select-none">
      
      {/* Background Netflix Cinematic Title Watermark */}
      <div className="absolute top-10 left-0 w-full flex items-start justify-center pointer-events-none z-0">
        <h1 className="text-[14vw] sm:text-[17vw] md:text-[20vw] font-black text-white/[0.03] tracking-tighter leading-none whitespace-nowrap uppercase">
          ORIGINALS
        </h1>
      </div>

      {/* Ambient Crimson Glow behind folder */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] bg-red-600/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Main Perspective Container */}
      <div className="mt-12 relative w-full max-w-7xl h-full flex items-center justify-center perspective-[2000px] z-10">
        
        {/* Origin Container */}
        <div className="relative w-0 h-0 transform-style-3d">
          
          {/* Folder Back */}
          <div 
            ref={folderBackRef}
            className="absolute w-[85vw] md:w-[32vw] max-w-[380px] aspect-video bg-[#141414] rounded-[24px] border border-red-600/40 shadow-[0_20px_50px_rgba(229,9,20,0.25)] flex items-center justify-center"
            style={{ zIndex: 5 }}
          >
            <div className="absolute -top-6 left-6 w-32 h-8 bg-[#1f1f1f] rounded-t-xl border-t border-red-600/30" />
            <div className="relative z-10 text-red-600 font-mono font-black text-2xl tracking-widest uppercase opacity-60">
              ARCHIVE_SLOTS
            </div>
          </div>

          {/* Desktop Project Cards */}
          {projectsData.map((project, i) => (
            <div 
              key={i}
              ref={el => cardsRef.current[i] = el}
              className="hidden md:block absolute w-[80vw] md:w-[33vw] max-w-[380px] aspect-[16/10] will-change-transform"
              style={{ zIndex: 10 + i }}
            >
              <div className="w-full h-full rounded-[24px] overflow-hidden border border-white/15 bg-[#141414]/95 backdrop-blur-2xl shadow-[0_25px_50px_rgba(0,0,0,0.9)] transition-all duration-500 group hover:scale-[1.04] hover:border-red-600 hover:shadow-[0_35px_80px_rgba(229,9,20,0.35)] hover:-translate-y-2 relative z-10 p-2.5 lg:p-4 xl:p-5 flex flex-col justify-between">
                
                {/* Top Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[8.5px] lg:text-[10px] font-mono font-bold tracking-widest uppercase text-red-500 bg-red-600/10 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded border border-red-600/20">
                    {project.episode}
                  </span>
                  <span
                    className={`text-[8.5px] lg:text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                      project.status === 'LIVE'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        : project.status === 'IN DEVELOPMENT'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-white/50 bg-white/5 border-white/15'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Middle Title & Description */}
                <div className="space-y-0.5 lg:space-y-1 my-auto">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                    <span className="text-[8px] lg:text-[9px] xl:text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {project.category}
                    </span>
                    {project.phase && (
                      <span className="text-[7.5px] lg:text-[8.5px] xl:text-[9.5px] font-mono uppercase tracking-wider text-amber-400/90">
                        {project.phase}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm lg:text-lg xl:text-2xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors duration-300 leading-tight truncate">
                    {project.title}
                  </h3>
                  <p className="text-[9.5px] lg:text-[11px] xl:text-xs text-white/70 font-light leading-snug line-clamp-2">
                    {project.description}
                  </p>
                </div>

                {/* Bottom Tech Tags & Action Link */}
                <div className="pt-1 lg:pt-2 border-t border-white/10 space-y-1 lg:space-y-1.5">
                  {project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-0.5 lg:gap-1">
                      {project.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[7.5px] lg:text-[8.5px] xl:text-[9.5px] leading-none font-mono text-white/75 bg-white/5 px-1 lg:px-1.5 py-[3px] lg:py-1 rounded border border-white/5 group-hover:border-red-600/30 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[8.5px] lg:text-[10px] font-mono uppercase tracking-widest text-white/30">
                      Slot Reserved
                    </div>
                  )}

                  {(project.liveUrl || project.githubUrl) && (
                    <div className="flex items-center justify-between pt-0.5 pr-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[8.5px] lg:text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-red-600/90 hover:bg-red-600 px-2 lg:px-2.5 py-[3px] lg:py-1 rounded transition-colors cursor-pointer relative z-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        >
                          VISIT WEBSITE
                          <span aria-hidden="true">&#8599;</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[8.5px] lg:text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-600 px-2 lg:px-2.5 py-[3px] lg:py-1 rounded transition-colors cursor-pointer relative z-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                        >
                          GITHUB REPOSITORY
                          <span aria-hidden="true">&#8599;</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Red Glowing Corner Accent */}
                <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-red-600 group-hover:shadow-[0_0_15px_#E50914] transition-all pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Folder Front Flap */}
          <div 
            ref={folderFrontRef}
            className="absolute w-[85vw] md:w-[32vw] max-w-[380px] aspect-video pointer-events-none will-change-transform"
            style={{ zIndex: 60 }}
          >
            <div className="absolute bottom-0 w-full h-[85%] bg-[#1c1c1c] rounded-b-[24px] rounded-t-md shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex flex-col justify-end p-6 border-t border-red-600/40">
              <div className="w-20 h-1.5 bg-white/20 rounded-full mx-auto mb-2" />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Swipeable Carousel */}
      <div 
        ref={mobileCarouselRef}
        className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-auto py-12 flex items-center gap-6 px-[12.5vw] pointer-events-none z-[100] snap-x snap-mandatory overflow-x-hidden hide-scrollbar"
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        {projectsData.map((project, i) => (
          <div 
            key={`mob-${i}`}
            ref={el => mobileCardsRef.current[i] = el}
            className="shrink-0 w-[78vw] aspect-[16/11] snap-center will-change-transform relative z-10"
          >
            <div className="w-full h-full rounded-[24px] overflow-hidden border border-white/15 bg-[#141414] p-3 sm:p-5 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[8.5px] sm:text-[9px] font-mono font-bold tracking-widest text-red-500 bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">
                  {project.episode}
                </span>
                <span
                  className={`text-[8.5px] sm:text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${
                    project.status === 'LIVE'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      : project.status === 'IN DEVELOPMENT'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-white/50 bg-white/5 border-white/15'
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <div className="space-y-0.5 sm:space-y-1 my-auto">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-white/40">
                    {project.category}
                  </span>
                  {project.phase && (
                    <span className="text-[7px] sm:text-[8.5px] font-mono uppercase tracking-wider text-amber-400/90">
                      {project.phase}
                    </span>
                  )}
                </div>
                <h3 className="text-[14px] sm:text-xl font-black text-white leading-tight truncate">{project.title}</h3>
                <p className="text-[10px] sm:text-xs text-white/70 font-light leading-snug line-clamp-2">{project.description}</p>
              </div>
              <div className="pt-1 sm:pt-1.5 border-t border-white/10 space-y-1 sm:space-y-1.5">
                {project.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-[3px] sm:gap-1">
                    {project.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[7px] sm:text-[9px] leading-none font-mono text-white/75 bg-white/5 px-1 sm:px-1.5 py-[2.5px] sm:py-1 rounded border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[8.5px] sm:text-[9px] font-mono uppercase tracking-widest text-white/30">
                    Slot Reserved
                  </div>
                )}

                {(project.liveUrl || project.githubUrl) && (
                  <div>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-red-600/90 hover:bg-red-600 px-2 sm:px-2.5 py-[3px] sm:py-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        VISIT WEBSITE
                        <span aria-hidden="true">&#8599;</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-600 px-2 sm:px-2.5 py-[3px] sm:py-1 rounded transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        GITHUB REPOSITORY
                        <span aria-hidden="true">&#8599;</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default Projects;