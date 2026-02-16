import { Plus, Package, Star, Twitter, MessageSquare, Facebook } from 'lucide-react';
import { Button } from '../components/Button';
import React, { useState, useEffect } from 'react';
import { useAppMeta } from '../hooks/useAppMeta';
import { useFeedbackState } from '../hooks/useFeedbackState';
import { motion } from 'motion/react';
import { useSeasonalAsset } from '../hooks/useSeasonalAsset';
import { dataService } from '../services/dataService';
import type { ExtensionData, GuideCategoryData } from '../types/data';
import { DiscordIcon } from '../components/DiscordIcon';

interface HomePageProps {
  onNavigate?: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { apps: unifiedApps } = useAppMeta();
  const { isFeedbackOpen, handleToggle, handleClose } = useFeedbackState();
  const [extensionsCount, setExtensionsCount] = useState<number>(0);
  const [guidesCount, setGuidesCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const [exts, guides] = await Promise.all([
        dataService.getExtensions(),
        dataService.getGuideCategories()
      ]);
      setExtensionsCount(exts.length);
      const totalGuides = guides.reduce((total, category) => total + category.guides.length, 0);
      setGuidesCount(totalGuides);
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: <Plus className="w-10 h-10" />,
      title: 'Quickstart',
      description: 'Get started quickly with our comprehensive guides',
      path: '/guides',
      // Using avatar accent colors: Blush Pink to Badge Gold
      gradient: 'from-[#F472B6] to-[#FBBF24]',
    },
    {
      icon: <Package className="w-10 h-10" />,
      title: 'Software',
      description: 'Software for every Operating System',
      path: '/software',
      // Using avatar primary colors: Cyan (Hair) to Royal Blue (Uniform)
      gradient: 'from-[#38BDF8] to-[#2563EB]',
    },
    {
      icon: <Star className="w-10 h-10" />,
      title: 'Extensions',
      description: 'Cloudstream, Aniyomi & Dantotsu Extension Repos & Guides',
      path: '/extensions',
      // Using avatar deep accents: Indigo to Deep Violet
      gradient: 'from-[#818CF8] to-[#7C3AED]',
    },
  ];

  const avatarImage = useSeasonalAsset('homeAvatar', '/polic.png');

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, label: 'Twitter', link: 'https://x.com/iitachiyomi', color: '#333' },
    { icon: <DiscordIcon className="w-5 h-5" />, label: 'Discord', link: 'https://discord.gg/hfYtH9hrRm', color: '#5865F2' },
    { icon: <Facebook className="w-5 h-5" />, label: 'Facebook', link: 'https://facebook.com/iitachiyomi', color: '#1877F2' },
  ];

  const formatCount = (value: number) => {
    if (value >= 1000) {
      const formatted = value % 1000 === 0 ? (value / 1000).toString() : (value / 1000).toFixed(1).replace(/\.0$/, '');
      return `${formatted}k+`;
    }
    return `${value}+`;
  };

  const socialGridRef = React.useRef<HTMLDivElement>(null);
  const [useTwoColumns, setUseTwoColumns] = React.useState(false);

  React.useEffect(() => {
    const evaluateColumns = () => {
      const container = socialGridRef.current;
      if (!container) return;

      const previousTemplate = container.style.gridTemplateColumns;
      container.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';

      const hasOverflow = Array.from(container.children).some((child) => {
        if (!(child instanceof HTMLElement)) return false;
        return child.scrollWidth > child.clientWidth + 1;
      });

      container.style.gridTemplateColumns = previousTemplate;
      setUseTwoColumns((prev) => (prev !== hasOverflow ? hasOverflow : prev));
    };

    evaluateColumns();
    window.addEventListener('resize', evaluateColumns);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => evaluateColumns());
      if (socialGridRef.current) {
        resizeObserver.observe(socialGridRef.current);
      }
    }

    return () => {
      window.removeEventListener('resize', evaluateColumns);
      resizeObserver?.disconnect();
    };
  }, [socialLinks.length]);

  return (
    <div className="max-w-7xl mx-auto pt-10 relative">
      {/* Decorative Background Elements - Matches Character Palette */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 -z-10">
        {/* Top Right: Gold Glow (Badge) */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#FBBF24] to-transparent rounded-full blur-3xl"></div>
        {/* Bottom Left: Cyan Glow (Hair) */}
        <div className="absolute bottom-40 left-10 w-72 h-72 bg-gradient-to-br from-[#38BDF8] to-transparent rounded-full blur-3xl"></div>
        {/* Center: Pink Glow (Blush) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#F472B6] to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center pb-8 lg:pb-12 relative">
        {/* Mobile Avatar (Above content on mobile) */}
        <div className="lg:hidden flex items-center justify-center mb-4">
          <div className="relative w-48 h-48">
            <div className="animate-float">
              <div className="relative">
                {/* Glowing background - using brand colors */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-3)] via-[var(--chart-2)] to-[var(--chart-1)] rounded-full blur-2xl opacity-60 scale-110"></div>

                {/* Avatar */}
                <img
                  src={avatarImage}
                  alt="Miyomi Mascot"
                  height={180}
                  width={180}
                  className="relative z-10 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left Content */}
        <div className="relative z-10 text-center lg:text-left">
          {/* H1 Title */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <h1
              className="text-[var(--brand)] font-['Poppins',sans-serif] relative inline-block"
              style={{ fontSize: 'clamp(32px, 8vw, 56px)', lineHeight: '1.1', fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              Miyomi
              {/* Badge-color decorative element */}
              <div className="absolute -top-4 -right-8 w-16 h-16 bg-gradient-to-br from-[var(--chart-4)] to-[var(--chart-3)] rounded-2xl rotate-12 blur-xl opacity-40"></div>
            </h1>
          </div>

          <p
            className="text-[var(--text-primary)] font-['Inter',sans-serif] mb-8 leading-relaxed"
            style={{ fontSize: 'clamp(16px, 2vw, 18px)', lineHeight: '1.6' }}
          >
            Your one-stop hub for <span className="text-[var(--brand)]" style={{ fontWeight: 600 }}>links, apps, extension repos</span> and more!
          </p>

          {/* CTA Button */}
          <div className="flex justify-center lg:justify-start mb-4">
            <Button variant="primary" onClick={() => onNavigate?.('/software')}>
              <span className="flex items-center gap-2">
                Explore Software
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </span>
            </Button>
          </div>

          {/* Social Buttons - Responsive grid */}
          <div
            ref={socialGridRef}
            className="grid gap-2 sm:gap-3 mb-8"
            style={{ gridTemplateColumns: useTwoColumns ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' }}
          >
            {socialLinks.map((social, index) => (
              <button
                key={index}
                onClick={() => window.open(social.link, '_blank')}
                className="w-full px-3 py-2.5 sm:px-4 bg-[var(--bg-surface)] hover:bg-[var(--chip-bg)] border border-[var(--divider)] text-[var(--text-primary)] rounded-xl transition-all font-['Inter',sans-serif] flex items-center gap-2 shadow-sm hover:shadow-md group text-xs sm:text-sm text-left"
                style={{ fontWeight: 500 }}
              >
                <div className="mt-0.5 transition-transform group-hover:scale-110 text-[var(--text-primary)] flex-shrink-0">
                  {social.icon}
                </div>
                <span className="flex-1 min-w-0 leading-tight truncate">{social.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Avatar */}
        <div className="hidden lg:flex items-center justify-center relative mx-auto">
          <div className="relative w-full max-w-lg">
            <div className="animate-float">
              <div className="relative">
                {/* Glowing background shadow - Character Palette */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--chart-3)] via-[var(--chart-2)] to-[var(--chart-1)] rounded-full blur-3xl opacity-50 scale-110"></div>

                {/* Avatar Image */}
                <img
                  src={avatarImage}
                  alt="Miyomi Mascot"
                  height={280}
                  width={280}
                  className="relative z-10 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Decorative elements around avatar */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-[var(--chart-4)] to-transparent rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-[var(--chart-2)] to-transparent rounded-full blur-2xl animate-pulse delay-300"></div>
          </div>
        </div>
      </div>

      {/* Feature Cards with Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-16 relative z-10">
        {features.map((feature, index) => {
          const featureCount = feature.path === '/guides'
            ? formatCount(guidesCount)
            : feature.path === '/software'
              ? formatCount(unifiedApps.length)
              : formatCount(extensionsCount);

          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.(feature.path)}
              className="group feature-card relative overflow-hidden p-4 sm:p-6 bg-[var(--bg-surface)] border border-[var(--divider)] rounded-2xl hover:shadow-lg transition-all text-left"
              style={{ boxShadow: '0 6px 20px 0 rgba(0,0,0,0.08)' }}
            >
              {/* Counter watermark in background */}
              <div className="absolute right-2 top-2 pointer-events-none">
                <div
                  className="font-['Poppins',sans-serif]"
                  style={{
                    fontSize: 'clamp(50px, 6vw, 66px)',
                    fontWeight: 900,
                    lineHeight: '1',
                    color: 'var(--text-secondary)',
                    opacity: 0.03,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  {featureCount}
                </div>
              </div>

              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

              <div className="relative z-10 flex items-center gap-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} dark:text-white text-[var(--text-primary)] flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  {React.cloneElement(feature.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-[var(--text-primary)] font-['Poppins',sans-serif] mb-0.5 truncate"
                    style={{ fontSize: '16px', fontWeight: 700 }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] font-['Inter',sans-serif] text-xs sm:text-sm leading-snug line-clamp-2 sm:line-clamp-3">
                    {feature.description}
                  </p>
                </div>
                {/* Arrow indicator */}
                <div className="text-[var(--brand)] group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0">
                  &rarr;
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
