import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { LocalizationProvider } from '@mui/x-date-pickers'
import FilterBar, { type FilterItem } from '../components/RecordingFilterBar'
import RecordingTable from '../components/RecordingTable'
import useRecordings from '../hooks/useRecordings'

export default function RecordingListPage() {
  const { data: recordings, fetchRecordings, loading, error } = useRecordings()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDateRangeAlert, setShowDateRangeAlert] = useState(false)

  useEffect(() => {
    void fetchRecordings([])
  }, [])

  const handleFilterChange = useCallback((filters: FilterItem[]) => {
    const hasDateWithOnlyStart = filters.some(
      (filter) =>
        filter.field === 'date' &&
        (!filter.end || filter.end === undefined),
    )

    setShowDateRangeAlert(hasDateWithOnlyStart)
  }, [])

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100vh',
        py: 5,
        color: 'text.primary',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '90%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Searchvideo4me
          </Typography>
        </Box>

        <Box margin="0 0 0 0" sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FilterBar
              onSubmit={fetchRecordings}
              onFilterChange={handleFilterChange}
            />
          </LocalizationProvider>
        </Box>

        {showDateRangeAlert && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Selecione a data final para completar o período.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : recordings?.length > 0 ? (
          <RecordingTable
            recordings={recordings}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        ) : (
          <Paper
            sx={{
              mx: 'auto',
              width: '100%',
              p: 4,
              justifyContent: 'center',
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
              Nenhum registro encontrado
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Ajuste os filtros ou verifique os critérios de busca.
            </Typography>
          </Paper>
        )}
      </Container>

      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          display: { xs: 'none', sm: 'block' },
          pointerEvents: 'none',
        }}
      >
        <img
          src="/Banco Safra Logo White.png"
          alt="Banco Safra"
          style={{
            width: 'clamp(120px, 14vw, 220px)',
            height: 'auto',
            opacity: 0.9,
            filter: 'drop-shadow(0 2px 8px #0002)',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </Box>
    </Box>
  )
}
