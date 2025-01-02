import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

// eslint-disable-next-line react/prop-types
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Retrieve the user from localStorage on initialization
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });


  const updateUser = (newUser) => {
    console.log('Updating User in Context:', newUser);
    setUser(newUser);
    // Persist user to localStorage
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  useEffect(() => {
    // Sync context with localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && JSON.stringify(user) !== storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
