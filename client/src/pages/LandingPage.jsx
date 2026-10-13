/**
 * Landing Page
 * 
 * The public face of BugBuddy. Communicates the product value proposition:
 * BugBuddy helps you LEARN to debug, not just fix your code.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Bug, Lightbulb, TrendingUp, Brain, Code2, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import BugBuddyLogo from '../components/BugBuddyLogo';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const FEATURES = [
  {
    icon: Bug,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    title: 'Error Detection',
    desc: 'BugBuddy reads your actual compiler output and identifies what went wrong — based on evidence, not guesses.',
  },
  {
    icon: Lightbulb,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    title: 'Progressive Hints',
    desc: "Instead of giving you the answer, BugBuddy gives you a small nudge first. You do the thinking — we guide you.",
  },
  {
    icon: Brain,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Adaptive Learning',
    desc: 'BugBuddy remembers your recurring mistakes and personalizes future guidance based on your actual patterns.',
  },
  {
    icon: TrendingUp,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'Skill Tracking',
    desc: 'Watch your skills grow over time. See exactly where you improve and what still needs work — with real data.',
  },
];

const STEPS = [
  { num: '01', label: 'Write your code in the workspace' },
  { num: '02', label: 'Submit and BugBuddy finds the error' },
  { num: '03', label: 'Get a small hint — think first' },
  { num: '04', label: 'Try again — BugBuddy adjusts the guidance' },
  { num: '05', label: 'Over time, you debug independently' },
];

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15,15,17,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BugBuddyLogo size={28} showWordmark={true} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '0.4rem' }}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '6rem 1.5rem 5rem',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '999px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              color: '#4ade80',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            <Bug size={12} />
            AI-Powered Debugging Mentor
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '1.25rem',
          }}
        >
          Where Every Bug
          <br />
          <span className="text-gradient">Becomes a Lesson.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          BugBuddy analyzes your real coding mistakes and teaches you to debug independently —
          with progressive hints, not instant answers.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link to="/register" className="btn-primary" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}>
            Start Debugging for Free
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}>
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* BugBuddy Hint Example */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              workspace.py
            </span>
          </div>

          {/* Code */}
          <div style={{ padding: '1.25rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            <div style={{ color: '#71717a' }}>1  </div>
            <div>
              <span style={{ color: '#c084fc' }}>for </span>
              <span style={{ color: '#fafafa' }}>i </span>
              <span style={{ color: '#c084fc' }}>in </span>
              <span style={{ color: '#60a5fa' }}>range</span>
              <span style={{ color: '#fafafa' }}>(</span>
              <span style={{ color: '#60a5fa' }}>len</span>
              <span style={{ color: '#fafafa' }}>(arr)):</span>
            </div>
            <div>
              <span style={{ color: '#fafafa' }}>    </span>
              <span style={{ color: '#60a5fa' }}>print</span>
              <span style={{ color: '#fafafa' }}>(arr[i </span>
              <span style={{ color: '#f87171' }}>+ 1</span>
              <span style={{ color: '#fafafa' }}>])</span>
              <span
                style={{
                  marginLeft: '0.75rem',
                  fontSize: '0.7rem',
                  background: 'rgba(239,68,68,0.12)',
                  color: '#f87171',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                ⚠ index error
              </span>
            </div>
          </div>

          {/* BugBuddy hint bubble */}
          <div
            style={{
              margin: '0 1.25rem 1.25rem',
              padding: '1rem 1.25rem',
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <img src="/bugbuddy-mascot.png" alt="BugBuddy" style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#4ade80' }}>BugBuddy</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  background: 'rgba(34,197,94,0.1)',
                  color: '#4ade80',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}
              >
                Hint Level 1
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              I noticed something near the <em>last iteration</em> of your loop. 🤔
              <br />
              What happens to <code style={{ background: 'var(--bg-tertiary)', padding: '0 4px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}>i</code> when it reaches the final valid index?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}>
                Give me another hint
              </button>
              <button className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                Explain the error
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}
          >
            Built to make you a better debugger
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
            Every feature is designed around one goal: teaching you to debug independently.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card"
              style={{ padding: '1.5rem' }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: f.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <f.icon size={18} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
          padding: '4rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: '2.5rem',
              textAlign: 'center',
            }}
          >
            How BugBuddy works
          </motion.h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#22c55e',
                    minWidth: '28px',
                  }}
                >
                  {step.num}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{step.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '600px', margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: '1rem',
            }}
          >
            Ready to debug smarter?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join BugBuddy and start building real debugging skills — through your actual mistakes.
          </p>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Get Started — It's Free
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
        }}
      >
        © {new Date().getFullYear()} BugBuddy — Where Every Bug Becomes a Lesson.
      </footer>
    </div>
  );
}
