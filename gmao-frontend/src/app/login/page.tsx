'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Factory,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = searchParams.get('redirect');
  let redirectUrl = '/dashboard';
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
    redirectUrl = redirect;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Connexion réussie !', {
        description: 'Redirection vers le tableau de bord...',
      });
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error('Échec de la connexion', {
          description: err.message,
        });
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
        toast.error('Erreur', {
          description: 'Impossible de contacter le serveur.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07080d]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-[#07080d] via-[#100b21] via-[#080810] to-[#1e0b36]" />

      {/* Grid Pattern overlay with premium fade */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, oklch(0.38 0.23 302 / 20%) 1px, transparent 1px),
                            linear-gradient(to bottom, oklch(0.38 0.23 302 / 20%) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent pointer-events-none" />

      {/* Glassmorphism gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#651FAA]/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#651FAA]/8 rounded-full blur-[140px] animate-pulse-glow [animation-delay:1.5s] pointer-events-none" />

      {/* Login card container */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        {/* Glow effect surrounding the card */}
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#651FAA]/25 to-[#7c3aed]/25 blur-xl opacity-75 pointer-events-none" />

        <Card className="relative glass-card border-white/[0.06] bg-zinc-950/45 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-black/80 overflow-hidden">
          {/* Subtle line glow at the top */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#651FAA]/50 to-[#7c3aed]/30" />

          <CardHeader className="text-center space-y-4 pb-2 pt-8">
            {/* Logo animation */}
            <div className="flex justify-center">
              <div className="relative group/logo">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#651FAA] to-[#7c3aed] blur-sm opacity-50 group-hover/logo:opacity-100 transition duration-500" />
                <div className="relative w-16 h-16 rounded-2xl bg-[#651FAA] flex items-center justify-center shadow-lg shadow-[#651FAA]/20 transform group-hover/logo:scale-105 transition duration-300">
                  <Factory className="w-8 h-8 text-white animate-pulse-glow" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#161b26] flex items-center justify-center shadow-md">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-300 via-purple-200 to-violet-400 bg-clip-text text-transparent tracking-tight">
                GMAO Pro
              </h1>
              <p className="text-xs text-muted-foreground/80 font-semibold tracking-wide uppercase">
                Système de Gestion de Maintenance Industrielle
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-4 px-6 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90"
                >
                  Adresse email
                </Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/85 group-focus-within/input:text-purple-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@entreprise.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-11 h-11 bg-white/[0.02] border-white/[0.07] hover:border-white/15 focus:border-[#651FAA]/50 focus:ring-4 focus:ring-[#651FAA]/10 placeholder:text-muted-foreground/45 text-foreground transition-all duration-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90"
                >
                  Mot de passe
                </Label>
                <div className="relative group/input">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/85 group-focus-within/input:text-purple-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-11 pr-11 h-11 bg-white/[0.02] border-white/[0.07] hover:border-white/15 focus:border-[#651FAA]/50 focus:ring-4 focus:ring-[#651FAA]/10 placeholder:text-muted-foreground/45 text-foreground transition-all duration-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button with micro-interactions */}
              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-11 relative overflow-hidden bg-gradient-to-r from-[#651FAA] to-[#7c3aed] text-white font-semibold shadow-lg shadow-purple-950/40 hover:shadow-[#651FAA]/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl cursor-pointer group/button"
              >
                <span className="absolute inset-0 bg-white/5 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Se connecter
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/button:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Signup hint */}
            <div className="mt-6 text-center">
              <Link
                href="/signup"
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
              >
                Pas encore de compte ? S&apos;inscrire
              </Link>
            </div>

            {/* Demo credentials hint */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 pt-5 border-t border-white/[0.05]">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs text-muted-foreground/75 text-center leading-relaxed font-sans">
                    <span className="font-semibold text-purple-400">
                      Identifiants de démonstration :
                    </span>
                    <br />
                    <code className="text-purple-300 font-mono mt-1.5 inline-block bg-[#651FAA]/10 px-2 py-0.5 rounded">
                      admin@gmao.com
                    </code>
                    <span className="mx-2 text-muted-foreground/30">•</span>
                    <code className="text-purple-300 font-mono mt-1.5 inline-block bg-[#651FAA]/10 px-2 py-0.5 rounded">
                      Admin@123
                    </code>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6 font-medium">
          © 2026 GMAO Pro — Plateforme de Maintenance Connectée
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen flex items-center justify-center bg-[#07080d]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#651FAA]/30 border-t-[#651FAA] animate-spin mx-auto" />
            <p className="text-sm text-purple-400/80 font-medium">Chargement de GMAO Pro...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
