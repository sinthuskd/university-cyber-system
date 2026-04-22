import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Shield, Mail, Lock, User, Camera, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const [profilePreview, setProfilePreview] = React.useState(null);
  const [profileData, setProfileData] = React.useState(null);
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        name: data.name, email: data.email,
        password: data.password, role: data.role || 'USER',
        profileImageData: profileData,
      });
      try {
        const user = await login(data.email, data.password);
        toast.success('Account created!');
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      } catch {
        toast.success('Registered! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
            fontSize: '1.625rem', fontWeight: 800,
            color: '#e8f0ff', letterSpacing: '-0.03em', margin: 0,
          }}>Create Account</h1>
          <p style={{ color: '#4d6080', fontSize: '0.875rem', marginTop: '0.375rem' }}>Join UniCyberGuard platform</p>
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
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {/* Profile photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1e3a5f, #2d1b69)',
                  border: '2px solid rgba(99,149,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {profilePreview
                    ? <img src={profilePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={24} color="#4d6080" />}
                </div>
                <label style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid var(--bg-void)',
                }}>
                  <Camera size={11} color="#fff" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => { setProfilePreview(reader.result); setProfileData(reader.result); };
                    reader.readAsDataURL(f);
                  }} style={{ display: 'none' }} />
                </label>
              </div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#e8f0ff' }}>Profile Photo</p>
                <p style={{ fontSize: '0.75rem', color: '#4d6080', marginTop: 2 }}>Optional — click camera to upload</p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input {...register('name', { required: 'Name is required' })} type="text" placeholder="Your full name" className="form-input" style={{ paddingLeft: '2.25rem' }} />
              </div>
              {errors.name && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} type="email" placeholder="you@university.edu" className="form-input" style={{ paddingLeft: '2.25rem' }} />
              </div>
              {errors.email && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="form-label">Role</label>
              <select {...register('role')} className="form-input">
                <option value="USER">Student / Staff</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type="password" placeholder="Min 6 characters" className="form-input" style={{ paddingLeft: '2.25rem' }} />
              </div>
              {errors.password && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4d6080', pointerEvents: 'none' }} />
                <input {...register('confirmPassword', { required: 'Please confirm password', validate: val => val === watch('password') || 'Passwords do not match' })} type="password" placeholder="Repeat password" className="form-input" style={{ paddingLeft: '2.25rem' }} />
              </div>
              {errors.confirmPassword && <p style={{ color: '#fca5a5', fontSize: '0.75rem', marginTop: 4 }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '0.25rem', padding: '0.75rem', fontSize: '0.9375rem', justifyContent: 'center' }}>
              {isSubmitting ? 'Creating account…' : <>{`Create Account`} <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <p style={{ fontSize: '0.8125rem', color: '#4d6080' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#60a5fa', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
