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
import CreateIcon from '@mui/icons-material/Create'
import MenuIcon from '@mui/icons-material/Menu'
import { AccountCircle } from '@mui/icons-material'
import { DefaultOtto } from '../Otto/DefaultOtto'
import { useState, type FC } from 'react'
import { ConcernsPage } from './ConcernsPage/ConcernsPage'

// TODO: Replace bottom nav with FAB?

export const HomeLayout: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  // TODO: Change to be hash based
  const [selectedIndex, setSelectedIndex] = useState(0)

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
            <IconButton
              size="large"
              edge="start"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Box mr={2} ml={-1}>
              <DefaultOtto width={40} />
            </Box>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              OttaDo
            </Typography>
            <div>
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
            </div>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ p: 2, pb: 9, flexGrow: 2, overflow: 'auto' }}>
        {
          [<div>Next Actions</div>, <ConcernsPage />, <div>Define</div>][
            selectedIndex
          ]
        }
      </Box>

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={selectedIndex}
          onChange={(_, newIndex) => setSelectedIndex(newIndex)}
        >
          <BottomNavigationAction
            label="Next Actions"
            icon={<PendingActionsIcon />}
          />
          <BottomNavigationAction label="Concerns" icon={<NotesIcon />} />
          <BottomNavigationAction label="Define" icon={<CreateIcon />} />
        </BottomNavigation>
      </Paper>
    </Paper>
  )
}
