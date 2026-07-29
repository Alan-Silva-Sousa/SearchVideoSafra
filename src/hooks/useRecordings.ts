import { useState } from 'react';
import type { FilterItem } from '../components/RecordingFilterBar';
import { api } from '../services/api';

export interface RecordingMeta {
  CallIDMaster: string;
  ANI: string | null;
  DNIS: string | null;
  RecordStart: string;
  RecordDuration: number;
  DestinationFileName: string;
  CampaignId: string | null;
  AgentId: string | null;
  DestinationFileSize: number;
  Disposition: string | null;
  S3Directory: string;
  S3FileName: string;
  Username: string | null;
  AgentLogin: string | null;
  Campaignname: string | null;
  Dispositionname: string | null;
  Direction: string | null;
  MediaType: string;
  ContentType: string;
  CPF: string | null;
  CNPJ: string | null;
  AGENCIA: string | null;
  CONTA: string | null;
  EC: string | null;
  CONTRATO: string | null;
  PROTOCOLO: string | null;
}

const filterTypeMap: Record<string, string> = {
  user: 'Agent',
  agentLogin: 'AgentLogin',
  category: 'Campaign',
  format: 'Format',
  ani: 'ANI',
  dnis: 'DNIS',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  agencia: 'AGENCIA',
  conta: 'CONTA',
  ec: 'EC',
  contrato: 'CONTRATO',
  protocolo: 'PROTOCOLO',
};

export default function useRecordings() {
  const [data, setData] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchRecordings(filters: FilterItem[]) {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    filters.forEach((filter) => {
      if (!filter.field) return;

      if (filter.field === 'date') {
        if (filter.start) {
          params.append('filterType', 'RecordStartStart');
          params.append('filterValue', filter.start);
        }
        if (filter.end) {
          params.append('filterType', 'RecordStartEnd');
          params.append('filterValue', filter.end);
        }
        return;
      }

      const type = filterTypeMap[filter.field];
      if (type && filter.value?.trim()) {
        params.append('filterType', type);
        params.append('filterValue', filter.value.trim());
      }
    });

    try {
      const response = await api.get<RecordingMeta[]>('/audio', { params });
      setData(response.data);
    } catch (requestError: any) {
      setData([]);
      setError(
        requestError.response?.data?.message ||
          'Não foi possível buscar as gravações no servidor.',
      );
    } finally {
      setLoading(false);
    }
  }

  return { data, fetchRecordings, loading, error };
}
