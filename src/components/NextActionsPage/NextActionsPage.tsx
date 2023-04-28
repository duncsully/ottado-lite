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
  Fab,
  List,
  Stack,
  TextField,
  Typography,
  Zoom,
} from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SelectChip } from '../SelectChip/SelectChip'
import { timeEstimateOptions } from '../../options'
import { Effort, NextAction, Option, Tag } from '../../types'
import { Add, ExpandMore, FilterList } from '@mui/icons-material'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { NextActionItem } from '../NextActionItem/NextActionItem'
import { EditActionDialog } from '../EditActionDialog/EditActionDialog'
import { OttoMessage } from '../OttoMessage/OttoMessage'
import { ConcernedOtto } from '../Otto/ConcernedOtto'
import { AddActionDialog } from '../AddActionDialog.tsx/AddActionDialog'

// TODO: Transitions?
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
  const tags = useLiveQuery(() => db.tags.orderBy('usedCount').toArray(), [])

  const tagDialogComponent = (
    <Dialog
      open={tagDialogOpen}
      onClose={() => setTagDialogOpen(false)}
      fullWidth
    >
      <DialogTitle>Filter tags</DialogTitle>
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
            <TextField
              {...params}
              variant="filled"
              label="Tags"
              helperText="Only show actions that have at least one of the selected tags"
            />
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

  const [gradient, setGradient] = useState('none')
  const handleScroll = (element: HTMLDivElement | null) => {
    if (!element) return
    const { scrollLeft, scrollWidth, clientWidth } = element
    const canScrollLeft = scrollLeft > 0
    const canScrollRight = scrollLeft < scrollWidth - clientWidth

    if (canScrollLeft || canScrollRight) {
      setGradient(
        `linear-gradient(to ${
          canScrollRight ? 'right' : 'left'
        }, transparent, white ${
          canScrollLeft && canScrollRight ? '15%' : '0'
        }, white 85%, transparent)`
      )
    } else {
      setGradient('none')
    }
  }

  const filterChipsComponent = (
    <Stack
      direction="row"
      gap="8px"
      mb={1}
      width="100%"
      flexShrink={0}
      overflow="auto"
      sx={{
        maskImage: gradient,
      }}
      ref={handleScroll}
      onScroll={(e) => handleScroll(e.currentTarget)}
    >
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
      {/* TODO: Should this be most _used_ tags or most _filtered by_ tags? */}
      {tags?.slice(0, 5).map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
          color={selectedTags.includes(tag) ? 'secondary' : 'default'}
          onClick={() =>
            setSelectedTags((selectedTags) =>
              selectedTags.includes(tag)
                ? selectedTags.filter((t) => t.id !== tag.id)
                : [...selectedTags, tag]
            )
          }
        />
      ))}
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

          const hasSomeMatchingTags =
            !selectedTags.length ||
            selectedTags.some((tag) => nextAction.tags?.includes(tag.name))

          return withinMinutes && withinEffort && hasSomeMatchingTags
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
        <Box sx={{ ml: 4 }}>
          <Button
            onClick={() => {
              setShowAll((showing) => !showing)
              setShowingIndex(0)
            }}
          >
            {showAll ? 'Show Less' : 'Show All'}
          </Button>
          {!showAll && <Button onClick={handleNewOptions}>New Options</Button>}
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
              />
            ))}
          </List>
        </Collapse>
      </>
    ) : (
      <Typography>No next actions finished today</Typography>
    )

  // --------------------------------------------------------------------------
  // Quick add dialog
  // --------------------------------------------------------------------------
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const addDialogComponent = (
    <AddActionDialog
      open={addDialogOpen}
      onClose={() => setAddDialogOpen(false)}
    />
  )

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  if (!allUncompletedNextActions) return null

  return (
    <>
      <Stack height="100%">
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
        {addDialogComponent}
      </Stack>
      <Zoom in>
        <Fab
          color="primary"
          sx={{
            borderRadius: '16px',
            position: 'absolute',
            bottom: 72,
            right: 16,
          }}
          onClick={() => setAddDialogOpen(true)}
        >
          <Add />
        </Fab>
      </Zoom>
    </>
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
