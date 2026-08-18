import { useState } from 'react';
import type { FilterItem } from '../components/RecordingFilterBar';
import { api } from '../services/api';
import { RECORDING_FILTERS } from '../filters/recordingFilters';
import { phoneSearchDigits } from '../utils/phone';
import { documentDigits } from '../utils/document';

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

const FILTER_FIELD_TO_TYPE: Record<string, string> = {
  telefoneCliente: 'CustomerPhone',
  telefoneDestino: 'DestinationPhone',
  documento: 'Document',
  recordStartStart: 'RecordStartStart',
  recordStartEnd: 'RecordStartEnd',
  filaSkill: 'QueueSkill',
};

const participantFilterKeys = Object.fromEntries(
  RECORDING_FILTERS.filter((item) => item.participantKey).map((item) => [item.field, item.participantKey!]),
);

function resolveFilter(filter: FilterItem): { filterType: string; filterField: string; filterValue: string }[] {
  if (filter.field === 'recordStart') {
    const items = [];
    if (filter.start) items.push({ filterType: 'RecordStartStart', filterField: '', filterValue: filter.start });
    if (filter.end) items.push({ filterType: 'RecordStartEnd', filterField: '', filterValue: filter.end });
    if (filter.start || filter.end) {
      if (filter.hourStart) items.push({ filterType: 'RecordStartHourStart', filterField: '', filterValue: filter.hourStart });
      if (filter.hourEnd) items.push({ filterType: 'RecordStartHourEnd', filterField: '', filterValue: filter.hourEnd });
    }
    return items;
  }

  const value = filter.value?.trim();
  if (!filter.field || !value) return [];

  const participantKey = participantFilterKeys[filter.field];
  if (participantKey) {
    return [{ filterType: 'ParticipantData', filterField: participantKey, filterValue: value }];
  }

  const filterType = FILTER_FIELD_TO_TYPE[filter.field];
  if (!filterType) return [];
  const filterValue = filterType === 'CustomerPhone' || filterType === 'DestinationPhone'
    ? phoneSearchDigits(value)
    : filterType === 'Document'
      ? documentDigits(value)
      : value;
  if (!filterValue) return [];
  return [{ filterType, filterField: '', filterValue }];
}

export default function useRecordings() {
  const [data, setData] = useState<RecordingMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchRecordings(filters: FilterItem[]) {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    filters.forEach((filter) => {
      resolveFilter(filter).forEach((resolved) => {
        params.append('filterType', resolved.filterType);
        params.append('filterField', resolved.filterField);
        params.append('filterValue', resolved.filterValue);
      });
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
