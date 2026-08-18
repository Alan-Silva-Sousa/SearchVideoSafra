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
import { useNavigate } from 'react-router-dom'
import FilterBar from '../components/RecordingFilterBar'
import RecordingTable from '../components/RecordingTable'
import useRecordings from '../hooks/useRecordings'
import { appUrl } from '../auth/accessContext'
import { PERMISSIONS, usePermissions } from '../hooks/usePermissions'

export default function RecordingListPage() {
  const navigate = useNavigate()
  const { can, canAccessAudio } = usePermissions()
  const { data: recordings, fetchRecordings, loading, error } = useRecordings()

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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {canAccessAudio && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AudiotrackIcon />}
              onClick={() => window.location.assign(appUrl('audio'))}
            >
              Buscar áudios
            </Button>
            )}
            {can(PERMISSIONS.AUDIT_READ) && (
              <Button variant="outlined" onClick={() => navigate('/audit')} sx={{ fontWeight: 700 }}>
                Auditoria
              </Button>
            )}
          </Box>
        </Box>

        {!can(PERMISSIONS.RECORDING_SEARCH) ? (
          <Alert severity="warning" sx={{ mb: 3 }}>Você não tem permissão para pesquisar gravações.</Alert>
        ) : (
        <Box margin="0 0 0 0" sx={{ mb: 4 }}>
            <FilterBar dark onSubmit={fetchRecordings} />
        </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!can(PERMISSIONS.RECORDING_SEARCH) ? null : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : recordings?.length > 0 ? (
          <RecordingTable recordings={recordings} />
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
