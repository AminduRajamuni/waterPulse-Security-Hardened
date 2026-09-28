import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      // Small delay to allow state to update
      setTimeout(() => {
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (result.user.role === 'authority') {
          navigate('/authority-dashboard');
        } else {
          navigate('/home');
        }
      }, 100);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Full page redirect (not an axios call) so the browser actually navigates
    // to Google's consent screen and back through our backend callback.
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2a4a] to-[#0d3d6b]" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#2d8bba]/25 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-cyan-300/15 blur-3xl" />

      <div className="relative h-full max-w-6xl mx-auto flex flex-col lg:flex-row">
        {/* Left hero */}
        <aside className="lg:w-5/12 p-10 flex flex-col justify-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 mb-5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-xs font-semibold tracking-widest uppercase text-white/70">WaterPulse</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black leading-tight">
            Sign in.
            <br />
            <span className="text-[#67e8f9]">Stay ahead</span> of water issues.
          </h1>

          <p className="mt-4 text-white/70 max-w-md">
            Log in to report incidents, track your zone, and help authorities respond faster.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2s7 7 7 12a7 7 0 1 1-14 0c0-5 7-12 7-12Z" stroke="rgba(103,232,249,0.95)" strokeWidth="1.8" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Submit incidents quickly</div>
                <div className="text-sm text-white/65">Describe what you see and tag it to your area.</div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l8 4v6c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V6l8-4Z" stroke="rgba(103,232,249,0.95)" strokeWidth="1.8" />
                  <path d="M9 12l2 2 4-5" stroke="rgba(103,232,249,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Secure sessions</div>
                <div className="text-sm text-white/65">Your dashboard stays protected with authentication.</div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="mt-0.5 w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-4.4 7-11a7 7 0 1 0-14 0c0 6.6 7 11 7 11Z" stroke="rgba(103,232,249,0.95)" strokeWidth="1.8" />
                  <path d="M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="rgba(103,232,249,0.95)" strokeWidth="1.8" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-white">Zone awareness</div>
                <div className="text-sm text-white/65">See updates that matter to your community.</div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-sm text-white/60">
            Tip: You can use demo accounts below if you want to try the app instantly.
          </div>
        </aside>

        {/* Right form */}
        <main className="flex-1 p-6 sm:p-10 flex items-center justify-center">
          <div className="w-full bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10">
            <div className="mb-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-3xl font-black text-[#0a1628]">Login</h2>
                  <p className="mt-1 text-sm text-[#0e2233]/70">Access your dashboard and reports.</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#deedf7] border border-[#b2cfe8] text-[#164871] font-semibold text-xs">
                  Secure sign-in
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 mb-5 border border-red-200 rounded-xl bg-red-50">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0e2233]/80">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 transition border border-[#cddae6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d8bba] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#0e2233]/80">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 transition border border-[#cddae6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d8bba] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 font-semibold text-white transition bg-[#2d8bba] rounded-xl hover:bg-[#3aa2cf] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#cddae6]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0e2233]/50">or</span>
                <div className="h-px flex-1 bg-[#cddae6]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 font-semibold text-[#0e2233] transition bg-white border border-[#cddae6] rounded-xl hover:bg-[#eef3f8]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.49 12.27c0-.85-.08-1.67-.22-2.46H12v4.66h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.58-5.17 3.58-8.85z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12C3.25 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78l4-3.12z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.61l4 3.12C6.22 6.86 8.87 4.75 12 4.75z" />
                </svg>
                Sign in with Google
              </button>

              <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm text-[#0e2233]/70">
                  {user?.name ? `Welcome back, ${user.name}.` : 'New here?'}
                </div>
                <Link to="/register" className="text-sm font-semibold text-[#2d8bba] hover:underline">
                  Create an account →
                </Link>
              </div>
            </form>

            <div className="mt-8 p-5 rounded-2xl bg-[#eef3f8] border border-[#cddae6]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#deedf7] border border-[#b2cfe8] flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2l8 4v6c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V6l8-4Z" stroke="#164871" strokeWidth="1.8" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase text-[#164871]">Demo credentials</div>
                  <div className="text-sm text-[#0e2233]/65">Use these to log in right away.</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[#164871]">Citizen</span>
                  <span className="text-[#0e2233]/70">citizen@test.com / password123</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[#164871]">Authority</span>
                  <span className="text-[#0e2233]/70">authority@test.com / password123</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-[#164871]">Admin</span>
                  <span className="text-[#0e2233]/70">admin@test.com / password123</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
