import { useState, type FC, useDeferredValue, useMemo } from 'react'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import {
  Box,
  FormControlLabel,
  List,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { Search } from '@mui/icons-material'
import { useLiveQuery } from 'dexie-react-hooks'
import { useSearchIncludeCompleted } from '../../utils/makeUseLocalStorage'
import { db } from '../../db'
import { NextActionItem } from '../NextActionItem/NextActionItem'
import { type NextAction } from '../../types'
import { OttoMessage } from '../OttoMessage/OttoMessage'
import { ConcernedOtto } from '../Otto/ConcernedOtto'

// TODO: Emphasize the search text in the results
export const SearchNextActionsDialog: FC<{
  open: boolean
  onClose(): void
  onClickNextAction(nextAction: NextAction): void
}> = ({ open, onClose, onClickNextAction }) => {
  const [searchText, setSearchText] = useState('')
  const deferredSearchText = useDeferredValue(searchText.toLowerCase())

  const [includeCompleted, setIncludeCompleted] = useSearchIncludeCompleted()
  const nextActions = useLiveQuery(
    () =>
      // It complains about returning undefined manually, but it's intentional and works
      // @ts-ignore
      searchText.trim()
        ? db.nextActions
            .filter((nextAction) => {
              if (!includeCompleted && nextAction.completedAt) return false
              return nextAction.title.toLowerCase().includes(deferredSearchText)
            })
            .toArray()
        : undefined,
    [includeCompleted, deferredSearchText]
  )
  // Sort by how early the search text appears in the title
  const sortedNextActions = useMemo(
    () =>
      nextActions?.sort(
        (a, b) =>
          a.title.toLowerCase().indexOf(deferredSearchText) -
          b.title.toLowerCase().indexOf(deferredSearchText)
      ) ?? [],
    [nextActions]
  )
  return (
    <FullscreenDialog open={open} onClose={onClose} title="Search next actions">
      <Stack p={2} gap={1}>
        <TextField
          type="search"
          InputProps={{ startAdornment: <Search /> }}
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              checked={includeCompleted}
              onChange={() => setIncludeCompleted((current) => !current)}
            />
          }
          label="Include completed"
        />
        <List disablePadding>
          {sortedNextActions.map((nextAction) => (
            <NextActionItem
              key={nextAction.id}
              nextAction={nextAction}
              showCheckbox
              onClick={() => onClickNextAction(nextAction)}
            />
          ))}
        </List>
        {!!searchText.trim() && nextActions?.length === 0 && (
          // Hacky way to roughly center the message
          <Box alignSelf="center" position="absolute" top="40%">
            <OttoMessage ottoComponent={<ConcernedOtto />} title="No results" />
          </Box>
        )}
      </Stack>
    </FullscreenDialog>
  )
}
