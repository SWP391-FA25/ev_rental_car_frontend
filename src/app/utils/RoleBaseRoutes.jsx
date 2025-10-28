import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const RoleBaseRoutes = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' />;
  }

  if (!allowedRoles?.includes(user.role)) {
    return <Navigate to='/login' />;
  }

  return children;
};

export default RoleBaseRoutes;
