import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

function statusClass(status) {
  const value = (status || 'INIT').toUpperCase();
  if (value.startsWith('CANCEL') || value === 'CLOSE-NO-AVAILABLE-BOOK') return 'badge badge-danger';
  if (value === 'ACCEPTED') return 'badge badge-ok';
  return 'badge badge-warn';
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

export default function BookBorrow() {
  const { API_URL, user } = useUser();
  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);
  const [searchParams] = useSearchParams();

  const [borrowList, setBorrowList] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    bookName: searchParams.get('bookName') || '',
    targetDate: '',
    note: '',
  });

  useEffect(() => {
    async function fetchBorrowRequests() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/borrow`, { method: 'GET', credentials: 'include' });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          setMessage(payload.message || 'Cannot load borrow requests.');
          setBorrowList([]);
          return;
        }

        const data = await res.json();
        setBorrowList(Array.isArray(data) ? data : []);
      } catch {
        setMessage('Cannot load borrow requests.');
        setBorrowList([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBorrowRequests();
  }, [API_URL]);

  async function onCreateRequest(event) {
    event.preventDefault();

    if (!form.bookName || !form.targetDate) {
      setMessage('Book name and target date are required.');
      return;
    }

    const res = await fetch(`${API_URL}/api/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bookName: form.bookName,
        targetDate: form.targetDate,
        note: form.note,
      }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setMessage(payload.message || 'Create request failed.');
      return;
    }

    setMessage('');
    setForm({ bookName: '', targetDate: '', note: '' });
    
    // Refetch borrow requests after successful creation
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/borrow`, { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBorrowList(Array.isArray(data) ? data : []);
      }
    } catch {
      setMessage('Cannot load borrow requests.');
    } finally {
      setLoading(false);
    }
  }

  async function updateRequestStatus(requestId, requestStatus) {
    const res = await fetch(`${API_URL}/api/borrow/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ requestStatus }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setMessage(payload.message || 'Update request status failed.');
      return;
    }

    setMessage('');
    
    // Refetch borrow requests after status update
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/borrow`, { method: 'GET', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setBorrowList(Array.isArray(data) ? data : []);
      }
    } catch {
      setMessage('Cannot load borrow requests.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='page-shell'>
      <header className='page-topbar'>
        <div>
          <p className='eyebrow'>Borrow Center</p>
          <h2>Borrow Requests</h2>
        </div>
        <nav className='nav-pills'>
          <Link to='/books'>Books</Link>
          <Link to='/profile'>Profile</Link>
          <Link to='/logout'>Logout</Link>
        </nav>
      </header>

      {message && <p className='notice'>{message}</p>}

      {!isAdmin && (
        <section className='card'>
          <h3>Create Request</h3>
          <form className='inline-form' onSubmit={onCreateRequest}>
            <input
              type='text'
              placeholder='Book Name'
              value={form.bookName}
              onChange={(event) => setForm((prev) => ({ ...prev, bookName: event.target.value }))}
            />
            <input
              type='date'
              value={form.targetDate}
              onChange={(event) => setForm((prev) => ({ ...prev, targetDate: event.target.value }))}
            />
            <input
              type='text'
              placeholder='Note'
              value={form.note}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            />
            <button type='submit'>Submit</button>
          </form>
        </section>
      )}

      <section className='card'>
        <h3>{isAdmin ? 'All Requests' : 'My Requests'}</h3>
        {loading ? (
          <p className='muted-text'>Loading requests...</p>
        ) : borrowList.length === 0 ? (
          <p className='muted-text'>No requests found.</p>
        ) : (
          <div className='table-wrap'>
            <table className='table'>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Book Name</th>
                  <th>Created At</th>
                  <th>Target Date</th>
                  <th>Request Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {borrowList.map((entry) => {
                  const currentStatus = entry.requestStatus || 'INIT';
                  const isInit = currentStatus === 'INIT';

                  return (
                    <tr key={entry._id || `${entry.bookName}-${entry.username}`}>
                      <td>{entry.username || '-'}</td>
                      <td>{entry.bookName || '-'}</td>
                      <td>{formatDate(entry.createdAt)}</td>
                      <td>{formatDate(entry.targetDate)}</td>
                      <td><span className={statusClass(currentStatus)}>{currentStatus}</span></td>
                      <td>{entry.note || '-'}</td>
                      <td>
                        <div className='row-actions'>
                          {!isAdmin && isInit && (
                            <button type='button' className='secondary' onClick={() => updateRequestStatus(entry._id, 'CANCEL-USER')}>
                              Cancel
                            </button>
                          )}
                          {isAdmin && isInit && (
                            <>
                              <button type='button' onClick={() => updateRequestStatus(entry._id, 'ACCEPTED')}>Accept</button>
                              <button type='button' className='danger' onClick={() => updateRequestStatus(entry._id, 'CANCEL-ADMIN')}>
                                Cancel
                              </button>
                              <button type='button' className='secondary' onClick={() => updateRequestStatus(entry._id, 'CLOSE-NO-AVAILABLE-BOOK')}>
                                No Book
                              </button>
                            </>
                          )}
                          {isAdmin && !isInit && (
                            <>
                              <button type='button' disabled>Accept</button>
                              <button type='button' className='danger' disabled>Cancel</button>
                              <button type='button' className='secondary' disabled>No Book</button>
                            </>
                          )}
                          {!isAdmin && !isInit && <span className='badge badge-neutral'>Closed</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
