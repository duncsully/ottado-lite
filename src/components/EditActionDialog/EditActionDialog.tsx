import {
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
} from '@mui/material'
import { useState, type FC } from 'react'
import { MoreVert } from '@mui/icons-material'
import { db } from '../../db'
import { NextAction } from '../../types'
import { NextActionForm } from '../NextActionForm/NextActionForm'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import { useLiveQuery } from 'dexie-react-hooks'
import { useLocation } from 'react-router-dom'

export const EditActionDialog: FC<{
  actionId?: number
  onClose(): void
}> = ({ actionId, onClose }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const referrer = useLocation().state?.referrer

  const action = useLiveQuery(
    () => (actionId ? db.nextActions.get(actionId) : undefined),
    [actionId]
  )

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const handleDelete = () => {
    db.nextActions.delete(action!.id!)
    handleClose()
    setDeleteDialogOpen(false)
    onClose()
  }

  // TODO: Move logic into NextActionForm (or into classes and services?)
  const handleSubmit = async (nextAction: NextAction) => {
    if (!action) return
    await db.nextActions.update(action.id!, nextAction)
    onClose()
  }

  return (
    <>
      <FullscreenDialog
        open={!!action}
        onClose={onClose}
        back={!!referrer}
        title="Edit next action"
        toolbarActions={
          <>
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
          </>
        }
      >
        <Box p={2}>
          <NextActionForm existingAction={action} onSubmit={handleSubmit} />
        </Box>
      </FullscreenDialog>
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
