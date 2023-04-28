import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { FC } from 'react'
import { Transition } from '../FullscreenDialogTransition/FullScreenDialogTransition'
import { ArrowBack, Close } from '@mui/icons-material'

export const FullscreenDialog: FC<{
  open: boolean
  onClose(): void
  back?: boolean
  title: string
  children: React.ReactNode
  toolbarActions?: React.ReactNode
}> = ({ open, onClose, back, title, children, toolbarActions }) => {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{ backgroundColor: 'unset' }}
      TransitionComponent={Transition}
    >
      <AppBar>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            {back ? <ArrowBack /> : <Close />}
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
          {toolbarActions}
        </Toolbar>
      </AppBar>
      <Box pt={7}>{children}</Box>
    </Dialog>
  )
}
