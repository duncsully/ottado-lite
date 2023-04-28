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

export const EditActionDialog: FC<{
  action?: NextAction
  onClose(): void
  back?: boolean
}> = ({ action, onClose, back }) => {
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
      <FullscreenDialog
        open={!!action}
        onClose={onClose}
        back={back}
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
