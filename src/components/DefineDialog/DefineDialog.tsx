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
import { Link, useNavigate } from 'react-router-dom'

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
    await db.nextActions.add({ ...nextAction, concernId: topConcern?.id })
    setDefining(false)
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [defining, setDefining] = useState<boolean>(false)

  const navigate = useNavigate()

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
              <Card
                elevation={5}
                sx={{ borderRadius: '15px', p: '1rem', overflow: 'visible' }}
              >
                <Typography>{topConcern?.text}</Typography>
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
                          onClick={() =>
                            navigate(`/next-actions/${nextAction.id}`, {
                              state: { referrer: 'define' },
                            })
                          }
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
              <Button component={Link} to="next-actions">
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
    </>
  )
}
