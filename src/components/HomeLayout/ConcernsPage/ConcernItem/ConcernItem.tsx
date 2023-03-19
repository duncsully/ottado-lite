import {
  IconButton,
  InputAdornment,
  ListItem,
  OutlinedInput,
} from '@mui/material'
import { useState, type FC } from 'react'
import { Delete } from '@mui/icons-material'

// TODO: Only show delete button when focused
// TODO: Add background color to theme
// TODO: Don't show input outline

export const ConcernItem: FC<{
  initialValue: string
  onSubmit: (newValue: string) => void
  onDelete: () => void
}> = ({ initialValue, onSubmit, onDelete }) => {
  const [value, setValue] = useState(initialValue)
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newValue = (e.target as HTMLInputElement).value.trim()
      onSubmit(newValue)
      ;(e.currentTarget as HTMLElement).blur()
    }
  }
  const [focused, setFocused] = useState(false)
  const handleBlur: React.FocusEventHandler = (e) => {
    setValue(initialValue)
    setFocused(false)
  }
  return (
    <ListItem
      disableGutters
      sx={{
        paddingRight: 0,
      }}
    >
      <OutlinedInput
        multiline
        value={value}
        onChange={(e) => setValue(e.target.value)}
        size="small"
        fullWidth
        onKeyDown={handleEditKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        endAdornment={
          <InputAdornment position="end">
            <IconButton edge="end" disabled={!focused} onClick={onDelete}>
              <Delete />
            </IconButton>
          </InputAdornment>
        }
        sx={{
          backgroundColor: 'rgba(138, 138, 143, 0.2)',
        }}
      />
    </ListItem>
  )
}
