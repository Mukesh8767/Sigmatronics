import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      return <>{children}</>;
    }

    return <>{children}</>;
  } catch {
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
