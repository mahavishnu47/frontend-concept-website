import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useContext(AuthContext);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    if (!user?.is_admin) {
        return <Navigate to="/" />;
    }
    
    return children;
};

export default ProtectedAdminRoute;
