import axios from 'axios';
import { useCallback, useState } from 'react';
import { normalizeAuditEvent, type AuditEventsQuery, type AuditEventsResponse } from '../audit/contract';
import { api } from '../services/api';
import { toQueryEnd, toQueryStart } from '../utils/dateInput';

export default function useAuditEvents() {
  const [data, setData] = useState<AuditEventsResponse>({ items: [], total: 0, page: 1, limit: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async (query: AuditEventsQuery) => {
    setLoading(true);
    setError('');
    const payload: AuditEventsQuery = {
      page: 1,
      limit: 50,
      ...query,
      start: toQueryStart(query.start),
      end: toQueryEnd(query.end),
    };
    try {
      const response = await api.get('/audit/events', { params: payload });
      const body = response.data || {};
      setData({
        items: (body.items || []).map((item: Record<string, unknown>) => normalizeAuditEvent(item)),
        total: Number(body.total || 0),
        page: Number(body.page || payload.page || 1),
        limit: Number(body.limit || payload.limit || 50),
      });
    } catch (caught) {
      if (axios.isAxiosError(caught) && caught.response?.status === 403) {
        setError('Você não tem permissão para consultar a auditoria.');
      } else {
        setError(caught instanceof Error ? caught.message : 'Falha ao consultar auditoria');
      }
      setData({ items: [], total: 0, page: payload.page || 1, limit: payload.limit || 50 });
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchEvents };
}
