import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, UserPlus, Zap, Sword, Skull, Wind, Waves } from 'lucide-react';
import { toast } from 'sonner';
import Turnstile from 'react-turnstile';
import { motion, AnimatePresence } from 'framer-motion';

// Anime Themes Configuration
const ANIME_THEMES = [
  // Shonen (Male)
  {
    id: 'luffy',
    name: 'Rubber Pirate',
    quote: '"Kaizoku Ou ni ore wa naru!"',
    icon: <Skull className="w-8 h-8 text-yellow-400" />,
    bgGradient: 'linear-gradient(135deg, #FF0000 0%, #FFD700 50%, #0000FF 100%)',
    primaryColor: '#FF0000',
    accentColor: '#FFD700',
    particles: '🔴',
    image: '/admin-themes/luffy.webp'
  },
  {
    id: 'saitama',
    name: 'Bald Hero',
    quote: '"OK."',
    icon: <Zap className="w-8 h-8 text-red-600" />,
    bgGradient: 'linear-gradient(135deg, #FFFF00 0%, #FF0000 100%)',
    primaryColor: '#D4AF37',
    accentColor: '#FF0000',
    particles: '👊',
    image: '/admin-themes/saitama.webp'
  },
  {
    id: 'zoro',
    name: 'Lost Swordsman',
    quote: '"Nothing happened."',
    icon: <Sword className="w-8 h-8 text-green-400" />,
    bgGradient: 'linear-gradient(135deg, #006400 0%, #000000 100%)',
    primaryColor: '#008000',
    accentColor: '#32CD32',
    particles: '⚔️',
    image: '/admin-themes/zoro.webp'
  },
  {
    id: 'naruto',
    name: 'Ninja Way',
    quote: '"Dattebayo!"',
    icon: <Wind className="w-8 h-8 text-orange-400" />,
    bgGradient: 'linear-gradient(135deg, #FFA500 0%, #00008B 100%)',
    primaryColor: '#FF4500',
    accentColor: '#FFA500',
    particles: '🍥',
    image: '/admin-themes/naruto.webp'
  },
  {
    id: 'tanjiro',
    name: 'Demon Slayer',
    quote: '"Mizunokokyu!"',
    icon: <Waves className="w-8 h-8 text-blue-400" />,
    bgGradient: 'linear-gradient(135deg, #000000 0%, #20B2AA 50%, #0000FF 100%)',
    primaryColor: '#20B2AA',
    accentColor: '#00BFFF',
    particles: '🌊',
    image: '/admin-themes/tanjiro.webp'
  },
  // Waifu (Female)
  {
    id: 'frieren',
    name: 'Elven Mage',
    quote: '"The era of humans is short."',
    icon: <Wind className="w-8 h-8 text-white" />,
    bgGradient: 'linear-gradient(135deg, #E0FFFF 0%, #F0FFF0 50%, #FFD700 100%)', // Light Cyan/Honeydew/Gold
    primaryColor: '#20B2AA', // Light Sea Green
    accentColor: '#FFD700', // Gold
    particles: '✨',
    image: '/admin-themes/frieren.webp'
  },
  {
    id: 'maomao',
    name: 'Mad Apothecary',
    quote: '"Poison is a type of medicine."',
    icon: <Skull className="w-8 h-8 text-pink-400" />,
    bgGradient: 'linear-gradient(135deg, #006400 0%, #FFC0CB 100%)', // Green/Pink
    primaryColor: '#228B22', // Forest Green
    accentColor: '#FF69B4', // Hot Pink
    particles: '🌿',
    image: '/admin-themes/maomao.webp'
  },
  {
    id: 'ai',
    name: 'Ultimate Idol',
    quote: '"Lies are love."',
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    bgGradient: 'linear-gradient(135deg, #FF00FF 0%, #8A2BE2 50%, #FF1493 100%)', // Magenta/BlueViolet/DeepPink
    primaryColor: '#FF00FF', // Magenta
    accentColor: '#FFFF00', // Yellow (Stars)
    particles: '⭐',
    image: '/admin-themes/ai.webp'
  },
  {
    id: 'yor',
    name: 'Thorn Princess',
    quote: '"May I have the honor of taking your life?"',
    icon: <Sword className="w-8 h-8 text-red-600" />,
    bgGradient: 'linear-gradient(135deg, #000000 0%, #800000 100%)', // Black/Maroon
    primaryColor: '#DC143C', // Crimson
    accentColor: '#D4AF37', // Gold
    particles: '🌹',
    image: '/admin-themes/yor.webp'
  },
  {
    id: 'power',
    name: 'Blood Fiend',
    quote: '"Bow before me, human!"',
    icon: <Skull className="w-8 h-8 text-red-500" />,
    bgGradient: 'linear-gradient(135deg, #8B0000 0%, #00008B 100%)', // DarkRed/DarkBlue
    primaryColor: '#FF0000', // Red
    accentColor: '#1E90FF', // DodgerBlue
    particles: '🩸',
    image: '/admin-themes/power.webp'
  },
];

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithEmail } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  // System State
  const [checkingSystem, setCheckingSystem] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(ANIME_THEMES[0]);

  // Initialize Random Theme with 1-Week Persistence
  useEffect(() => {
    const storedThemeId = localStorage.getItem('admin_theme_id');
    const storedExpiry = localStorage.getItem('admin_theme_expiry');
    const now = Date.now();

    let selectedTheme = ANIME_THEMES[0];
    let shouldUpdate = true;

    if (storedThemeId && storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      if (now < expiry) {
        // Theme is still valid
        const found = ANIME_THEMES.find(t => t.id === storedThemeId);
        if (found) {
          selectedTheme = found;
          shouldUpdate = false;
        }
      }
    }

    if (shouldUpdate) {
      // Pick a random theme
      selectedTheme = ANIME_THEMES[Math.floor(Math.random() * ANIME_THEMES.length)];

      // Set expiry for 1 week (7 days * 24h * 60m * 60s * 1000ms)
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const newExpiry = now + oneWeek;

      localStorage.setItem('admin_theme_id', selectedTheme.id);
      localStorage.setItem('admin_theme_expiry', newExpiry.toString());
    }

    setTheme(selectedTheme);
  }, []);

  // Check system status
  useEffect(() => {
    async function checkSystem() {
      try {
        const { data, error } = await supabase.rpc('system_has_super_admin');
        if (error) {
          console.error('[AdminLogin] Failed to check system status:', error);
          setNeedsSetup(false);
        } else {
          setNeedsSetup(data === false);
        }
      } catch (err) {
        console.error('[AdminLogin] Error checking system:', err);
      } finally {
        setCheckingSystem(false);
      }
    }
    checkSystem();
  }, []);

  // Redirect if logged in
  useEffect(() => {
    if (!authLoading && !adminLoading && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, authLoading, adminLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken && !needsSetup) {
      setError('Please complete the CAPTCHA check');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      if (needsSetup) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        const { data: claimed, error: claimError } = await supabase.rpc('claim_super_admin');
        if (claimError || !claimed) throw new Error('Failed to claim super admin.');

        toast.success(`Super Admin Created! Welcome to the crew, ${theme.name}!`);
        window.location.reload();
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || adminLoading || checkingSystem;
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10" style={{ color: theme.accentColor }} />
        </motion.div>
      </div>
    );
  }

  // Access Denied
  if (user && !isAdmin && !needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-900 text-white font-['Poppins']">
        <div className="text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">This area is for higher power levels only.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden font-['Poppins'] bg-zinc-950">

      {/* Full Screen Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {/* Main Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear hover:scale-110"
            style={{ backgroundImage: `url(${theme.image})` }}
          />

          {/* Enhancers */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          <div
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ background: theme.bgGradient }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight + 100,
              rotate: Math.random() * 360
            }}
            animate={{
              y: [null, -100],
              rotate: [null, Math.random() * 360 + 180]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {theme.particles}
          </motion.div>
        ))}
      </div>



      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
        className="relative z-20 w-full max-w-[420px] backdrop-blur-xl bg-black/40 border border-white/10 p-8 rounded-3xl shadow-2xl"
        style={{ boxShadow: `0 0 30px ${theme.primaryColor}40` }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg border-2 border-white/10"
            style={{ background: theme.primaryColor }}
          >
            {theme.icon}
          </motion.div>

          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
            {needsSetup ? 'SETUP MODE' : 'ADMIN PORTAL'}
          </h1>
          <p className="text-white/70 italic font-medium">{theme.quote}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-black/50 transition-all font-medium"
                placeholder="admin@miyomi.dev"
                style={{ borderColor: `color-mix(in srgb, ${theme.accentColor} 30%, transparent)` }}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-black/50 transition-all font-medium"
                placeholder="••••••••"
                style={{ borderColor: `color-mix(in srgb, ${theme.accentColor} 30%, transparent)` }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!needsSetup && (
            <div className="pt-1 flex justify-center opacity-90 scale-90 origin-center">
              <Turnstile
                sitekey={siteKey}
                onVerify={(token) => setTurnstileToken(token)}
                theme="dark"
              />
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-medium flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting || (!turnstileToken && !needsSetup)}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            style={{
              background: `linear-gradient(45deg, ${theme.primaryColor}, ${theme.accentColor})`,
              boxShadow: `0 4px 20px ${theme.primaryColor}60`
            }}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {needsSetup ? <UserPlus className="w-5 h-5" /> : <div className="text-xl">🚀</div>}
                <span className="tracking-wide">{needsSetup ? 'CREATE SYSTEM' : 'ENTER PORTAL'}</span>
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-white/30 mt-6 font-mono">
          SECURE CONNECTION • ENCRYPTED PAYLOAD
        </p>
      </motion.div>
    </div>
  );
}
