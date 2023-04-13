import { Stack, Typography } from '@mui/material'
import { HappyOtto } from '../Otto/HappyOtto'
import { type FC } from 'react'

export const OttoMessage: FC<{
  ottoComponent: React.ReactNode
  title: string
  message: string
}> = ({ ottoComponent, title, message }) => {
  return (
    <Stack
      sx={{ flexGrow: 1 }}
      spacing={4}
      alignItems="center"
      justifyContent="center"
    >
      {ottoComponent}
      <Typography variant="h4">{title}</Typography>
      <Typography variant="h5">{message}</Typography>
    </Stack>
  )
}
