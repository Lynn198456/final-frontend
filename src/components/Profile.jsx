import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

function initials(name, email) {
  const source = (name || email || '').trim();
  if (!source) return 'U';
  const chunks = source.split(/\s+|@|\./).filter(Boolean);
  if (chunks.length === 1) return chunks[0].slice(0, 1).toUpperCase();
  return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase();
}

function formatRole(role) {
  const normalized = (role || 'USER').toUpperCase();
  return normalized === 'ADMIN' ? 'Administrator' : 'User';
}

export default function Profile() {
  const { user } = useUser();
  const displayName = user?.name || `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'User';

  return (
    <main className='page-shell'>
      <header className='page-topbar'>
        <div>
          <p className='eyebrow'>Account</p>
          <h2>Profile</h2>
        </div>
        <nav className='nav-pills'>
          <Link to='/books'>Books</Link>
          <Link to='/borrow'>Borrow</Link>
          <Link to='/logout'>Logout</Link>
        </nav>
      </header>

      <section className='card profile-hero'>
        <div className='profile-avatar'>{initials(displayName, user?.email)}</div>
        <div className='profile-hero-content'>
          <h3>{displayName}</h3>
          <p className='muted-text'>This is your account overview. Review your details and jump to common actions.</p>
          <div className='row-actions'>
            <span className='badge badge-neutral'>{formatRole(user?.role)}</span>
            <Link to='/books'>Browse Books</Link>
            <Link to='/borrow'>Manage Borrow Requests</Link>
          </div>
        </div>
      </section>

      <section className='card'>
        <div className='section-title-row'>
          <h3>Personal Information</h3>
          <span className='helper-text'>Read-only profile data</span>
        </div>

        <div className='profile-grid'>
          <div className='info-tile'>
            <p className='label'>Username</p>
            <p>{user?.name || '-'}</p>
          </div>
          <div className='info-tile'>
            <p className='label'>Email Address</p>
            <p>{user?.email || '-'}</p>
          </div>
          <div className='info-tile'>
            <p className='label'>Role</p>
            <p>{formatRole(user?.role)}</p>
          </div>
          <div className='info-tile'>
            <p className='label'>First Name</p>
            <p>{user?.firstname || '-'}</p>
          </div>
          <div className='info-tile'>
            <p className='label'>Last Name</p>
            <p>{user?.lastname || '-'}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
