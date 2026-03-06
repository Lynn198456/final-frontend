import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

function statusClass(status) {
  const value = (status || 'ACTIVE').toUpperCase();
  if (value === 'DELETED') return 'badge badge-danger';
  if (value === 'PENDING') return 'badge badge-warn';
  return 'badge badge-ok';
}

export default function Books() {
  const { user, API_URL } = useUser();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ title: '', author: '' });
  const [form, setForm] = useState({ title: '', author: '', quantity: 1, location: '' });

  async function fetchBooks(currentFilters = filters) {
    try {
      setLoading(true);
      setMessage('');

      const params = new URLSearchParams();
      if (currentFilters.title.trim()) params.set('title', currentFilters.title.trim());
      if (currentFilters.author.trim()) params.set('author', currentFilters.author.trim());

      const queryString = params.toString();
      const url = queryString ? `${API_URL}/api/book?${queryString}` : `${API_URL}/api/book`;
      const res = await fetch(url, { method: 'GET', credentials: 'include' });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setMessage(payload.message || 'Cannot load books right now.');
        setBooks([]);
        return;
      }

      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage('Cannot load books. Please check backend API status.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  function onSearch(event) {
    event.preventDefault();
    fetchBooks(filters);
  }

  function onResetFilters() {
    const reset = { title: '', author: '' };
    setFilters(reset);
    fetchBooks(reset);
  }

  async function onCreateBook(event) {
    event.preventDefault();
    if (!isAdmin) {
      setMessage('Only ADMIN can create books.');
      return;
    }

    try {
      setMessage('');
      const res = await fetch(`${API_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          quantity: Number(form.quantity),
          location: form.location,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setMessage(payload.message || 'Create book failed.');
        return;
      }

      setForm({ title: '', author: '', quantity: 1, location: '' });
      setMessage('Book created successfully.');
      fetchBooks();
    } catch (error) {
      setMessage('Create book failed.');
    }
  }

  return (
    <main className='page-shell'>
      <header className='page-topbar'>
        <div>
          <p className='eyebrow'>Book</p>
          <h2>Book</h2>
        </div>
        <nav className='nav-pills'>
          <Link to='/borrow'>Borrow</Link>
          <Link to='/profile'>Profile</Link>
          <Link to='/logout'>Logout</Link>
        </nav>
      </header>

      {message && <p className='notice'>{message}</p>}

      <section className='card'>
        <h3>Find Books</h3>
        <form className='inline-form' onSubmit={onSearch}>
          <input
            type='text'
            placeholder='Search by title'
            value={filters.title}
            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            type='text'
            placeholder='Search by author'
            value={filters.author}
            onChange={(e) => setFilters((prev) => ({ ...prev, author: e.target.value }))}
          />
          <button type='submit'>Search</button>
          <button className='secondary' type='button' onClick={onResetFilters}>Clear</button>
        </form>
      </section>

      <section className='card'>
        <h3>Book List</h3>
        {loading ? (
          <p className='muted-text'>Loading books...</p>
        ) : books.length === 0 ? (
          <p className='muted-text'>No books found for current filters.</p>
        ) : (
          <div className='table-wrap'>
            <table className='table'>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Qty</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id || `${book.title}-${book.author}`}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.quantity ?? '-'}</td>
                    <td>{book.location || '-'}</td>
                    <td><span className={statusClass(book.status)}>{book.status || 'ACTIVE'}</span></td>
                    <td>
                      <Link to={`/books/${book._id}`}>Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isAdmin && (
        <section className='card'>
          <h3>Add New Book</h3>
          <form className='inline-form' onSubmit={onCreateBook}>
            <input
              type='text'
              placeholder='Title'
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              type='text'
              placeholder='Author'
              value={form.author}
              onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
              required
            />
            <input
              type='number'
              min='0'
              placeholder='Quantity'
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
            <input
              type='text'
              placeholder='Location'
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              required
            />
            <button type='submit'>Create Book</button>
          </form>
        </section>
      )}
    </main>
  );
}
