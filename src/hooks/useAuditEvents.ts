import { useCallback, useState } from 'react';
import type { AuditEventsQuery, AuditEventsResponse } from '../audit/contract';
import { mockAuditEvents } from '../audit/mock';
import { api } from '../services/api';

export default function useAuditEvents() {
  const [data, setData] = useState<AuditEventsResponse>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mocked, setMocked] = useState(false);

  const fetchEvents = useCallback(async (query: AuditEventsQuery) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/audit/events', { params: query });
      const payload = (response.data || {}) as AuditEventsResponse;
      setData({
        items: payload.items || [],
        total: Number(payload.total || 0),
        page: Number(payload.page || query.page || 1),
        pageSize: Number(payload.pageSize || query.pageSize || 20),
      });
      setMocked(false);
    } catch {
      setData(mockAuditEvents(query));
      setMocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, mocked, fetchEvents };
}
