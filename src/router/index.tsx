import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminIndex from '../pages/admin';
import AdminDashboard from '../pages/admin/dashboard';
import GroupList from '../pages/admin/groups';
import OperatorList from '../pages/admin/operators';
import ProxyList from '../pages/admin/proxies';
import OperatorIndex from '../pages/operator';
import OperatorDashboard from '../pages/operator/dashboard';
import TikTokAccounts from '../pages/operator/accounts';
import PrivateRoute from '../components/PrivateRoute';

const Router: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin">
          <Route index element={<AdminIndex />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="groups" element={<GroupList />} />
          <Route path="operators" element={<OperatorList />} />
          <Route path="proxies" element={<ProxyList />} />
        </Route>
        <Route path="operator">
          <Route index element={<OperatorIndex />} />
          <Route path="dashboard" element={<OperatorDashboard />} />
          <Route path="accounts" element={<TikTokAccounts />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Router; 