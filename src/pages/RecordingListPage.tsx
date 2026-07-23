import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Box, Container, Typography, CircularProgress, Paper, IconButton, Menu, MenuItem, Stack } from '@mui/material'
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { LocalizationProvider } from '@mui/x-date-pickers'
import FilterBar, { type FilterItem } from '../components/RecordingFilterBar'
import RecordingTable from '../components/RecordingTable'
import useRecordings from '../hooks/useRecordings'
import { useNavigate } from 'react-router-dom';
import MenuIcon from "@mui/icons-material/Menu";

export default function RecordingListPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { data: recordings, fetchRecordings, loading } = useRecordings()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [showDateRangeAlert, setShowDateRangeAlert] = useState(false)

  const navigate = useNavigate();
  const allowedUsers = ["admin@admin.com"];

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');

    navigate('/login');
    return true;
  }

  function goUpdatePassword() {
    navigate('/updatepassword');
    return true;
  }

  function goHome() {
    navigate('/');
    return true;
  }

  function goAdminPassword() {
    navigate('/adminpassword');
    return true;
  }

  function goRegister() {
    navigate('/register');
    return true;
  }

  function goUsersList() {
    navigate('/users');
    return true;
  }

  function goLogs() {
    navigate('/logs');
    return true;
  }


  function getEmail() {
    const email = localStorage.getItem('email');
    if (!email) {
      return false
    }
    return email
  }

  useEffect(() => {
    const email = getEmail();
    console.log(email)
    if (email) {
      setEmail(email)
    }
  }, [])

  const handleFilterChange = useCallback((filters: FilterItem[]) => {
    const hasDateWithOnlyStart = filters.some(
      filter => {
        const result = filter.field === 'date' && (!filter.end || filter.end == undefined);
        return result;
      }
    );

    setShowDateRangeAlert(hasDateWithOnlyStart);
  }, [])

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5, color: 'text.primary' }}>
      <Container
        maxWidth={false}
        sx={{
          maxWidth: '90%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Searchvideo4me
          </Typography>

          <Box sx={{ flex: 1 }} />

          <IconButton
            aria-controls={open ? 'menu-actions' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            sx={{
              backgroundColor: 'background.paper',
              color: 'text.primary',
              '&:hover': { backgroundColor: '#13395c' },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-actions"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                bgcolor: 'background.paper',
                color: 'text.primary',
                border: '1px solid #20324a',
              },
            }}
          >
            <MenuItem onClick={() => { handleClose(); goHome(); }}>
              Home
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); goUpdatePassword(); }}>
              Alterar Senha
            </MenuItem>

            {allowedUsers.includes(email) && (
              <>
                <MenuItem onClick={() => { handleClose(); goAdminPassword(); }}>
                  Admin
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); goRegister(); }}>
                  Registro
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); goUsersList(); }}>
                  Usuários
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); goLogs(); }}>
                  Logs
                </MenuItem>
              </>
            )}

            <MenuItem onClick={() => { handleClose(); logout(); }}>
              Logout
            </MenuItem>
          </Menu>
        </Box>

        <Box margin="0 0 0 0" sx={{ mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <FilterBar onSubmit={fetchRecordings} onFilterChange={handleFilterChange} />
          </LocalizationProvider>
        </Box>

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
          <Paper sx={{ mx: 'auto', width: '100%', p: 4, justifyContent: 'center', textAlign: 'center', bgcolor: 'background.paper' }}>
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
          alt="banco-safra-logo"
          style={{
            height: 120,
            opacity: 0.9,
            filter: 'drop-shadow(0 2px 8px #0002)',
            userSelect: 'none'
          }}
          draggable={false}
        />
      </Box>
    </Box>
  )
}