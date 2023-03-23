import { Card, Checkbox, ListItem, ListItemText } from '@mui/material'
import { NextAction } from '../../../../types'

export const NextActionItem: React.FC<{
  nextAction: NextAction
  onToggle(): void
  checked?: boolean
  onClick(): void
}> = ({ nextAction, onToggle, checked, onClick }) => {
  return (
    <ListItem key={nextAction.id} disableGutters>
      <Checkbox
        edge="start"
        sx={{ mr: 1 }}
        onChange={onToggle}
        checked={checked}
      />
      <Card
        elevation={5}
        sx={{ borderRadius: '15px', p: 2, width: '100%' }}
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
