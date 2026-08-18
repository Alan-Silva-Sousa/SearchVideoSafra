import axios from 'axios';
import type { RecordingMeta } from './useRecordings';
import { api } from '../services/api';

function downloadError(error: unknown): Error {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return new Error('Permissão de download obrigatória');
  }
  return error instanceof Error ? error : new Error('Erro ao baixar arquivo');
}

export async function downloadSingleRecording(recording: RecordingMeta): Promise<void> {
  const id = recording.CallIDMaster;
  if (!id) return;
  await downloadSingleById(id, recording.DestinationFileName);
}

async function downloadSingleById(id: string, fileName?: string): Promise<void> {
  try {
    const response = await api.get(`/audio/download/${encodeURIComponent(id)}`, {
      responseType: 'blob',
    });
    const disposition = String(response.headers['content-disposition'] || '');
    const match = disposition.match(/filename="(.+)"/);
    triggerBrowserDownload(response.data, match ? match[1] : fileName || `${id}.mp4`);
  } catch (error) {
    throw downloadError(error);
  }
}

async function downloadAsZip(ids: string[]): Promise<void> {
  try {
    const response = await api.post('/audio/zip', { ids }, { responseType: 'blob' });
    triggerBrowserDownload(response.data, 'videos.zip');
  } catch (error) {
    throw downloadError(error);
  }
}

export async function downloadSelectedRecordings(ids: string[]): Promise<void> {
  if (!ids.length) return;
  if (ids.length === 1) {
    await downloadSingleById(ids[0]);
    return;
  }
  await downloadAsZip(ids);
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
