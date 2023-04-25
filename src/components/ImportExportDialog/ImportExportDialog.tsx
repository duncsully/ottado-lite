import { FC, useState } from 'react'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FileDownload, FileUpload } from '@mui/icons-material'
import { exportDB, importInto } from 'dexie-export-import'
import { db } from '../../db'

export const ImportExportDialog: FC<{ open: boolean; onClose(): void }> = ({
  open,
  onClose,
}) => {
  const handleExport = async () => {
    try {
      const blob = await exportDB(db)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `db_${new Date().toLocaleString()}.json`
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
    } catch (e) {
      console.error(e)
    }
  }

  const [importLoading, setImportLoading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const handleImport = async () => {
    if (!file) return
    setImportLoading(true)

    try {
      await importInto(db, file, {
        clearTablesBeforeImport: true,
        progressCallback: (progress) => {
          console.log(progress)
          setImportProgress(
            (progress.completedRows / (progress.totalRows ?? 1)) * 100
          )
          return true
        },
      })
      setToast({
        open: true,
        severity: 'success',
        message: 'Import successful!',
      })
    } catch (e) {
      console.error(e)
      // TODO: Better error handling
      setToast({
        open: true,
        severity: 'error',
        message: 'Import failed! Make sure this is an OttaDo backup file.',
      })
    } finally {
      setShowConfirmationDialog(false)
      setImportLoading(false)
    }
  }

  const [toast, setToast] = useState<{
    severity: 'success' | 'error'
    message: string
    open: boolean
  }>({ open: false, severity: 'success', message: '' })
  const handleToastClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') return
    setToast((toast) => ({ ...toast, open: false }))
  }

  const [file, setFile] = useState<File | null>(null)

  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  return (
    <>
      <FullscreenDialog title="Import/Export" open={open} onClose={onClose}>
        <Stack p={2} gap={1}>
          <Typography variant="h6">Export</Typography>
          <Typography variant="body1">
            Press the export button below to download a file containing all of
            your data.
          </Typography>
          <Button
            startIcon={<FileDownload />}
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            onClick={handleExport}
            size="large"
          >
            Export
          </Button>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6">Import</Typography>
          <Typography variant="body1">
            You can then import this file on this device to restore a backup in
            case you lose your data, or on another device to transfer your data.
          </Typography>
          <TextField
            variant="outlined"
            type="file"
            onChange={(e) =>
              setFile((e.target as HTMLInputElement).files?.[0] ?? null)
            }
            InputProps={{
              sx: { borderRadius: '10px' },
              inputProps: {
                accept: '.json',
              },
            }}
            sx={{ mt: 1 }}
          />
          <Button
            startIcon={
              importLoading ? (
                <CircularProgress
                  size={20}
                  variant="determinate"
                  value={importProgress}
                />
              ) : (
                <FileUpload />
              )
            }
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
            onClick={() => setShowConfirmationDialog(true)}
            disabled={importLoading || !file}
            size="large"
          >
            Import
          </Button>
        </Stack>
      </FullscreenDialog>
      <Snackbar
        open={toast.open}
        onClose={handleToastClose}
        autoHideDuration={6000}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast?.severity}
          sx={{ width: '100% ' }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
      >
        <DialogTitle>Overwrite data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace all of your current data with what gets imported.
            You cannot undo this action unless you have a backup of your current
            data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmationDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport}>Import</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
