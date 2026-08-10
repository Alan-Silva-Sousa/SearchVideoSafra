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
  ParticipantData: Record<string, unknown>;
}

const filterTypeMap: Record<string, string> = {
  telefoneCliente: 'CustomerPhone',
  telefoneDestino: 'DestinationPhone',
  documento: 'Document',
  filaSkill: 'QueueSkill',
  ambiente: 'Environment',
  duracao: 'Duration',
  format: 'Format',
  tamanho: 'FileSize',
};

function normalizeDuration(value: string): string {
  const parts = value.trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return value.trim();
  if (parts.length === 2) return String(parts[0] * 60 + parts[1]);
  if (parts.length === 3) return String(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return value.trim();
}

function normalizeFileSize(value: string): string {
  const match = value.trim().replace(',', '.').match(/^([0-9]+(?:\.[0-9]+)?)\s*(B|KB|MB|GB)?$/i);
  if (!match) return value.trim();
  const units: Record<string, number> = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  return String(Math.round(Number(match[1]) * units[(match[2] || 'B').toUpperCase()]));
}

export default function useRecordings() {
  const [data, setData] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterFields, setFilterFields] = useState<string[]>([]);

  async function fetchFilterFields() {
    try {
      const response = await api.get<string[]>('/audio/filter-fields');
      setFilterFields(response.data);
    } catch {
      setFilterFields([]);
    }
  }

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
          params.append('filterField', '');
        }
        if (filter.end) {
          params.append('filterType', 'RecordStartEnd');
          params.append('filterValue', filter.end);
          params.append('filterField', '');
        }
        return;
      }

      const participantField = filter.field.startsWith('participant:')
        ? filter.field.slice('participant:'.length)
        : '';
      const type = participantField ? 'ParticipantData' : filterTypeMap[filter.field];
      if (type && filter.value?.trim()) {
        params.append('filterType', type);
        params.append('filterField', participantField);
        params.append(
          'filterValue',
          filter.field === 'duracao'
            ? normalizeDuration(filter.value)
            : filter.field === 'tamanho'
              ? normalizeFileSize(filter.value)
              : filter.value.trim(),
        );
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

  return { data, fetchRecordings, fetchFilterFields, filterFields, loading, error };
}
