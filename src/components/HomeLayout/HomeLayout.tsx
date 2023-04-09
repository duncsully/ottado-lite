import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import NotesIcon from '@mui/icons-material/Notes'
import MenuIcon from '@mui/icons-material/Menu'
import { AccountCircle } from '@mui/icons-material'
import { DefaultOtto } from '../Otto/DefaultOtto'
import { useEffect, useState, type FC } from 'react'
import { ConcernsPage } from './ConcernsPage/ConcernsPage'
import { NextActionsPage } from './NextActionsPage/NextActionsPage'

const getPageFromHash = () => {
  const pages = {
    '#next-actions': <NextActionsPage />,
    '#concerns': <ConcernsPage />,
  } as { [key: string]: JSX.Element }
  return pages[window.location.hash] ?? pages['#next-actions']
}

export const HomeLayout: FC = () => {
  /* const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  } */

  const [page, setPage] = useState(getPageFromHash())

  useEffect(() => {
    const hashChangeHandler = () => {
      setPage(getPageFromHash())
    }
    window.addEventListener('hashchange', hashChangeHandler)
    return () => {
      window.removeEventListener('hashchange', hashChangeHandler)
    }
  }, [])

  return (
    <Paper
      sx={{
        display: 'flex',
        flexFlow: 'column',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Box>
        <AppBar position="static">
          <Toolbar>
            {/* <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton> */}
            <Box mr={2}>
              <DefaultOtto width={40} />
            </Box>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              OttaDo
            </Typography>
            {/* <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={!!anchorEl}
                onClose={handleClose}
              >
                <MenuItem onClick={() => {}}>TODO</MenuItem>
              </Menu>
            </div> */}
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ p: 2, pt: 1, pb: 9, flexGrow: 2, overflow: 'auto' }}>
        {page}
      </Box>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
        elevation={3}
      >
        <BottomNavigation showLabels value={window.location.hash}>
          <BottomNavigationAction
            label="Next Actions"
            icon={<PendingActionsIcon />}
            href="#next-actions"
            value="#next-actions"
          />
          <BottomNavigationAction
            label="Concerns"
            icon={<NotesIcon />}
            href="#concerns"
            value="#concerns"
          />
        </BottomNavigation>
      </Paper>
    </Paper>
  )
}
