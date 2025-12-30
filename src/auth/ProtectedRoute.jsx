import React from 'react';

// Bypass authentication gating so the app is accessible without login.
const ProtectedRoute = ({ children }) => {
  return children;
};

export default ProtectedRoute;
