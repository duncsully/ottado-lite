import { Button, List, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { HappyOtto } from '../../Otto/HappyOtto'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../db'
import { ConcernItem } from './ConcernItem/ConcernItem'
import { DefineDialog } from './DefineDialog/DefineDialog'

/*
TODO:
- Style for desktop
- Improve edit (flashes after submitting)
*/
export const ConcernsPage = () => {
  const concerns = useLiveQuery(() => db.concerns.toArray())

  const handleAdd = async (text: string) => {
    await db.concerns.add({ text, createdAt: Date.now() })
    setNewConcernKey((prev) => prev + 1)
  }

  const handleDelete = async (id: number) => {
    await db.concerns.delete(id)
  }

  const handleEditDone = async (id: number, newValue: string) => {
    if (newValue.trim()) {
      await db.concerns.update(id, { text: newValue })
    }
  }

  const [newConcernKey, setNewConcernKey] = useState(0)

  const [defineDialogOpen, setDefineDialogOpen] = useState(false)

  if (!concerns) return null

  return (
    <>
      <Stack justifyContent="space-between" gap={1} height="100%">
        {concerns.length ? (
          <>
            <List dense sx={{ overflow: 'auto', flexGrow: 1 }}>
              {concerns.map((concern) => (
                <ConcernItem
                  key={`${concern.id}_${concern.text}`}
                  initialValue={concern.text}
                  onDelete={() => handleDelete(concern.id!)}
                  onSubmit={(newValue) => handleEditDone(concern.id!, newValue)}
                />
              ))}
              <ConcernItem
                key={newConcernKey}
                initialValue=""
                onDelete={() => setNewConcernKey((prev) => prev + 1)}
                onSubmit={handleAdd}
              />
            </List>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginLeft: 'auto' }}
              onClick={() => setDefineDialogOpen(true)}
            >
              Start defining
            </Button>
          </>
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
            <ConcernItem
              key={newConcernKey}
              initialValue=""
              onDelete={() => setNewConcernKey((prev) => prev + 1)}
              onSubmit={handleAdd}
            />
          </Stack>
        )}
      </Stack>
      <DefineDialog
        open={defineDialogOpen}
        onClose={() => setDefineDialogOpen(false)}
      />
    </>
  )
}
