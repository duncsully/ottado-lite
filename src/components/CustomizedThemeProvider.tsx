import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material'
import { useMemo, type FC, type ReactNode } from 'react'

// TODO: Support light mode
export const CustomizedThemeProvider: FC<{
  children: ReactNode
}> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark', //prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#FF9500',
          },
          secondary: {
            main: '#2F4858',
          },
        },
        components: {
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: '8px',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '20px',
              },
            },
          },
        },
      }),
    [prefersDarkMode]
  )

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
