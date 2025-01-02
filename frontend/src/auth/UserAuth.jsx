import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

// eslint-disable-next-line react/prop-types
const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token || !user) {
      // Redirect to login if no token or user is found
      navigate('/login');
    } else {
      // Set loading to false once the user is validated
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;
