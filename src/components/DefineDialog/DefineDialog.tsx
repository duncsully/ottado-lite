import {
  AppBar,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { FC, useState } from 'react'
import { NextActionForm } from '../NextActionForm/NextActionForm'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { NextAction } from '../../types'
import { ArrowBack, Close, MoreVert } from '@mui/icons-material'
import { HappyOtto } from '../Otto/HappyOtto'
import { Transition } from '../FullscreenDialogTransition/FullScreenDialogTransition'
import { OttoMessage } from '../OttoMessage/OttoMessage'
import { NextActionItem } from '../NextActionItem/NextActionItem'
import { EditActionDialog } from '../EditActionDialog/EditActionDialog'

export const DefineDialog: FC<{ open: boolean; onClose(): void }> = ({
  open,
  onClose,
}) => {
  const concerns = useLiveQuery(() => db.concerns.toArray())

  const topConcern = concerns?.[0]

  const nextActionsFromConcern = useLiveQuery(
    () =>
      topConcern?.id
        ? db.nextActions.where('concernId').equals(topConcern.id).toArray()
        : [],
    [topConcern?.id]
  )

  const handleDelete = async () => {
    if (!topConcern) return
    db.concerns.delete(topConcern.id!)
    db.nextActions.bulkDelete(
      nextActionsFromConcern!.map((nextAction) => nextAction.id!)
    )
    setDeleteDialogOpen(false)
  }

  const handleDone = async () => {
    if (!topConcern) return
    return db.concerns.delete(topConcern!.id!)
  }

  const handleSubmit = async (nextAction: NextAction) => {
    if (!topConcern) return
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
      return Promise.all([
        ...tagUpdates,
        db.nextActions.add({ ...nextAction, concernId: topConcern?.id }),
      ])
    })
    setDefining(false)
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [defining, setDefining] = useState<boolean>(false)
  const [editingAction, setEditingAction] = useState<NextAction | undefined>(
    undefined
  )

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={onClose}
        sx={{ backgroundColor: 'unset' }}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              onClick={defining ? () => setDefining(false) : onClose}
            >
              {defining ? <ArrowBack /> : <Close />}
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Define concerns
            </Typography>
            {topConcern && (
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
            )}
          </Toolbar>
        </AppBar>
        <Stack gap="1rem" height="100%" p={2} overflow="auto">
          {concerns && concerns.length ? (
            <>
              <Typography sx={{ alignSelf: 'center' }}>
                {concerns.length} left
              </Typography>
              <Card elevation={5} sx={{ borderRadius: '15px', p: '1rem' }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{topConcern?.text}</Typography>
                </Stack>
              </Card>
              {defining ? (
                <NextActionForm
                  onSubmit={(nextAction) => handleSubmit(nextAction)}
                />
              ) : (
                <>
                  <Typography variant="h6">Next actions</Typography>
                  {nextActionsFromConcern?.length ? (
                    <List disablePadding sx={{ overflow: 'auto' }}>
                      {nextActionsFromConcern?.map((nextAction) => (
                        <NextActionItem
                          key={nextAction.id}
                          nextAction={nextAction}
                          onClick={() => setEditingAction(nextAction)}
                        />
                      ))}
                    </List>
                  ) : (
                    <Typography>No next actions defined yet</Typography>
                  )}

                  <Button onClick={() => setDefining(true)}>
                    Define a next action
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: '20px', mt: 'auto' }}
                    disabled={!nextActionsFromConcern?.length}
                    onClick={handleDone}
                  >
                    Done with concern
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <OttoMessage
                ottoComponent={<HappyOtto />}
                title="All done!"
                message="No more concerns to define"
              />
              <Button href="#next-actions" onClick={onClose}>
                View next actions
              </Button>
            </>
          )}
        </Stack>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete this concern?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You won't be able to recover this concern if you delete it. All
            defined next actions will be deleted as well.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <EditActionDialog
        action={editingAction}
        onClose={() => setEditingAction(undefined)}
      />
    </>
  )
}
