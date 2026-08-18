import {
  Alert,
  Box,
  Button,
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
import { downloadSingleRecording } from "../hooks/downloadGravacao";
import DownloadJustificationDialog from "./DownloadJustificationDialog";
import { PERMISSIONS, usePermissions } from "../hooks/usePermissions";

interface Props {
  recording: RecordingMeta;
}

function participantDataEntries(data: Record<string, unknown> | undefined) {
  return Object.entries(data || {})
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .sort(([left], [right]) => left.localeCompare(right, "pt-BR"));
}

function participantDataValue(value: unknown): string {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function participantValue(data: Record<string, unknown> | undefined, ...keys: string[]): string {
  const entries = Object.entries(data || {});
  for (const key of keys) {
    const entry = entries.find(([name]) => name.trim().toLowerCase() === key.toLowerCase());
    if (entry && entry[1] !== null && entry[1] !== undefined && String(entry[1]).trim()) {
      return String(entry[1]).trim();
    }
  }
  return "";
}

export default function RecordingRow({ recording }: Props) {
  const { can, downloadJustificationRequired } = usePermissions();
  const [open, setOpen] = useState(false);
  const [justificationOpen, setJustificationOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !recording.CallIDMaster) return;
    void api.get(`/audio/${encodeURIComponent(recording.CallIDMaster)}`).catch(() => undefined);
  }, [open, recording.CallIDMaster]);

  useEffect(() => {
    if (!open || !can(PERMISSIONS.RECORDING_PLAY)) {
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
  }, [open, recording.CallIDMaster, can]);

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

  const participantData = recording.ParticipantData;
  const startTime = participantValue(participantData, "Hora Inicio") || recording.RecordStart;
  const customerPhone = participantValue(participantData, "Telefone Cliente", "telefone") || recording.ANI?.replace(/^tel:\+?/, "");
  const destinationPhone = participantValue(participantData, "Telefone Destino") || recording.DNIS?.replace(/^tel:\+?/, "");
  const document = participantValue(participantData, "Doc Cliente", "doc_cliente", "CPF", "CNPJ");
  const skill = participantValue(participantData, "skill", "transfer_filas");
  const environment = participantValue(participantData, "Ambiente");

  return (
    <>
      <TableRow hover sx={{ "&:hover": { backgroundColor: "#0d2344" } }}>
        <TableCell>
          <IconButton onClick={handleOpenRow} size="small" color="primary">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {new Date(startTime).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {customerPhone || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {destinationPhone || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {document || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {skill || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {environment || "-"}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {formatDuration(recording.RecordDuration)}
        </TableCell>
        <TableCell sx={{ color: "text.primary" }}>
          {formatContentType(recording.ContentType)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={9}
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
              {can(PERMISSIONS.RECORDING_PLAY) ? (
                <>
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
                      controlsList="nodownload"
                      preload="metadata"
                      sx={{ width: "100%", maxWidth: 960 }}
                    />
                  )}
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">Reprodução não autorizada.</Typography>
              )}

              {participantDataEntries(recording.ParticipantData).length > 0 && (
                <Box sx={{ width: "100%", mt: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Participant Data
                  </Typography>
                  <Grid container spacing={2}>
                    {participantDataEntries(recording.ParticipantData).map(([key, value]) => (
                      <Grid item xs={12} md={key.toUpperCase().includes("CDR") ? 12 : 6} key={key}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                        >
                          <strong>{key}:</strong> {participantDataValue(value)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

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

              {can(PERMISSIONS.RECORDING_DOWNLOAD) && (
              <Stack direction="row" spacing={1}>
                <Tooltip title="Download do video">
                  <Button
                    color="primary"
                    startIcon={<Download />}
                    sx={{ borderColor: "#375a8f" }}
                    onClick={() => {
                      if (downloadJustificationRequired) setJustificationOpen(true);
                      else void downloadSingleRecording(recording);
                    }}
                  >
                    Baixar vídeo
                  </Button>
                </Tooltip>
              </Stack>
              )}
              <DownloadJustificationDialog
                open={justificationOpen}
                kind="SINGLE"
                onCancel={() => setJustificationOpen(false)}
                onConfirm={() => {
                  setJustificationOpen(false);
                  void downloadSingleRecording(recording);
                }}
              />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
