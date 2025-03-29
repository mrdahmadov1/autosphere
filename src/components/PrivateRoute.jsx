import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
