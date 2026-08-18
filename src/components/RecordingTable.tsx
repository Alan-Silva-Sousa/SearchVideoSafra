import { useState, useEffect } from 'react'
import {
  Paper, Table, TableBody, TableHead, TableRow, TableCell, TableFooter, Box, Button
} from '@mui/material'
import RecordingRow from './RecordingRow'
import type { RecordingMeta } from '../hooks/useRecordings'

const rowsPerPage = 35;

export default function RecordingTable({
  recordings,
}: {
  recordings: RecordingMeta[]
  maxWidth?: string
}) {
  const [page, setPage] = useState(0)

  useEffect(() => { setPage(0) }, [recordings])

  const totalPages = Math.ceil(recordings.length / rowsPerPage)
  const paginated = recordings.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  if (!recordings.length) return null

  return (
    <Paper sx={{ width: '100%', mx: 'auto', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Box sx={{ overflowX: 'auto', transform: 'rotateX(180deg)', width: '100%' }}>
        <Box sx={{ transform: 'rotateX(180deg)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.dark' }}>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}></TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Data/Hora</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Telefone Cliente</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Telefone Destino</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>CPF/CNPJ</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Skill/Fila</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Ambiente</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Duração</TableCell>
                <TableCell sx={{ color: 'text.primary', fontWeight: 700 }}>Formato</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(a => (
                <RecordingRow key={a.CallIDMaster} recording={a} />
              ))}
            </TableBody>
            {recordings.length > rowsPerPage && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 1 }}>
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
