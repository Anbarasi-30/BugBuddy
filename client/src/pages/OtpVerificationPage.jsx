/**
 * OtpVerificationPage.jsx
 * 
 * 6-Digit OTP Email Verification Page with countdown timer,
 * rate-limited resend option, and seamless login transition.
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OtpVerificationPage() {
  const { verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email passed via state or URL query
  const searchParams = new URLSearchParams(location.search);
  const emailParam = location.state?.email || searchParams.get('email') || '';

  const [email] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Cooldown timer for OTP Resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    // Auto focus next box
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && inputRefs[index - 1].current) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      if (inputRefs[5].current) inputRefs[5].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    if (!email) {
      setError('Email address missing. Please register again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await verifyOtp(email, otpCode);
      setSuccessMsg('Email verified successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please check your code and try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!email) {
      setError('Email address missing.');
      return;
    }

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOtp(email);
      setSuccessMsg(res.message || 'A new OTP has been sent to your email.');
      setResendCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      if (inputRefs[0].current) inputRefs[0].current.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend OTP code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(56,189,248,0.2))',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Verify Your Email
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
            We've sent a 6-digit verification code to
            <br />
            <strong style={{ color: 'var(--text-primary)' }}>{email || 'your email'}</strong>
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          }}
        >
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#f87171',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#4ade80',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div
              onPaste={handlePaste}
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: '46px',
                    height: '56px',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    textAlign: 'center',
                    background: 'var(--bg-secondary)',
                    border: digit ? '2px solid #6366f1' : '1px solid var(--border-default)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              id="otp-verify-submit-btn"
              disabled={loading || otpDigits.join('').length < 6}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.875rem',
                fontSize: '0.9375rem',
                opacity: loading || otpDigits.join('').length < 6 ? 0.6 : 1,
              }}
            >
              {loading ? 'Verifying Code...' : 'Verify Email'}
            </button>
          </form>

          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Didn't receive the code?</span>
            <button
              type="button"
              id="resend-otp-btn"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resending}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--text-muted)' : '#38bdf8',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <RefreshCw size={13} className={resending ? 'spin' : ''} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/login"
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
