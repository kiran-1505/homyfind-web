'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, Phone, Shield, Loader2, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { createRecaptchaVerifier, sendOTP, verifyOTP, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Auth method tab
  const [authTab, setAuthTab] = useState<'phone' | 'email'>('phone');

  // Phone+OTP state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  // Email+Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  // Cleanup reCAPTCHA verifier on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  // ─── Phone+OTP Handlers ───────────────────────────────────

  const handleSendOTP = async () => {
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t('login.invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = createRecaptchaVerifier('recaptcha-container');
      }

      const result = await sendOTP(phone, recaptchaRef.current);
      setConfirmationResult(result);
      setPhase('otp');
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string };
      console.error('Error sending OTP:', firebaseError.code, firebaseError.message, err);
      if (firebaseError.code === 'auth/too-many-requests') {
        setError(t('login.tooManyAttempts'));
      } else if (firebaseError.code === 'auth/invalid-phone-number') {
        setError(t('login.invalidPhone'));
      } else {
        setError(t('login.verificationFailed'));
      }
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError(t('login.invalidOTP'));
      return;
    }

    if (!confirmationResult) {
      setError(t('login.verificationFailed'));
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      router.push('/dashboard');
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError(t('login.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setPhase('phone');
    setOtp('');
    setError('');
    setConfirmationResult(null);
    recaptchaRef.current = null;
  };

  const handleResendOTP = () => {
    setOtp('');
    setError('');
    if (recaptchaRef.current) {
      recaptchaRef.current.clear();
      recaptchaRef.current = null;
    }
    handleSendOTP();
  };

  // ─── Email+Password Handler ───────────────────────────────

  const handleEmailAuth = async () => {
    setError('');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('login.invalidEmail'));
      return;
    }
    if (password.length < 6) {
      setError(t('login.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('Email auth error:', err);
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          setError(t('login.emailAlreadyInUse'));
          break;
        case 'auth/user-not-found':
          setError(t('login.userNotFound'));
          break;
        case 'auth/wrong-password':
          setError(t('login.wrongPassword'));
          break;
        case 'auth/invalid-credential':
          setError(t('login.invalidCredential'));
          break;
        case 'auth/weak-password':
          setError(t('login.weakPassword'));
          break;
        case 'auth/too-many-requests':
          setError(t('login.tooManyAttempts'));
          break;
        default:
          setError(t('login.emailAuthFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 -ml-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold text-gray-900">{t('login.pageTitle')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Image src="/find-my-pg-logo.jpg" alt="Find-My-PG" width={48} height={48} className="h-12 w-auto" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Find-My-PG
            </span>
          </Link>
          <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Auth Method Tabs */}
          <div className="flex mb-5 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setAuthTab('phone'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                authTab === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone className="w-4 h-4" />
              {t('login.phoneTab')}
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('email'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                authTab === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              {t('login.emailTab')}
            </button>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ─── Phone+OTP Tab ─── */}
          {authTab === 'phone' && (
            <>
              {phase === 'phone' ? (
                <div>
                  <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Phone className="w-7 h-7 text-primary-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">{t('login.phoneLabel')}</h2>
                  <p className="text-gray-400 text-sm text-center mb-6">{t('login.subtitle')}</p>

                  <div className="relative mb-5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      placeholder={t('login.phonePlaceholder')}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                      maxLength={10}
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || phone.length !== 10}
                    className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('login.sending')}
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        {t('login.sendOTP')}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <KeyRound className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">{t('login.otpLabel')}</h2>
                  <p className="text-gray-400 text-sm text-center mb-6">
                    {t('login.otpSent', { phone })}
                  </p>

                  <div className="mb-5">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={t('login.otpPlaceholder')}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                      className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('login.verifying')}
                      </>
                    ) : (
                      t('login.verifyOTP')
                    )}
                  </button>

                  <div className="flex items-center justify-between mt-4 text-sm">
                    <button
                      onClick={handleChangeNumber}
                      className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
                    >
                      {t('login.changeNumber')}
                    </button>
                    <button
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-primary-500 hover:text-primary-600 font-medium transition-colors disabled:opacity-50"
                    >
                      {t('login.resendOTP')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─── Email+Password Tab ─── */}
          {authTab === 'email' && (
            <div>
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7 text-primary-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
                {isSignUp ? t('login.signUpTitle') : t('login.emailLabel')}
              </h2>
              <p className="text-gray-400 text-sm text-center mb-6">
                {isSignUp ? t('login.signUpSubtitle') : t('login.emailSubtitle')}
              </p>

              {/* Email input */}
              <div className="mb-3">
                <input
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('password-input')?.focus()}
                  className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* Password input with show/hide */}
              <div className="relative mb-5">
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailAuth()}
                  className="w-full px-4 pr-12 py-3.5 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleEmailAuth}
                disabled={loading || !email || password.length < 6}
                className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isSignUp ? t('login.signingUp') : t('login.signingIn')}
                  </>
                ) : (
                  isSignUp ? t('login.signUp') : t('login.signIn')
                )}
              </button>

              {/* Toggle sign in / sign up */}
              <p className="text-center text-sm text-gray-500 mt-4">
                {isSignUp ? t('login.haveAccount') : t('login.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  {isSignUp ? t('login.signIn') : t('login.signUp')}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Bottom link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('login.noListing')}{' '}
          <Link href="/add-listing" className="text-primary-500 hover:text-primary-600 font-medium">
            {t('login.listYourPG')}
          </Link>
        </p>

        {/* Hidden reCAPTCHA container — must always be in DOM */}
        <div id="recaptcha-container" />
      </div>
    </div>
  );
}
