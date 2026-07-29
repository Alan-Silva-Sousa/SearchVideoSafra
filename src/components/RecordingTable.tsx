import { useState, useEffect } from 'react'
import {
  Paper, Table, TableBody, TableHead, TableRow, TableCell, TableFooter, Box, Button, Checkbox, CircularProgress
} from '@mui/material'
import RecordingRow from './RecordingRow'
import type { RecordingMeta } from '../hooks/useRecordings'
import { api } from '../services/api'

const rowsPerPage = 35;

export default function RecordingTable({
  recordings,
  selectedIds,
  setSelectedIds,
}: {
  recordings: RecordingMeta[]
  maxWidth?: string
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
}) {

  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPage(0) }, [recordings])

  const totalPages = Math.ceil(recordings.length / rowsPerPage)

  const paginated = recordings.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  // Checkbox master
  const allSelected = (paginated ?? []).length > 0 && (paginated ?? []).every(a => selectedIds.includes(a.CallIDMaster));
  const isIndeterminate = paginated.some(a => selectedIds.includes(a.CallIDMaster)) && !allSelected

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const toAdd = paginated.map(a => a.CallIDMaster).filter(CallIDMaster => !selectedIds.includes(CallIDMaster))
      setSelectedIds([...selectedIds, ...toAdd])
    } else {
      setSelectedIds(selectedIds.filter(CallIDMaster => !paginated.some(a => a.CallIDMaster === CallIDMaster)))
    }
  }

  const handleCheck = (CallIDMaster: string, checked: boolean) => {
    if (checked) setSelectedIds([...selectedIds, CallIDMaster])
    else setSelectedIds(selectedIds.filter(x => x !== CallIDMaster))
  }

  const handleDownloadZip = async () => {
    if (!selectedIds.length) return;
    setLoading(true);
    try {
      const response = await api.post(
        '/audio/zip',
        { ids: selectedIds },
        { responseType: 'blob' },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'videos.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Não foi possível gerar o arquivo ZIP. Verifique os objetos no S3.');
    } finally {
      setLoading(false);
    }
  }

  if (!recordings.length) return null

  return (
    <Paper sx={{ width: '100%', mx: 'auto', bgcolor: 'background.paper', color: 'text.primary' }}>
      {/* Botão de download em lote */}
      <Box sx={{ p: 2, pb: 0, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={selectedIds.length === 0 || loading}
          onClick={handleDownloadZip}
          sx={{
            fontWeight: 700,
            backgroundColor: selectedIds.length === 0 ? '#4a576a' : '#0d4f8b',
            color: '#fff',
            pointerEvents: selectedIds.length === 0 ? 'none' : 'auto',
            '&:hover': {
              backgroundColor: selectedIds.length === 0 ? '#4a576a' : '#08336a',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            <>Baixar selecionados ({selectedIds.length})</>
          )}
        </Button>
      </Box>

      <Box sx={{ overflowX: 'auto', transform: 'rotateX(180deg)', width: '100%' }}>
        <Box sx={{ transform: 'rotateX(180deg)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.dark' }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={isIndeterminate}
                    onChange={e => handleSelectAll(e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}></TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Data/Hora</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>ANI</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>DNIS</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Nome Agente</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Usuário</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Categoria</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Duração</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Tamanho</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Formato</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(a => (
                <RecordingRow
                  key={a.CallIDMaster}
                  recording={a}
                  checked={selectedIds.includes(a.CallIDMaster)}
                  onCheck={handleCheck}
                />
              ))}
            </TableBody>
            {recordings.length > rowsPerPage && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={11} sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                      <Button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 90, fontWeight: 700, color: 'text.primary', borderColor: '#375a8f' }}
                      >
                        Anterior
                      </Button>
                      <Box sx={{ fontWeight: 700, color: 'text.primary', px: 1 }}>
                        Página {page + 1} de {totalPages}
                      </Box>
                      <Button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                        size="small"
                        variant="outlined"
                        sx={{ minWidth: 90, fontWeight: 700, color: 'text.primary', borderColor: '#375a8f' }}
                      >
                        Próximo
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </Box>
      </Box>
    </Paper>
  )
}
