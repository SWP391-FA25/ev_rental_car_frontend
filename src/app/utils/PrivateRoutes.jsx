import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const PrivateRoutes = ({ children }) => {
  const { user, loading, verifyUser } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);

  // Re-verify token when location changes (navigation events)
  useEffect(() => {
    const handleNavigation = async () => {
      if (!loading && !user) {
        setIsVerifying(true);
        try {
          await verifyUser();
        } catch (error) {
          console.error('Error re-verifying token:', error);
        } finally {
          setIsVerifying(false);
        }
      }
    };

    // Small delay to ensure auth context has updated
    const timeoutId = setTimeout(handleNavigation, 100);
    return () => clearTimeout(timeoutId);
  }, [location.pathname, loading, user, verifyUser]);

  if (loading || isVerifying) {
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
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return <Navigate to='/login' />;
  }

  // Allow access but show verification reminder for unverified users
  return children;
};

export default PrivateRoutes;
