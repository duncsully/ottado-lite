import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState, type FC } from 'react'
import { Transition } from '../../../FullscreenDialogTransition/FullScreenDialogTransition'
import { Close, MoreVert } from '@mui/icons-material'
import { db } from '../../../../db'
import { NextAction } from '../../../../types'
import { NextActionForm } from '../../../NextActionForm/NextActionForm'

export const EditActionDialog: FC<{ action?: NextAction; onClose(): void }> = ({
  action,
  onClose,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const handleDelete = () => {
    db.nextActions.delete(action!.id!)
    handleClose()
    setDeleteDialogOpen(false)
    onClose()
  }

  const handleSubmit = async (nextAction: NextAction) => {
    if (!action) return
    const previousTags = action.tags
    db.transaction('rw', db.nextActions, db.tags, async () => {
      const tagUpdates = nextAction.tags
        .filter((tag) => !previousTags.includes(tag))
        .map((tag) => {
          const query = db.tags.where('name').equals(tag)
          return query.count((count) => {
            if (count === 0) {
              return db.tags.add({ name: tag, usedCount: 1 })
            }
            return query.modify((currentTag) => {
              currentTag.usedCount++
            })
          })
        })
      return Promise.all([
        ...tagUpdates,
        db.nextActions.update(action.id!, nextAction),
      ])
    })
    onClose()
  }

  return (
    <>
      <Dialog
        fullScreen
        open={!!action}
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
              Edit next action
            </Typography>
            <IconButton
              edge="end"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={!!anchorEl}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setDeleteDialogOpen(true)
                  handleClose()
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box p={2}>
          <NextActionForm existingAction={action} onSubmit={handleSubmit} />
        </Box>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete this next action?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You won't be able to recover this next action if you delete it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
