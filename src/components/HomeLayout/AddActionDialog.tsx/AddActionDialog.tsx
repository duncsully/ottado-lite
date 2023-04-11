import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { type FC } from 'react'
import { Transition } from '../../FullscreenDialogTransition/FullScreenDialogTransition'
import { Close } from '@mui/icons-material'
import { db } from '../../../db'
import { NextAction } from '../../../types'
import { NextActionForm } from '../../NextActionForm/NextActionForm'

export const AddActionDialog: FC<{ open: boolean; onClose(): void }> = ({
  open,
  onClose,
}) => {
  const handleSubmit = async (nextAction: NextAction) => {
    db.transaction('rw', db.nextActions, db.concerns, db.tags, async () => {
      const tagUpdates = nextAction.tags.map((tag) => {
        const query = db.tags.where('name').equals(tag)
        return query.count((count) => {
          if (count === 0) {
            return db.tags.add({ name: tag, usedCount: 1 })
          }
          return query.modify({ usedCount: count + 1 })
        })
      })
      return Promise.all([...tagUpdates, db.nextActions.add(nextAction)])
    })
    onClose()
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{ backgroundColor: 'unset' }}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Create next action
          </Typography>
        </Toolbar>
      </AppBar>
      <Box p={2}>
        <NextActionForm onSubmit={handleSubmit} />
      </Box>
    </Dialog>
  )
}
