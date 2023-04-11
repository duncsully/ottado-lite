import {
  IconButton,
  InputAdornment,
  List,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FC, useState } from 'react'
import { HappyOtto } from '../../Otto/HappyOtto'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { ConcernItem } from './ConcernItem/ConcernItem'
import { Add } from '@mui/icons-material'

/*
TODO:
- Improve edit (flashes after submitting)
*/
export const ConcernsPage: FC = () => {
  const concerns = useLiveQuery(() => db.concerns.toArray())

  const [newConcernText, setNewConcernText] = useState('')
  const handleAdd = async () => {
    await db.concerns.add({ text: newConcernText, createdAt: Date.now() })
    setNewConcernText('')
  }

  const handleDelete = async (id: number) => {
    await db.concerns.delete(id)
  }

  const handleEditDone = async (id: number, newValue: string) => {
    if (newValue.trim()) {
      await db.concerns.update(id, { text: newValue })
    }
  }

  if (!concerns) return null

  return (
    <>
      <Stack justifyContent="space-between" gap={1} height="100%">
        {concerns.length ? (
          <List dense sx={{ overflow: 'auto', flexGrow: 1 }} disablePadding>
            {concerns.map((concern) => (
              <ConcernItem
                key={`${concern.id}_${concern.text}`}
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
            <Typography variant="h4">No concerns!</Typography>
            <Typography variant="h5">Add whatever is on your mind</Typography>
          </Stack>
        )}
        <TextField
          size="small"
          label="New concern"
          placeholder="What's on your mind?"
          variant="filled"
          value={newConcernText}
          onChange={(e) => setNewConcernText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAdd()
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={handleAdd}
                  disabled={!newConcernText.trim()}
                >
                  <Add />
                </IconButton>
              </InputAdornment>
            ),
          }}
          autoFocus
        />
      </Stack>
    </>
  )
}
