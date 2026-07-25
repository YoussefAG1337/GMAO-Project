'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

function SignupForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: { role: 'TECHNICIEN' },
  });

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/signup', data);
      setSuccess(true);
      toast.success('Inscription réussie !', {
        description: 'Votre compte est en attente de validation.',
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(getErrorMessage(err));
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07080d]">
        <div className="absolute inset-0 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-[#07080d] via-[#100b21] via-[#080810] to-[#1e0b36]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#651FAA]/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
        <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
          <Card className="relative glass-card border-white/[0.06] bg-zinc-950/45 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-black/80 p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Demande envoyée</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Votre compte a été créé avec succès. Un administrateur doit maintenant valider votre
                accès avant que vous ne puissiez vous connecter.
              </p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-[#651FAA] hover:bg-purple-600 text-white rounded-xl"
            >
              Retour à la connexion
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07080d] py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 animate-gradient bg-[length:400%_400%] bg-gradient-to-br from-[#07080d] via-[#100b21] via-[#080810] to-[#1e0b36]" />

      {/* Glassmorphism gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#651FAA]/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#651FAA]/8 rounded-full blur-[140px] animate-pulse-glow [animation-delay:1.5s] pointer-events-none" />

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#651FAA]/25 to-[#7c3aed]/25 blur-xl opacity-75 pointer-events-none" />

        <Card className="relative glass-card border-white/[0.06] bg-zinc-950/45 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] shadow-black/80 overflow-hidden">
          <CardHeader className="text-center space-y-4 pb-2 pt-8">
            <div className="flex justify-center">
              <div className="relative group/logo">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#651FAA] to-[#7c3aed] blur-sm opacity-50 transition duration-500" />
                <div className="relative w-24 h-24 rounded-3xl bg-zinc-950/50 border border-white/10 flex items-center justify-center shadow-lg shadow-black/20 transform group-hover/logo:scale-105 transition duration-300 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="GMAO Logo"
                    className="w-full h-full object-contain p-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-300 via-purple-200 to-violet-400 bg-clip-text text-transparent">
                Créer un compte
              </h1>
              <p className="text-xs text-muted-foreground/80 font-medium">
                Rejoignez le système GMAO Pro
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-4 px-6 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Prénom</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('prenom')}
                      className={`pl-9 bg-white/[0.02] border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 ${errors.prenom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.prenom && (
                    <p className="text-[10px] text-red-400">{errors.prenom.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nom</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      {...register('nom')}
                      className={`pl-9 bg-white/[0.02] border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 ${errors.nom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.nom && <p className="text-[10px] text-red-400">{errors.nom.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    {...register('email')}
                    className={`pl-9 bg-white/[0.02] border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('motDePasse')}
                    className={`pl-9 pr-9 bg-white/[0.02] border-white/10 rounded-lg text-white text-sm focus:border-purple-500/50 ${errors.motDePasse ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.motDePasse && (
                  <p className="text-[10px] text-red-400">{errors.motDePasse.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Rôle</Label>
                <select
                  {...register('role')}
                  className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-purple-500/50 ${errors.role ? 'border-red-500' : ''}`}
                >
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="CHEF_TECHNICIEN">Chef Technicien</option>
                  <option value="MAGASINIER">Magasinier</option>
                  <option value="CHEF_MAINTENANCE">Chef Maintenance</option>
                </select>
                {errors.role && <p className="text-[10px] text-red-400">{errors.role.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading || !isValid}
                className="w-full mt-2 bg-[#651FAA] hover:bg-purple-600 text-white rounded-xl h-11 disabled:opacity-50"
              >
                {loading ? <Spinner className="w-4 h-4 mr-2 text-current" /> : null}
                S&apos;inscrire
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-purple-400 hover:text-purple-300 hover:underline"
              >
                Déjà un compte ? Se connecter
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
