import { type FC } from 'react'
import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Button, IconButton, Snackbar } from '@mui/material'
import { Close } from '@mui/icons-material'

export const UpdateAvailableToast: FC = () => {
  const [showToast, setShowToast] = useState(false)
  let updateServiceWorker = () => {}
  useEffect(() => {
    updateServiceWorker = registerSW({
      onNeedRefresh() {
        setShowToast(true)
      },
    })
  }, [])
  return (
    <Snackbar
      open={showToast}
      onClose={() => setShowToast(false)}
      message="Update available!"
      action={
        <>
          <Button color="primary" size="small" onClick={updateServiceWorker}>
            Reload
          </Button>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setShowToast(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        </>
      }
    />
  )
}
