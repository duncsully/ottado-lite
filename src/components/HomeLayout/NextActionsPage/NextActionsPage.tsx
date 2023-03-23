import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
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
import { NextActionItem } from './NextActionItem/NextActionItem'

// TODO: support arbitrary tags
// TODO: empty message and no next actions with current filters message
// TODO: Expandable for completed items

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
          <Divider sx={{ my: 1 }} />
          {completedTodayNextActions?.map((nextAction) => (
            <NextActionItem
              key={nextAction.id}
              nextAction={nextAction}
              onToggle={() => handleToggle(nextAction)}
              onClick={() => setViewingAction(nextAction)}
              checked
            />
          ))}
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
