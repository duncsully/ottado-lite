import { Option } from './types'

export const minuteEstimates = [10, 30, 60, 60 * 2, 60 * 4, 60 * 8]
export const timeEstimateOptions: Option<number>[] = minuteEstimates.map(
  (minutes) => {
    const hours = minutes / 60
    const text =
      hours >= 1
        ? `${hours} hour${hours === 1 ? '' : 's'}`
        : `${minutes} minutes`
    return {
      value: minutes,
      text,
    }
  }
)
