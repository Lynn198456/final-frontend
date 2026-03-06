import { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserProvider';
import { Navigate } from 'react-router-dom';

export default function Logout() {
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useUser();

  useEffect(() => {
    (async () => {
      await logout();
      setIsLoading(false);
    })();
  }, [logout]);

  if (isLoading) {
    return (
      <main className='page-shell centered'>
        <section className='card'>
          <h3>Signing out...</h3>
          <p className='muted-text'>Please wait while your session is being closed.</p>
        </section>
      </main>
    );
  }

  return <Navigate to='/login' replace />;
}
