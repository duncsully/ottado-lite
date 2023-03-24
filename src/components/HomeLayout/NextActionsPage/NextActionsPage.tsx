import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { SelectChip } from './SelectChip/SelectChip'
import { timeEstimateOptions } from '../../../options'
import { Effort, NextAction, Option, Tag } from '../../../types'
import { ExpandMore, FilterList, MoreVert } from '@mui/icons-material'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { NextActionForm } from '../../NextActionForm/NextActionForm'
import { NextActionItem } from './NextActionItem/NextActionItem'

// TODO: empty message and no next actions with current filters message
// TODO: Transitions?
// TODO: Common tags across top?
// TODO: Advanced tag filtering? (All of, Any of, Not, etc.)
// TODO: Add a "Show all" button to show all next actions at once?
// TODO: Add a location filter?

// TODO: Consolidate this with the effortItems in NextActionForm.tsx
const effortOptions: Option<number>[] = Object.entries(Effort).reduce(
  (options, [text, value]) => {
    if (isNaN(+text)) {
      options.push({ text, value: value as Effort })
    }
    return options
  },
  [] as Option<Effort>[]
)

export const NextActionsPage = () => {
  const [effort, setEffort] = useState<Option<number> | undefined>(undefined)
  const [timeEstimate, setTimeEstimate] = useState<Option<number> | undefined>(
    undefined
  )

  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const tags = useLiveQuery(() => db.tags.orderBy('name').toArray(), [])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [timeEstimate, effort, selectedTags])

  const filteredNextActions = useLiveQuery(async () => {
    return await db.nextActions
      .where('completedAt')
      .equals(0)
      .filter((nextAction) => {
        const withinMinutes =
          !nextAction.minutesEstimate ||
          nextAction.minutesEstimate <= (timeEstimate?.value ?? Infinity)

        const withinEffort =
          !nextAction.effort ||
          nextAction.effort <= (effort?.value ?? Effort.High)

        return withinMinutes && withinEffort
      })
      .toArray()
      .then((nextActions) =>
        // Sorting by priority asc, then number of matching tags desc, then time estimate desc, then effort desc
        nextActions.sort((a, b) => {
          if (a.priority === b.priority) {
            const aMatchingTags = countMatchingTags(a, selectedTags)
            const bMatchingTags = countMatchingTags(b, selectedTags)
            if (aMatchingTags === bMatchingTags) {
              if (a.minutesEstimate === b.minutesEstimate) {
                return b.effort - a.effort
              }
              return (b.minutesEstimate ?? 0) - (a.minutesEstimate ?? 0)
            }
            return bMatchingTags - aMatchingTags
          }
          return a.priority - b.priority
        })
      )
  }, [timeEstimate, effort, selectedTags])

  const showingNextActions = filteredNextActions?.slice(index, index + 2) ?? []

  const handleNewOptions = () => {
    const nextActionsLength = filteredNextActions?.length ?? 0
    setIndex((index) => {
      if (index >= nextActionsLength - 2) {
        return 0
      }
      return index + 2
    })
  }

  const [viewingAction, setViewingAction] = useState<NextAction | undefined>(
    undefined
  )

  const handleSubmit = async (nextAction: NextAction) => {
    if (!viewingAction) return
    const previousTags = viewingAction.tags
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
        db.nextActions.update(viewingAction.id!, nextAction),
      ])
    })
    setViewingAction(undefined)
  }

  const handleToggle = (nextAction: NextAction) => {
    db.nextActions.update(nextAction.id!, {
      completedAt: nextAction.completedAt ? 0 : Date.now(),
    })
  }

  const completedTodayNextActions = useLiveQuery(async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return await db.nextActions
      .where('completedAt')
      .aboveOrEqual(today.getTime())
      .reverse()
      .sortBy('completedAt')
  })

  const [expanded, setExpanded] = useState(false)

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = () => {
    db.nextActions.delete(viewingAction!.id!)
    handleClose()
    setViewingAction(undefined)
    setDeleteDialogOpen(false)
  }

  return (
    <Stack>
      {!viewingAction ? (
        <>
          <Stack direction="row" gap="8px" my={1}>
            <SelectChip
              label="Effort"
              options={effortOptions}
              getLabel={(option) => option.text}
              value={effort}
              onChange={(value) => setEffort(value)}
            />
            <SelectChip
              label="Time Estimate"
              options={timeEstimateOptions}
              getLabel={(option) => option.text}
              value={timeEstimate}
              onChange={(value) => setTimeEstimate(value)}
            />
            <Chip
              label={<FilterList />}
              variant={selectedTags.length ? 'filled' : 'outlined'}
              color={selectedTags.length ? 'secondary' : 'default'}
              sx={{
                marginLeft: 'auto',
                '.MuiChip-label': {
                  padding: '0 4px',
                },
              }}
              onClick={() => setTagDialogOpen(true)}
            />
          </Stack>
          <List disablePadding>
            {showingNextActions.map((nextAction) => (
              <NextActionItem
                key={nextAction.id}
                nextAction={nextAction}
                onToggle={() => handleToggle(nextAction)}
                onClick={() => setViewingAction(nextAction)}
              />
            ))}
          </List>
          <Button onClick={handleNewOptions} sx={{ alignSelf: 'flex-end' }}>
            New Options
          </Button>
          <Divider sx={{ my: 2 }} />
          {completedTodayNextActions?.length ? (
            <>
              <Stack
                direction="row"
                gap="8px"
                my={1}
                onClick={() => setExpanded((prev) => !prev)}
              >
                <ExpandMore
                  sx={{
                    transition: '0.5s',
                    transform: expanded ? 'rotateX(180deg)' : undefined,
                  }}
                />
                <Typography>
                  {completedTodayNextActions?.length} finished today
                </Typography>
              </Stack>
              <Collapse in={expanded}>
                <List disablePadding>
                  {completedTodayNextActions?.map((nextAction) => (
                    <NextActionItem
                      key={nextAction.id}
                      nextAction={nextAction}
                      onToggle={() => handleToggle(nextAction)}
                      onClick={() => setViewingAction(nextAction)}
                      checked
                    />
                  ))}
                </List>
              </Collapse>
            </>
          ) : (
            <Typography>No next actions completed today</Typography>
          )}
        </>
      ) : (
        <Stack gap={1}>
          <Box sx={{ ml: 'auto' }}>
            <IconButton
              aria-haspopup="true"
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
          </Box>

          <NextActionForm
            existingAction={viewingAction}
            onCancel={() => setViewingAction(undefined)}
            onSubmit={handleSubmit}
          />
        </Stack>
      )}
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
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Prioritize tags</DialogTitle>
        <DialogContent>
          <Autocomplete
            value={selectedTags}
            onChange={(_, value) => setSelectedTags(value)}
            options={tags ?? []}
            getOptionLabel={(tag) => tag.name}
            loading={!tags}
            size="small"
            fullWidth
            multiple
            autoComplete
            autoHighlight
            disableCloseOnSelect
            renderInput={(params) => (
              <TextField {...params} variant="filled" label="Tags" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

const countMatchingTags = (nextAction: NextAction, selectedTags: Tag[]) => {
  return nextAction.tags.reduce((count, tag) => {
    if (selectedTags.some((selectedTag) => selectedTag.name === tag)) {
      return count + 1
    }
    return count
  }, 0)
}
