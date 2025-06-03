import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/dashboard';
import GroupList from '../pages/admin/groups';
import OperatorList from '../pages/admin/operators';
import ProxyList from '../pages/admin/proxies';
import AdminTikTokAccounts from '../pages/admin/accounts/index';
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
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="groups" element={<GroupList />} />
          <Route path="operators" element={<OperatorList />} />
          <Route path="proxies" element={<ProxyList />} />
          <Route path="accounts" element={<AdminTikTokAccounts />} />
        </Route>
        <Route path="operator">
          <Route index element={<Navigate to="/operator/dashboard" replace />} />
          <Route path="dashboard" element={<OperatorDashboard />} />
          <Route path="accounts" element={<TikTokAccounts />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default Router; 