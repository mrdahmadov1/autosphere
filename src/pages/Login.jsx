import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, authError, operationLoading, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setAuthError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled by the auth context
      console.error(error);
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-xl shadow-card p-8">
        <h1 className="text-3xl font-bold text-neutral-dark mb-6 text-center">Daxil Ol</h1>

        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-neutral-dark mb-2">
              E-poçt
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-neutral-dark mb-2">
              Şifrə
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={operationLoading}
            className="btn-primary w-full py-3 rounded-lg mb-4"
          >
            {operationLoading ? 'Daxil olunur...' : 'Daxil Ol'}
          </button>

          <div className="text-center">
            <p className="text-neutral/70">
              Hesabınız yoxdur?{' '}
              <Link to="/register" className="text-primary font-medium">
                Qeydiyyatdan Keçin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
