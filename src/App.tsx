import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Box, CircularProgress } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import RecordingListPage from './pages/RecordingListPage';
import AuditPage from './pages/AuditPage';
import { api } from './services/api';
import { appUrl, getAccessContext } from './auth/accessContext';
import { PermissionsProvider } from './hooks/usePermissions';

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const callbackParams = window.location.hash.startsWith('#/auth/callback?')
      ? new URLSearchParams(window.location.hash.split('?')[1])
      : null;
    const callbackToken = callbackParams?.get('token');
    const callbackError = callbackParams?.get('error');

    if (callbackToken) {
      localStorage.setItem('token', callbackToken);
      const context = getAccessContext();
      window.history.replaceState(null, '', `/video/${context ? `?group=${context}` : ''}`);
    } else if (callbackError) {
      setAuthError(callbackError);
      setAuthenticated(false);
      return;
    }

    if (!getAccessContext()) {
      setAuthError('Contexto de acesso não informado.');
      setAuthenticated(false);
      return;
    }

    api.get('/auth/session')
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem('token');
        window.location.replace(appUrl('audio'));
      });
  }, []);

  if (authenticated) return <PermissionsProvider>{children}</PermissionsProvider>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      {authError ? <Alert severity="error">{authError}</Alert> : <CircularProgress aria-label="Autenticando" />}
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthenticatedShell><RecordingListPage /></AuthenticatedShell>} />
      <Route path="/audit" element={<AuthenticatedShell><AuditPage /></AuthenticatedShell>} />
      <Route path="/auth/callback" element={<AuthenticatedShell><RecordingListPage /></AuthenticatedShell>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
