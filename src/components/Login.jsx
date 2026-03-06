import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';
import './Login.css';

export default function Login() {
  const { user, login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    const result = await login(email.trim(), password);

    if (!result.ok) {
      setError(result.message || 'Login failed.');
    }

    setIsLoggingIn(false);
  }

  if (user?.isLoggedIn) {
    return <Navigate to='/books' replace />;
  }

  return (
    <main className='login-page'>
      <section className='login-card'>
        <p className='login-badge'>Library Portal</p>
        <h1>Welcome back</h1>

        <form className='login-form' onSubmit={onSubmit}>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder='you@example.com'
            autoComplete='email'
          />

          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder='Enter your password'
            autoComplete='current-password'
          />

          <button type='submit' disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>

          {error && <p className='login-error'>{error}</p>}
        </form>
      </section>
    </main>
  );
}
