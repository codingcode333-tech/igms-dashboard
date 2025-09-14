// src/components/PrivateRoute.js

import React from 'react';
import { Navigate, Route } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
  // Check if the user is authenticated (you can modify this logic)
  const isAuthenticated = !!window.sessionStorage.getItem('User');

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Navigate to="/sign-in" />
        )
      }
    />
  );
};

export default PrivateRoute;
