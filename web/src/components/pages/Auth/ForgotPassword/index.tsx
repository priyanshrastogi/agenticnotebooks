'use client';

import { AlertCircle,Check, Lock, Mail } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from '@/components/blocks/custom-link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { forgotPassword, resetPassword } from '@/lib/actions/auth';

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordComponent() {
  const emailForm = useForm<ForgotPasswordForm>({ defaultValues: { email: '' } });
  const passwordForm = useForm<ResetPasswordForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [stage, setStage] = useState<'email' | 'verification' | 'reset' | 'success' | 'exhausted'>(
    'email'
  );
  const [email, setEmail] = useState<string>('');
  const [verificationId, setVerificationId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onEmailSubmit(data: ForgotPasswordForm) {
    setError(null);
    setAttemptsRemaining(null);
    setIsSubmitting(true);
    try {
      const result = await forgotPassword(data);
      if (result.success && result.verificationId) {
        setEmail(data.email);
        setVerificationId(result.verificationId);
        setStage('verification');
        emailForm.reset();
      } else {
        setError(result.error || 'Request failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVerificationComplete() {
    if (!verificationCode || verificationCode.length !== 6) return;
    setStage('reset');
  }

  async function onPasswordSubmit(data: ResetPasswordForm) {
    if (data.newPassword !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setAttemptsRemaining(null);
    setIsSubmitting(true);
    try {
      const result = await resetPassword({
        id: verificationId,
        code: verificationCode,
        password: data.newPassword,
      });

      if (result.success) {
        setStage('success');
        passwordForm.reset();
      } else if (result.attemptsRemaining !== undefined) {
        setAttemptsRemaining(result.attemptsRemaining);
        if (result.attemptsRemaining <= 0) {
          setStage('exhausted');
        } else {
          setError(`Invalid code. Please try again.`);
          setStage('verification'); // Go back to verification step
        }
      } else {
        setError(result.error || 'Password reset failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (stage === 'exhausted') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-destructive/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full p-3">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">Verification failed</CardTitle>
          <CardDescription className="text-center">
            You have used all available attempts. Please restart the process.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => {
              setStage('email');
              setVerificationCode('');
              setVerificationId('');
              setError(null);
              setAttemptsRemaining(null);
            }}
          >
            Restart process
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (stage === 'success') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full p-3">
            <Check className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Password reset successful
          </CardTitle>
          <CardDescription className="text-center">
            Your password has been changed successfully
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/auth?mode=login')}>Go to login</Button>
        </CardFooter>
      </Card>
    );
  }

  if (stage === 'verification') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Verify your password reset code
          </CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification code to:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              onClick={handleVerificationComplete}
              disabled={!verificationCode || verificationCode.length !== 6}
              className="mt-4"
            >
              Continue
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
            <button
              onClick={() => {
                setStage('email');
                setVerificationCode('');
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setStage('email')}>
            Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (stage === 'reset') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription className="text-center">Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute left-3 top-2.5 h-5 w-5" />
                        <Input
                          type="password"
                          required
                          minLength={8}
                          className="pl-10"
                          placeholder="••••••••"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute left-3 top-2.5 h-5 w-5" />
                        <Input
                          type="password"
                          required
                          className="pl-10"
                          placeholder="••••••••"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setStage('verification')}>
            Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Forgot your password?</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute left-3 top-2.5 h-5 w-5" />
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-center text-sm">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send verification code'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="mt-6 flex justify-center text-sm">
        <Link href="/auth?mode=login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
