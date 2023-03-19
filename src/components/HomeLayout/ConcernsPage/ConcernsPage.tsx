import {
  Box,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { useRef, useState } from 'react'
import { HappyOtto } from '../../Otto/HappyOtto'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { ConcernItem } from './ConcernItem/ConcernItem'

/*
TODO:
- Prevent delete on hidden X
- Style for desktop
*/
export const ConcernsPage = () => {
  const concerns = useLiveQuery(() => db.concerns.toArray())
  const loading = concerns === undefined
  const [newConcern, setNewConcern] = useState('')

  const listRef = useRef<HTMLUListElement>(null)

  const scrollTo = () => {
    listRef.current?.scrollTo(0, listRef.current?.scrollHeight)
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNewConcern(e.target.value)
  }

  const handleKeyDown: React.KeyboardEventHandler = async (e) => {
    if (e.key === 'Enter' && newConcern.trim()) {
      try {
        await db.concerns.add({
          text: newConcern,
          createdAt: Date.now(),
        })
        setNewConcern('')
        // TODO: Improve this
        // Need page to refresh with new data
        setTimeout(scrollTo, 50)
      } catch (e) {
        console.error(e)
        throw e
      }
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await db.concerns.delete(id)
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const handleEditDone = async (id: number, newValue: string) => {
    if (newValue) {
      try {
        await db.concerns.update(id, { text: newValue })
      } catch (e) {
        console.error(e)
        throw e
      }
    }
  }

  // TODO: Improve calculation
  const skeletonItemsAmount = Math.floor(
    (listRef.current?.scrollHeight ?? 0) / 38
  )

  return (
    <Stack sx={{ height: '100%' }} justifyContent="space-between">
      {loading ? (
        Array.from({ length: skeletonItemsAmount }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            height={'32px'}
            sx={{ margin: ' 4px 16px' }}
          />
        ))
      ) : (
        <>
          {concerns.length ? (
            <List dense sx={{ overflow: 'auto', flexGrow: 1 }} ref={listRef}>
              {concerns.map((concern) => (
                <ConcernItem
                  key={concern.text}
                  initialValue={concern.text}
                  onDelete={() => handleDelete(concern.id!)}
                  onSubmit={(newValue) => handleEditDone(concern.id!, newValue)}
                />
              ))}
            </List>
          ) : (
            <Stack
              sx={{ flexGrow: 1 }}
              spacing={4}
              alignItems="center"
              justifyContent="center"
            >
              <HappyOtto />
              <Typography variant="h5">
                No concerns at the moment. Add whatever is on your mind!
              </Typography>
            </Stack>
          )}
          <Box>
            <TextField
              label="New concern"
              variant="filled"
              value={newConcern}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              fullWidth
            />
          </Box>
        </>
      )}
    </Stack>
  )
}
