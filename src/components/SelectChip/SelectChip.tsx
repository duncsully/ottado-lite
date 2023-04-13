import { Chip, Menu, MenuItem } from '@mui/material'
import { ArrowDropDown } from '@mui/icons-material/'
import { useRef, useState } from 'react'

interface Props<T> {
  value: T | undefined
  onChange: (value: T | undefined) => void
  options: T[] | readonly T[]
  getLabel: (value: T) => string
  label: string
  icon?: React.ReactElement<any, string | React.JSXElementConstructor<any>>
}

export const SelectChip = <T extends {}>({
  value,
  options,
  onChange,
  getLabel,
  label,
  icon,
}: Props<T>) => {
  const anchorEl = useRef(null)
  const [open, setOpen] = useState(false)
  const handleChipClick = () => {
    if (value) {
      onChange(undefined)
    } else {
      handleSelectClick()
    }
  }
  const handleSelectClick = () => {
    setOpen(true)
  }
  const handleClose = () => setOpen(false)
  const getHandleSelect = (value: T) => () => {
    onChange(value)
    handleClose()
  }

  return (
    <>
      <Chip
        variant={value ? 'filled' : 'outlined'}
        label={value ? getLabel(value) : label}
        icon={icon}
        deleteIcon={<ArrowDropDown />}
        onDelete={handleSelectClick}
        color={value ? 'secondary' : 'default'}
        onClick={handleChipClick}
        ref={anchorEl}
      />
      <Menu anchorEl={anchorEl.current} open={open} onClose={handleClose}>
        {options.map((option) => {
          const label = getLabel(option)
          return (
            <MenuItem
              dense
              key={label}
              onClick={getHandleSelect(option)}
              selected={option === value}
            >
              {label}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
