'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Lock, Mail, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTopLoader } from 'nextjs-toploader';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from '@/components/blocks/custom-link';
import { GoogleSignInButton } from '@/components/blocks/google-sign-in-button';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { login, register, verifyEmail } from '@/lib/actions/auth';

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  email: string;
  password: string;
  name?: string;
  source?: string;
}

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  initialMode?: AuthMode;
  onAuthComplete?: () => void;
}

export default function AuthForm({ initialMode, onAuthComplete }: AuthFormProps) {
  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '' } });
  const signupForm = useForm<SignupForm>({
    defaultValues: { email: '', password: '', name: '', source: 'intellicharts' },
  });

  const router = useRouter();
  const loader = useTopLoader();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<AuthMode>(
    initialMode || (searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  );
  const [email, setEmail] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [authState, setAuthState] = useState<'form' | 'verification' | 'exhausted'>('form');

  // Get the return URL from the query parameters
  const redirect = searchParams.get('redirect') || '/new';

  async function onLoginSubmit(data: LoginForm) {
    setError(null);
    setIsSubmitting(true);
    loader.start();

    try {
      const result = await login(data);

      if (result.success) {
        queryClient.setQueryData(['auth'], {
          accessToken: result.accessToken,
          isAuthenticated: true,
        });
        if (onAuthComplete) {
          onAuthComplete();
        } else {
          router.push(redirect);
        }
      } else if (result.verificationId) {
        // Email not verified, show verification form
        setEmail(data.email);
        setVerificationId(result.verificationId);
        setAuthState('verification');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      loader.done();
    }
  }

  async function onSignupSubmit(data: SignupForm) {
    setError(null);
    setAttemptsRemaining(null);
    setIsSubmitting(true);
    loader.start();

    try {
      const result = await register(data);

      if (result.success && result.verificationId) {
        setEmail(data.email);
        setVerificationId(result.verificationId);
        setAuthState('verification');
        signupForm.reset();
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      loader.done();
    }
  }

  async function handleVerification() {
    if (!verificationId || !verificationCode || verificationCode.length !== 6) return;

    setError(null);
    setAttemptsRemaining(null);
    setIsSubmitting(true);
    loader.start();

    try {
      const result = await verifyEmail({ verificationId, code: verificationCode });
      if (result.success) {
        queryClient.setQueryData(['auth'], {
          accessToken: result.accessToken,
          isAuthenticated: true,
        });
        if (onAuthComplete) {
          onAuthComplete();
        } else {
          router.push(redirect);
        }
      } else if (result.attemptsRemaining !== undefined) {
        setAttemptsRemaining(result.attemptsRemaining);
        if (result.attemptsRemaining <= 0) {
          setAuthState('exhausted');
        } else {
          setError(`Invalid code. Please try again.`);
        }
      } else {
        setError(result.error || 'Verification failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      loader.done();
    }
  }

  const resetForm = () => {
    setAuthState('form');
    setVerificationCode('');
    setVerificationId('');
    setError(null);
    setAttemptsRemaining(null);
    setEmail('');
    loginForm.reset();
    signupForm.reset();
  };

  if (authState === 'exhausted') {
    return (
      <div className="w-full max-w-md p-6">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full p-3">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">Verification failed</CardTitle>
        <CardDescription className="text-center">
          You have used all available attempts. Please try again.
        </CardDescription>
        <div className="mt-6 flex justify-center">
          <Button onClick={resetForm}>Start over</Button>
        </div>
      </div>
    );
  }

  if (authState === 'verification') {
    return (
      <div className="w-full max-w-md p-6">
        <div className="mb-6">
          <CardTitle className="text-center text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification code to:
          </CardDescription>
        </div>
        <div className="space-y-4">
          <p className="mb-6 text-center font-medium">{email}</p>
          <div className="text-muted-foreground mb-6 text-center text-sm">
            Enter the 6-digit code we sent to your email
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={(value) => setVerificationCode(value.toUpperCase())}
              className="mx-auto"
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="submit"
              onClick={handleVerification}
              disabled={!verificationCode || verificationCode.length !== 6 || isSubmitting}
              className="mt-4"
            >
              {isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
              {error}
            </div>
          )}
          {attemptsRemaining !== null && attemptsRemaining > 0 && (
            <div className="text-center text-sm font-medium text-amber-600">
              {attemptsRemaining} attempts remaining
            </div>
          )}
          <div className="text-muted-foreground text-center text-xs">
            Didn&apos;t receive the code? Check your spam folder or{' '}
            <button onClick={resetForm} className="text-primary hover:underline">
              try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-6">
      <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as AuthMode)}>
        <div className="mb-6">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <div className="min-h-[450px] space-y-4">
          <TabsContent value="login" className="mt-0 space-y-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            className="h-10 pl-10"
                            required
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="h-10 pl-10"
                            required
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-right">
                  <Link href="/forgot-password" className="text-primary text-sm font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 w-full"
                  data-testid="login-button"
                >
                  {isSubmitting ? 'Logging in...' : 'Log in'}
                </Button>
              </form>
            </Form>

            <div className="relative my-5 flex items-center justify-center">
              <div className="mr-4 w-full border-t"></div>
              <span className="text-muted-foreground text-xs uppercase">or</span>
              <div className="ml-4 w-full border-t"></div>
            </div>

            <GoogleSignInButton
              fullWidth
              onAuthComplete={() => {
                if (onAuthComplete) {
                  onAuthComplete();
                } else {
                  router.push(redirect);
                }
              }}
            />

            {error && (
              <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
          </TabsContent>
          <TabsContent value="signup" className="mt-0 space-y-6">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <Input placeholder="Your Name" className="h-10 pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            className="h-10 pl-10"
                            required
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <Input
                            placeholder="••••••••"
                            type="password"
                            className="h-10 pl-10"
                            required
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full"
                  data-testid="signup-button"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>

                <p className="text-muted-foreground px-2 text-center text-xs">
                  By signing up, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </Form>

            <div className="relative my-5 flex items-center justify-center">
              <div className="mr-4 w-full border-t"></div>
              <span className="text-muted-foreground text-xs uppercase">or</span>
              <div className="ml-4 w-full border-t"></div>
            </div>

            <GoogleSignInButton
              fullWidth
              onAuthComplete={() => {
                if (onAuthComplete) {
                  onAuthComplete();
                } else {
                  router.push(redirect);
                }
              }}
            />

            {error && (
              <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-3 text-sm">
                {error}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
