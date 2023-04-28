import { Card, Checkbox, ListItem, ListItemText } from '@mui/material'
import { NextAction } from '../../types'

export const NextActionItem: React.FC<{
  nextAction: NextAction
  onToggle?(): void
  onClick(): void
}> = ({ nextAction, onToggle, onClick }) => {
  return (
    <ListItem key={nextAction.id} disableGutters>
      {onToggle && (
        <Checkbox
          edge="start"
          sx={{ mr: 1 }}
          onChange={onToggle}
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
