import {
  Button,
  Card,
  Checkbox,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import { SelectChip } from './SelectChip/SelectChip'
import { timeEstimateOptions } from '../../../options'
import { Effort, NextAction, Option, Tag } from '../../../types'
import { FilterList } from '@mui/icons-material'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { NextActionForm } from '../../NextActionForm/NextActionForm'

// TODO: support arbitrary tags
// TODO: check off actions with toast message with undo action on check
// TODO: empty message and no next actions with current filters message

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
  const [appliedFilters, setAppliedFilters] = useState<Tag[]>([])
  const [index, setIndex] = useState(0)

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
        // Sorting by priority asc, then time estimate desc, then effort desc
        nextActions.sort((a, b) => {
          if (a.priority === b.priority) {
            if (a.minutesEstimate === b.minutesEstimate) {
              return b.effort - a.effort
            }
            return (b.minutesEstimate ?? 0) - (a.minutesEstimate ?? 0)
          }
          return a.priority - b.priority
        })
      )
  }, [timeEstimate, effort])

  // use filteredNextActions as circular buffer and calculate index with modulo
  const nextActionsLength = filteredNextActions?.length ?? 0
  const nextActionsIndex = index % nextActionsLength

  const showingNextActions =
    filteredNextActions?.slice(nextActionsIndex, nextActionsIndex + 2) ?? []

  const [viewingAction, setViewingAction] = useState<NextAction | undefined>(
    undefined
  )

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
              variant={appliedFilters.length ? 'filled' : 'outlined'}
              sx={{
                marginLeft: 'auto',
                '.MuiChip-label': {
                  padding: '0 4px',
                },
              }}
            />
          </Stack>
          <List disablePadding>
            {showingNextActions.map((nextAction) => (
              <ListItem key={nextAction.id} disableGutters>
                <Checkbox edge="start" sx={{ mr: 1 }} />
                <Card
                  elevation={5}
                  sx={{ borderRadius: '15px', p: 2, width: '100%' }}
                  onClick={() => setViewingAction(nextAction)}
                >
                  <ListItemText
                    primary={nextAction.title}
                    secondary={nextAction.description}
                    secondaryTypographyProps={{
                      sx: {
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        overflow: 'hidden',
                      },
                    }}
                    sx={{ m: 0 }}
                  />
                </Card>
              </ListItem>
            ))}
          </List>
          <Button
            onClick={() => setIndex((i) => i + 2)}
            sx={{ alignSelf: 'flex-end' }}
          >
            New Options
          </Button>
        </>
      ) : (
        <NextActionForm
          existingAction={viewingAction}
          onCancel={() => setViewingAction(undefined)}
          onSubmit={(updatedNextAction) => {
            db.nextActions.update(viewingAction.id!, updatedNextAction)
            setViewingAction(undefined)
          }}
        />
      )}
    </Stack>
  )
}
