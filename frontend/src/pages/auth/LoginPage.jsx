import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 32px rgba(59,130,246,0.35)',
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.75rem', fontWeight: 800,
            color: '#e8f0ff', letterSpacing: '-0.03em',
            margin: 0,
          }}>UniCyberGuard</h1>
          <p style={{ color: '#4d6080', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Sign in to your security dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10, 18, 36, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,149,255,0.14)',
          borderRadius: 18,
          padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                  type="email"
                  placeholder="you@university.edu"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
              {errors.email && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#4d6080', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.9375rem', justifyContent: 'center' }}>
              {isSubmitting ? 'Signing in…' : (
                <>{`Sign In`} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ fontSize: '0.8125rem', color: '#4d6080' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#60a5fa', fontWeight: 500, textDecoration: 'none' }}>Create account</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontFamily: "'DM Mono', monospace", fontSize: '0.6rem', color: '#1e2d40', letterSpacing: '0.08em' }}>
          SECURED BY UNICYBERGUARD © 2025
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
