import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Button,
  Typography,
} from '@mui/material'
import AudiotrackIcon from '@mui/icons-material/Audiotrack'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { LocalizationProvider } from '@mui/x-date-pickers'
import FilterBar, { type FilterItem } from '../components/RecordingFilterBar'
import RecordingTable from '../components/RecordingTable'
import useRecordings from '../hooks/useRecordings'
import { appUrl } from '../auth/accessContext'

export default function RecordingListPage() {
  const { data: recordings, fetchRecordings, fetchFilterFields, filterFields, loading, error } = useRecordings()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showDateRangeAlert, setShowDateRangeAlert] = useState(false)

  useEffect(() => {
    void fetchRecordings([])
    void fetchFilterFields()
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            mb: 4,
            gap: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Searchvideo4me
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AudiotrackIcon />}
            onClick={() => window.location.assign(appUrl('audio'))}
          >
            Buscar áudios
          </Button>
        </Box>

        <Box margin="0 0 0 0" sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FilterBar
              participantFields={filterFields}
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
          src={`${import.meta.env.BASE_URL}Banco Safra Logo White.png`}
          alt="Banco Safra"
          style={{
            height: 120,
            width: 'auto',
            opacity: 0.9,
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.14))',
            userSelect: 'none',
          }}
          draggable={false}
        />
      </Box>
    </Box>
  )
}
