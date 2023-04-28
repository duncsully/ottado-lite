import { Card, Checkbox, ListItem, ListItemText } from '@mui/material'
import { NextAction } from '../../types'
import { db } from '../../db'

export const NextActionItem: React.FC<{
  nextAction: NextAction
  showCheckbox?: boolean
  onClick(): void
}> = ({ nextAction, showCheckbox, onClick }) => {
  const handleToggle = () => {
    db.nextActions.update(nextAction.id!, {
      completedAt: nextAction.completedAt ? 0 : Date.now(),
    })
  }
  return (
    <ListItem key={nextAction.id} disableGutters>
      {showCheckbox && (
        <Checkbox
          edge="start"
          sx={{ mr: 1 }}
          onChange={handleToggle}
          checked={!!nextAction.completedAt}
        />
      )}
      <Card
        elevation={5}
        sx={{ borderRadius: '15px', p: 2, width: '100%', cursor: 'pointer' }}
        onClick={onClick}
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
  )
}
