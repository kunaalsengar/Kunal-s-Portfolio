const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/kunaalsengar',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kunal-sengar-42645a331/',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/decodzyy/',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@DECODZY',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-white py-16 px-6 md:px-12 border-t border-white/10 select-none relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col space-y-12">
        {/* Top Section: Brand & Quick Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-12 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-red-600/15 border border-red-600/40 text-xs font-mono font-black text-red-500 tracking-widest">
                KS
              </span>
              <div className="text-2xl font-black text-red-600 tracking-tighter flex items-center gap-2 drop-shadow-[0_2px_15px_rgba(220,38,38,0.9)]">
                KUNAL SENGAR<span className="w-1.5 h-1.5 rounded-full bg-white inline-block" aria-hidden="true"></span>
              </div>
            </div>
            <p className="text-xs font-mono text-white/50 tracking-widest uppercase">
              // FULL STACK DEVELOPER &bull; AI ENGINEER &bull; SEASON 2026
            </p>
          </div>

          {/* Quick Navigation Links */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap gap-5 sm:gap-6 md:gap-8 text-xs font-mono uppercase tracking-widest text-white/70">
            <a href="#home" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">Home</a>
            <a href="#about" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">About</a>
            <a href="#expertise" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">Expertise</a>
            <a href="#skills" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">Skills</a>
            <a href="#projects" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">Projects</a>
            <a href="#contact" className="hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm">Contact</a>
          </nav>
        </div>

        {/* Middle Section: Socials & Location */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs font-mono text-white/60">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-red-500 transition-colors uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500 rounded-sm"
              >
                {social.icon}
                <span>{social.name}</span>
              </a>
            ))}
          </div>

          <div className="text-white/40 tracking-widest uppercase">
            LOCATION: KASHIPUR, UTTARAKHAND, INDIA
          </div>
        </div>

        {/* Bottom Copyright & Cinematic Tagline */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t border-white/5 text-[11px] font-mono text-white/40 uppercase tracking-widest">
          <p>&copy; {currentYear} Kunal Sengar. All Rights Reserved.</p>
          <p className="text-red-500/80">ENGINEERING DIGITAL EXPERIENCES. BUILDING INTELLIGENT FUTURES.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
