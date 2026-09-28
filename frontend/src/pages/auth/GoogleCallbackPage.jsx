import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { loginWithGoogleCode } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(oauthError);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setError('Missing sign-in code from Google.');
      return;
    }

    (async () => {
      try {
        const result = await loginWithGoogleCode(code);

        // Same role-based redirect used by LoginPage after a normal login.
        if (result.user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (result.user.role === 'authority') {
          navigate('/authority-dashboard', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    })();
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2a4a] to-[#0d3d6b]" />

      <div className="relative w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
        {error ? (
          <>
            <h2 className="text-xl font-black text-[#0a1628] mb-2">Sign-in failed</h2>
            <p className="text-sm text-red-700 mb-6">{error}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 font-semibold text-white transition bg-[#2d8bba] rounded-xl hover:bg-[#3aa2cf]"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-black text-[#0a1628] mb-2">Signing you in…</h2>
            <p className="text-sm text-[#0e2233]/70">Completing your Google sign-in.</p>
          </>
        )}
      </div>
    </div>
  );
};
