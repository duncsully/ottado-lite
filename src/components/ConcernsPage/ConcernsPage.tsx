import {
  Fab,
  IconButton,
  InputAdornment,
  List,
  Stack,
  TextField,
  Zoom,
} from '@mui/material'
import { FC, useState } from 'react'
import { HappyOtto } from '../Otto/HappyOtto'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { Add, Create } from '@mui/icons-material'
import { OttoMessage } from '../OttoMessage/OttoMessage'
import { ConcernItem } from '../ConcernItem/ConcernItem'
import { DefineDialog } from '../DefineDialog/DefineDialog'

/*
TODO:
- Improve edit (flashes after submitting)
*/
export const ConcernsPage: FC = () => {
  const concerns = useLiveQuery(() => db.concerns.toArray())

  const [newConcernText, setNewConcernText] = useState('')
  const handleAdd = async () => {
    if (!newConcernText.trim()) return
    await db.concerns.add({
      text: newConcernText.trim(),
      createdAt: Date.now(),
    })
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

  const [defineDialogOpen, setDefineDialogOpen] = useState(false)

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
          <OttoMessage
            ottoComponent={<HappyOtto />}
            title="No concerns!"
            message="Add whatever is on your mind"
          />
        )}
        <Stack direction="row" gap={2}>
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
            sx={{ flexGrow: 1, alignSelf: 'flex-end' }}
          />
          <Zoom in>
            <Fab
              color="primary"
              sx={{ borderRadius: '16px' }}
              onClick={() => setDefineDialogOpen(true)}
            >
              <Create />
            </Fab>
          </Zoom>
        </Stack>
      </Stack>
      <DefineDialog
        open={defineDialogOpen}
        onClose={() => setDefineDialogOpen(false)}
      />
    </>
  )
}
