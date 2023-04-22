import {
  IconButton,
  InputAdornment,
  ListItem,
  OutlinedInput,
} from '@mui/material'
import { useLayoutEffect, useRef, useState, type FC } from 'react'
import { Delete } from '@mui/icons-material'

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
      ;(e.currentTarget as HTMLElement).blur()
    }
  }
  const [focused, setFocused] = useState(false)
  const handleBlur: React.FocusEventHandler = (e) => {
    const newValue = (e.target as HTMLInputElement).value.trim()
    onSubmit(newValue)
    setFocused(false)
  }

  const inputRef = useRef<HTMLInputElement>(null)

  // TODO: improve scroll, doesn't go to bottom
  useLayoutEffect(() => {
    inputRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [])

  return (
    <ListItem
      disableGutters
      sx={{
        paddingRight: 0,
      }}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    >
      <OutlinedInput
        multiline
        placeholder="What's on your mind?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        size="small"
        fullWidth
        onKeyDown={handleEditKeyDown}
        autoFocus={!initialValue}
        endAdornment={
          focused && (
            <InputAdornment position="end">
              <IconButton edge="end" onMouseDown={onDelete}>
                <Delete />
              </IconButton>
            </InputAdornment>
          )
        }
        sx={{
          backgroundColor: 'rgba(138, 138, 143, 0.2)',
        }}
        ref={inputRef}
      />
    </ListItem>
  )
}
