import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Books from './components/Books';
import { BookDetail } from './components/BookDetail';
import BookBorrow from './components/BookBorrow';
import RequireAuth from './middleware/RequireAuth';
import Profile from './components/Profile';
import Login from './components/Login';
import Logout from './components/Logout';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Navigate to='/books' replace />} />
      <Route path='/login' element={<Login />} />
      <Route
        path='/books'
        element={
          <RequireAuth>
            <Books />
          </RequireAuth>
        }
      />
      <Route
        path='/books/:id'
        element={
          <RequireAuth>
            <BookDetail />
          </RequireAuth>
        }
      />
      <Route
        path='/borrow'
        element={
          <RequireAuth>
            <BookBorrow />
          </RequireAuth>
        }
      />
      <Route
        path='/profile'
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path='/logout'
        element={
          <RequireAuth>
            <Logout />
          </RequireAuth>
        }
      />
      <Route path='*' element={<Navigate to='/books' replace />} />
    </Routes>
  );
}

export default App;
