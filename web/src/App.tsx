import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import AttackMap from './features/attackMap/AttackMap';
import Paths from './features/paths/Paths';
import Findings from './features/findings/Findings';
import RemediationConsole from './features/remediation/RemediationConsole';
import LiveWatch from './features/liveWatch/LiveWatch';
import URLTrust from './features/urltrust/URLTrust';
import Report from './features/report/Report';
import SettingsPage from './features/settings/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: '#00e676', padding: '2rem' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="attack-map" element={<AttackMap />} />
        <Route path="paths" element={<Paths />} />
        <Route path="findings" element={<Findings />} />
        <Route path="remediation/:findingId?" element={<RemediationConsole />} />
        <Route path="live-watch" element={<LiveWatch />} />
        <Route path="url-analyzer" element={<URLTrust />} />
        <Route path="report" element={<Report />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
