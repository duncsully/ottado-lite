import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { SelectChip } from '../SelectChip/SelectChip'
import { timeEstimateOptions } from '../../options'
import { Effort, NextAction, Option, Tag } from '../../types'
import { ExpandMore, FilterList } from '@mui/icons-material'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { NextActionItem } from '../NextActionItem/NextActionItem'
import { EditActionDialog } from '../EditActionDialog/EditActionDialog'
import { OttoMessage } from '../OttoMessage/OttoMessage'
import { ConcernedOtto } from '../Otto/ConcernedOtto'

// TODO: Transitions?
// TODO: Common tags across top?
// TODO: Advanced tag filtering? (All of, Any of, Not, etc.)
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
  const allUncompletedNextActions = useLiveQuery(() =>
    db.nextActions.where('completedAt').equals(0).toArray()
  )

  // --------------------------------------------------------------------------
  // Tag dialog
  // --------------------------------------------------------------------------
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const tags = useLiveQuery(() => db.tags.orderBy('name').toArray(), [])

  const tagDialogComponent = (
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
  )

  // --------------------------------------------------------------------------
  // Filter chips
  // --------------------------------------------------------------------------
  const [effort, setEffort] = useState<Option<number> | undefined>(undefined)
  const [timeEstimate, setTimeEstimate] = useState<Option<number> | undefined>(
    undefined
  )

  const filterChipsComponent = (
    <Stack direction="row" gap="8px" mb={1}>
      <SelectChip
        label="Effort"
        options={effortOptions}
        getLabel={(option) => option.text}
        value={effort}
        onChange={(value) => setEffort(value)}
      />
      <SelectChip
        label="Time"
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
  )

  // --------------------------------------------------------------------------
  // Showing next actions
  // --------------------------------------------------------------------------

  const filteredNextActions = useMemo(() => {
    return (
      allUncompletedNextActions
        ?.filter((nextAction) => {
          const withinMinutes =
            !nextAction.minutesEstimate ||
            nextAction.minutesEstimate <= (timeEstimate?.value ?? Infinity)

          const withinEffort =
            !nextAction.effort ||
            nextAction.effort <= (effort?.value ?? Effort.High)

          return withinMinutes && withinEffort
        })
        .sort((a, b) => {
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
        }) ?? []
    )
  }, [allUncompletedNextActions, timeEstimate, effort, selectedTags])

  const handleToggle = (nextAction: NextAction) => {
    db.nextActions.update(nextAction.id!, {
      completedAt: nextAction.completedAt ? 0 : Date.now(),
    })
  }

  const [showAll, setShowAll] = useState(false)
  const [showingIndex, setShowingIndex] = useState(0)

  const showingNextActions =
    (showAll
      ? filteredNextActions
      : filteredNextActions?.slice(showingIndex, showingIndex + 2)) ?? []

  const handleNewOptions = () => {
    setShowingIndex((index) => {
      return index + 2
    })
  }

  if (showingIndex >= filteredNextActions?.length && showingIndex >= 2) {
    setShowingIndex(0)
  }

  useEffect(() => {
    setShowingIndex(0)
  }, [timeEstimate, effort, selectedTags])

  const showingNextActionsComponent = (
    <>
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
      {filteredNextActions?.length > 2 && (
        <Box alignSelf="flex-end">
          {!showAll && <Button onClick={handleNewOptions}>New Options</Button>}
          <Button onClick={() => setShowAll((showing) => !showing)}>
            {showAll ? 'Show Less' : 'Show All'}
          </Button>
        </Box>
      )}
    </>
  )

  // --------------------------------------------------------------------------
  // View next action
  // --------------------------------------------------------------------------

  const [viewingAction, setViewingAction] = useState<NextAction | undefined>(
    undefined
  )

  const viewNextActionComponent = (
    <EditActionDialog
      action={viewingAction}
      onClose={() => setViewingAction(undefined)}
    />
  )

  // --------------------------------------------------------------------------
  // Completed next actions
  // --------------------------------------------------------------------------

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

  const completedTodayNextActionsComponent =
    completedTodayNextActions?.length ? (
      <>
        <Stack
          direction="row"
          gap="8px"
          my={1}
          sx={{ cursor: 'pointer' }}
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
    )

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <Stack>
      <>
        {allUncompletedNextActions?.length === 0 ? (
          <OttoMessage
            ottoComponent={<ConcernedOtto />}
            title="No next actions"
            message="Define some concerns!"
          />
        ) : (
          <>
            {filterChipsComponent}
            {filteredNextActions?.length ? (
              showingNextActionsComponent
            ) : (
              <Typography sx={{ my: 1 }}>
                No next actions found with selected filters
              </Typography>
            )}
          </>
        )}

        <Divider sx={{ my: 2 }} />
        {completedTodayNextActionsComponent}
      </>
      {viewNextActionComponent}
      {tagDialogComponent}
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
