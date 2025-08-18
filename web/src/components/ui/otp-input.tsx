'use client';

import React, { ClipboardEvent,KeyboardEvent, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, onComplete, className }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(0, 1);
    setOtp(newOtp);

    // If value is not empty, move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all inputs are filled, call onComplete
    const otpValue = newOtp.join('');
    if (otpValue.length === length && !newOtp.includes('')) {
      onComplete(otpValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      // Move to next input on right arrow
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (!/^\d*$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < Math.min(length, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Set focus to the next empty input or the last one
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();

    // If all inputs are filled, call onComplete
    const otpValue = newOtp.join('');
    if (otpValue.length === length && !newOtp.includes('')) {
      onComplete(otpValue);
    }
  };

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={otp[index]}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="h-12 w-10 text-center text-lg"
        />
      ))}
    </div>
  );
}
