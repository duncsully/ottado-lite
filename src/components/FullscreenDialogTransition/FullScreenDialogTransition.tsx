import { Slide } from '@mui/material'
import { TransitionProps } from '@mui/material/transitions'
import { forwardRef } from 'react'

export const Transition = forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement
    },
    ref: React.Ref<unknown>
  ) => <Slide direction="up" ref={ref} {...props} />
)
