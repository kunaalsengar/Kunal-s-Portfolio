import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const expertiseData = [
  {
    number: "01",
    title: "Full Stack Developer — VibeSoft",
    text: "Working across client websites and web applications, contributing to frontend and backend development, e-commerce and CMS solutions, API integrations, database workflows, and mobile application development.",
    tag: "7 JUNE 2026 — PRESENT",
    gradient: "from-[#1f0a0c] via-[#121212] to-[#0a0a0a]"
  },
  {
    number: "02",
    title: "Client Websites & Web Apps",
    text: "Frontend and backend development for modern client websites and full-stack web applications built with React.js, HTML5, CSS3, JavaScript (ES6+), Tailwind CSS, Bootstrap, Node.js, and Express.js.",
    tag: "FRONTEND & BACKEND",
    gradient: "from-[#1a0809] via-[#111111] to-[#090909]"
  },
  {
    number: "03",
    title: "CMS, APIs & Database Workflows",
    text: "Shopify and WordPress development alongside REST API development, third-party integrations, JWT authentication, and database workflows across MongoDB, Mongoose, and MySQL.",
    tag: "SHOPIFY · WORDPRESS · APIS",
    gradient: "from-[#220a0d] via-[#131313] to-[#0a0a0a]"
  },
  {
    number: "04",
    title: "Mobile App Development",
    text: "Designing and building mobile applications using Android Studio, Flutter, and Dart to deliver practical cross-platform client experiences.",
    tag: "ANDROID STUDIO · FLUTTER · DART",
    gradient: "from-[#1d090b] via-[#101010] to-[#080808]"
  }
];

const Expertise = () => {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const cards = cardRefs.current;
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return; // Keep the top-most card fully focused

        gsap.to(card, {
          scale: 0.92 - index * 0.025,
          y: -15 - index * 8,
          filter: "blur(6px)",
          opacity: 0.4,
          scrollTrigger: {
            trigger: card,
            start: `top ${90 + index * 20}px`,
            end: "bottom top",
            scrub: true,
          }
        });
      });
    }, containerRef);

    // Magnetic mouse highlight per card
    const handleMouseMove = (e, card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const cleanups = [];
    cards.forEach((card) => {
      if (!card) return;
      const listener = (e) => handleMouseMove(e, card);
      card.addEventListener('mousemove', listener);
      cleanups.push(() => card.removeEventListener('mousemove', listener));
    });

    return () => {
      ctx.revert();
      cleanups.forEach((fn) => fn());
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el);
    }
  };

  return (
    <section
      id="expertise"
      ref={containerRef}
      className="relative w-full bg-[#050505] text-white py-20 px-6 md:px-12 select-none overflow-hidden"
    >
      {/* Cinematic Red Ambient Glow */}
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto w-full space-y-12">
        
        {/* Compact Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-black/80 backdrop-blur-xl border border-red-600/40 text-[11px] font-mono uppercase tracking-widest text-white shadow-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-red-500 font-bold">EPISODE 02</span>
              <span className="text-white/40">|</span>
              <span>EXPERIENCE &amp; EXPERTISE</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              VIBESOFT // <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-600 to-red-700 drop-shadow-[0_0_25px_rgba(229,9,20,0.35)]">
                FULL STACK DEVELOPER.
              </span>
            </h2>
          </div>
          <p className="text-white/60 text-xs md:text-sm font-light leading-relaxed max-w-xs">
            7 June 2026 — Present. Contributing across client websites, web applications, CMS &amp; e-commerce, APIs, databases, and mobile apps.
          </p>
        </div>

        {/* Compact 1-on-1 Gradient Stacking Container */}
        <div className="relative flex flex-col gap-8 pb-20">
          {expertiseData.map((item, index) => (
            <div
              key={index}
              ref={addToRefs}
              className={`sticky w-full p-6 md:p-8 rounded-2xl bg-gradient-to-br ${item.gradient} backdrop-blur-2xl border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[230px] md:min-h-[250px] transform-gpu transition-all overflow-hidden group hover:border-red-600/50`}
              style={{
                zIndex: index + 1,
                top: `${95 + index * 16}px`
              }}
            >
              {/* Dynamic Mouse Spotlight Highlight */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
                style={{
                  background: 'radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(229,9,20,0.18), transparent 70%)'
                }}
              ></div>

              {/* Crimson Accent Stripe */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent z-10"></div>

              {/* Card Header Top */}
              <div className="flex items-center justify-between w-full mb-4 relative z-10">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-500 px-2.5 py-0.5 rounded bg-red-600/10 border border-red-600/25">
                  {item.tag}
                </span>
                <span className="text-2xl md:text-3xl font-mono font-black text-white/20">
                  {item.number}
                </span>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center my-auto relative z-10">
                <div className="lg:col-span-5">
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-snug group-hover:text-red-500 transition-colors duration-300">
                    {item.title}
                  </h3>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>

              {/* Subtle Red Corner Dot */}
              <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-red-600 group-hover:shadow-[0_0_10px_#E50914] z-10 transition-all"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Expertise;