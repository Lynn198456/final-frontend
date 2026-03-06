import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

function statusClass(status) {
  const value = (status || 'ACTIVE').toUpperCase();
  if (value === 'DELETED') return 'badge badge-danger';
  if (value === 'PENDING') return 'badge badge-warn';
  return 'badge badge-ok';
}

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL, user } = useUser();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  const [book, setBook] = useState({ title: '', author: '', quantity: 0, location: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchBookDetail() {
      try {
        setLoading(true);
        setMessage('');

        const res = await fetch(`${API_URL}/api/book/${id}`, { method: 'GET', credentials: 'include' });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          setMessage(payload.message || 'Cannot load book detail.');
          return;
        }

        const data = await res.json();
        setBook({
          title: data.title || '',
          author: data.author || '',
          quantity: data.quantity || 0,
          location: data.location || '',
          status: data.status || 'ACTIVE',
        });
      } catch {
        setMessage('Cannot load book detail right now.');
      } finally {
        setLoading(false);
      }
    }

    fetchBookDetail();
  }, [id, API_URL]);

  function handleChange(event) {
    setBook((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleUpdate(event) {
    event.preventDefault();
    if (!isAdmin) {
      setMessage('Only ADMIN can update books.');
      return;
    }

    const res = await fetch(`${API_URL}/api/book/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: book.title,
        author: book.author,
        quantity: Number(book.quantity),
        location: book.location,
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setMessage(payload.message || 'Update failed.');
      return;
    }

    setMessage('Book updated successfully.');
    // Re-fetch book detail after successful update
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/book/${id}`, { method: 'GET', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setBook({
            title: data.title || '',
            author: data.author || '',
            quantity: data.quantity || 0,
            location: data.location || '',
            status: data.status || 'ACTIVE',
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }

  async function handleDelete() {
    if (!isAdmin) {
      setMessage('Only ADMIN can delete books.');
      return;
    }

    if (!window.confirm('Delete this book?')) return;

    const res = await fetch(`${API_URL}/api/book/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setMessage(payload.message || 'Delete failed.');
      return;
    }

    navigate('/books');
  }

  return (
    <main className='page-shell'>
      <header className='page-topbar'>
        <div>
          <p className='eyebrow'>Book View</p>
          <h2>Book Detail</h2>
        </div>
        <nav className='nav-pills'>
          <Link to='/books'>Books</Link>
          <Link to='/borrow'>Borrow</Link>
          <Link to='/profile'>Profile</Link>
          <Link to='/logout'>Logout</Link>
        </nav>
      </header>

      {message && <p className='notice'>{message}</p>}

      <section className='card'>
        {loading ? (
          <p className='muted-text'>Loading book detail...</p>
        ) : (
          <form className='stack-form' onSubmit={handleUpdate}>
            <label>Title</label>
            <input name='title' value={book.title} onChange={handleChange} disabled={!isAdmin} />
            <label>Author</label>
            <input name='author' value={book.author} onChange={handleChange} disabled={!isAdmin} />
            <label>Quantity</label>
            <input name='quantity' type='number' min='0' value={book.quantity} onChange={handleChange} disabled={!isAdmin} />
            <label>Location</label>
            <input name='location' value={book.location} onChange={handleChange} disabled={!isAdmin} />
            <label>Status</label>
            <div><span className={statusClass(book.status)}>{book.status || 'ACTIVE'}</span></div>

            <div className='row-actions'>
              {isAdmin && <button type='submit'>Update</button>}
              {isAdmin && (
                <button type='button' onClick={handleDelete} className='danger'>
                  Delete
                </button>
              )}
              {!isAdmin && <Link to={`/borrow?bookName=${encodeURIComponent(book.title || '')}`}>Request Borrow</Link>}
              <Link to='/books'>Back</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
