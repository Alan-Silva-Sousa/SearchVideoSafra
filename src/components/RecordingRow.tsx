import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Download,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import type { RecordingMeta } from "../hooks/useRecordings";
import { api } from "../services/api";

interface Props {
  recording: RecordingMeta;
  checked: boolean;
  onCheck: (id: string, checked: boolean) => void;
}

export default function RecordingRow({ recording, checked, onCheck }: Props) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setVideoUrl(null);
      setVideoLoading(false);
      setVideoError(null);
      return;
    }

    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    setVideoUrl(null);
    setVideoLoading(true);
    setVideoError(null);

    api
      .get(`/audio/play/${recording.CallIDMaster}`, {
        responseType: "blob",
        signal: controller.signal,
      })
      .then((response) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(response.data);
        setVideoUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setVideoError("Não foi possível carregar o vídeo.");
        }
      })
      .finally(() => {
        if (active) {
          setVideoLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [open, recording.CallIDMaster]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const response = await api.get(
        `/audio/download/${recording.CallIDMaster}`,
        {
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = recording.DestinationFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      let message = "Não foi possível baixar o vídeo.";
      if (error.response?.data instanceof Blob) {
        try {
          const payload = JSON.parse(await error.response.data.text());
          if (payload.message) message = payload.message;
        } catch {}
      }
      alert(message);
    } finally {
      setDownloading(false);
    }
  }

  function handleOpenRow() {
    setOpen((o) => !o);
  }

  function formatFileSize(bytes: number | bigint | null): string {
    const n = Number(bytes);
    if (!n || n <= 0) return "-";
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatContentType(ct: string | null): string {
    if (!ct) return "-";
    // "audio/mpeg" → "MPEG", "audio/wav" → "WAV", "audio/opus" → "OPUS"
    const parts = ct.split("/");
    return (parts[1] || ct).toUpperCase();
  }

  function formatDuration(seconds: number | bigint): string {
    const totalSeconds = Number(seconds);
    if (!totalSeconds || totalSeconds <= 0) return "-";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <>
      <TableRow hover sx={{ "&:hover": { backgroundColor: "#0d2344" } }}>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={checked}
            onChange={(e) => onCheck(recording.CallIDMaster, e.target.checked)}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={handleOpenRow} size="small" color="primary">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {new Date(recording.RecordStart).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {recording.ANI || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {recording.DNIS || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {recording.Username || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {recording.AgentLogin || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {recording.Campaignname || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {formatDuration(recording.RecordDuration)}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {formatFileSize(recording.DestinationFileSize)}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {formatContentType(recording.ContentType)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={11}
          sx={{
            bgcolor: "#08213d",
            p: 0,
            border: 0,
            borderTop: "1px solid #20324a",
          }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
                bgcolor: "#08213d",
              }}
            >
              {videoLoading && <CircularProgress size={28} />}
              {videoError && (
                <Alert severity="error" sx={{ width: "100%", maxWidth: 960 }}>
                  {videoError}
                </Alert>
              )}
              {videoUrl && (
                <Box
                  component="video"
                  src={videoUrl}
                  controls
                  preload="metadata"
                  sx={{ width: "100%", maxWidth: 960 }}
                />
              )}

              {/* Grid com informações da chamada */}
              <Grid container spacing={2} sx={{ width: "100%", mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ANI:</strong> {recording.ANI || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>DNIS:</strong> {recording.DNIS || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Nome do Agente:</strong> {recording.Username || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Login do Agente:</strong>{" "}
                    {recording.AgentLogin || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CPF:</strong> {recording.CPF || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>CNPJ:</strong> {recording.CNPJ || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Agência:</strong> {recording.AGENCIA || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Conta:</strong> {recording.CONTA || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>EC:</strong> {recording.EC || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Contrato:</strong> {recording.CONTRATO || "-"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Protocolo:</strong> {recording.PROTOCOLO || "-"}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary">
                <strong>Formato:</strong> {recording.ContentType || "MP4"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Duração:</strong>{" "}
                {formatDuration(recording.RecordDuration)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Tamanho:</strong>{" "}
                {formatFileSize(recording.DestinationFileSize)}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Download do video">
                  <Button
                    color="primary"
                    startIcon={<Download />}
                    sx={{ borderColor: "#375a8f" }}
                    disabled={downloading}
                    onClick={handleDownload}
                  >
                    {downloading ? "Baixando..." : "Baixar vídeo"}
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
