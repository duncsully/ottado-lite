import { Button, Card, IconButton, Stack, Typography } from '@mui/material'
import { FC, useEffect } from 'react'
import { NextActionForm } from '../../../NextActionForm/NextActionForm'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../../db'
import { NextAction } from '../../../../types'
import { Delete } from '@mui/icons-material'
import { HappyOtto } from '../../../Otto/HappyOtto'

/* TODO
- Add to calendar
*/
export const DefineView: FC<{ onCancel(): void }> = ({ onCancel }) => {
  const concerns = useLiveQuery(() => db.concerns.toArray())

  const topConcern = concerns?.[0]

  const handleDelete = async () => {
    if (!topConcern) return
    db.concerns.delete(topConcern.id!)
  }

  const handleSubmit = async (nextAction: NextAction) => {
    if (!topConcern) return
    db.transaction('rw', db.nextActions, db.concerns, db.tags, async () => {
      const tagUpdates = nextAction.tags.map((tag) => {
        const query = db.tags.where('name').equals(tag)
        return query.count((count) => {
          if (count === 0) {
            return db.tags.add({ name: tag, usedCount: 1 })
          }
          return query.modify({ usedCount: count + 1 })
        })
      })
      return Promise.all([
        ...tagUpdates,
        db.nextActions.add(nextAction),
        db.concerns.delete(topConcern.id!),
      ])
    })
  }

  return (
    <Stack gap="1rem" height="100%">
      {concerns && concerns.length ? (
        <>
          <Typography sx={{ alignSelf: 'center' }}>
            {concerns.length} left
          </Typography>
          <Card elevation={5} sx={{ borderRadius: '15px', p: '1rem' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography>{topConcern?.text}</Typography>
              <IconButton
                edge="end"
                onClick={handleDelete}
                sx={{ p: '0 0.5rem' }}
              >
                <Delete sx={{ pt: 0, pb: 0 }} />
              </IconButton>
            </Stack>
          </Card>
          <NextActionForm
            onSubmit={handleSubmit}
            onCancel={onCancel}
            key={topConcern?.id}
          />
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
            You've defined all your concerns!
          </Typography>
          <Button href="#next-actions">View next actions</Button>
        </Stack>
      )}
    </Stack>
  )
}
