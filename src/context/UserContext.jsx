import { clearCache } from "@/helpers/cache";
import { getUserData, loginUser } from "@/services/auth";
import React, { createContext, useEffect, useState, useContext } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem("User") ?? 'null');

  useEffect(() => {
    localStorage.setItem("User", user);

  }, [user]);

  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  );
};

export function useFilter() {
    return useContext(UserContext);
  }

export function getUser() {
  let userString = window.sessionStorage.getItem('User')

  // if( userString == null || userString == 'null' )
  //   logout()

  return userString ? JSON.parse(userString) : null
}

export function setUser(userData = null, relaod = true) {
  if( !userData )
    window.sessionStorage.clear()
  else
    window.sessionStorage.setItem('User', JSON.stringify(userData))

  if( relaod )
    window.location.reload()
}

export function logout() {
  // httpService.auth.post('/logout')
  //   .finally( () => setUser(null) )
  clearCache()
  setUser(null)
}

export function login(username, password) {
  // Demo credentials: admin/admin
  if (username === 'admin' && password === 'admin') {
    return new Promise((resolve) => {
      // Create a demo user object
      const demoUser = {
        accessToken: 'demo-access-token',
        username: 'admin',
        name: 'Demo Admin',
        role: 'administrator',
        email: 'admin@demo.com',
        department: 'All Ministries',
        permissions: ['all']
      };
      
      setUser(demoUser);
      resolve({ data: demoUser });
    });
  } else {
    // For any other credentials, reject with error
    return Promise.reject(new Error('Invalid credentials! Use admin/admin for demo.'));
  }
  
  // Original API call (commented out for demo mode)
  /*
  return loginUser(username, password)
    .then( response => {
      setUser(
        {
          accessToken: response.data.access_token
        },
        false
      )

      getUserData()
        .then( response => setUser(
          {
            ...getUser(),
            ...response.data
          }
        ))
    })
  */
}