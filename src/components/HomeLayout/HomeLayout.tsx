import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  Fab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import { Add, Checklist, Lightbulb, Create } from '@mui/icons-material'
import { DefaultOtto } from '../Otto/DefaultOtto'
import { useEffect, useState, type FC } from 'react'
import { ConcernsPage } from './ConcernsPage/ConcernsPage'
import { NextActionsPage } from './NextActionsPage/NextActionsPage'
import { DefineDialog } from './ConcernsPage/DefineDialog/DefineDialog'

const getPageFromHash = () => {
  const pages = {
    '#next-actions': <NextActionsPage />,
    '#concerns': <ConcernsPage />,
  } as { [key: string]: JSX.Element }
  const page = pages[window.location.hash]
  if (!page) {
    location.hash = '#next-actions'
    return pages['#next-actions']
  }
  return page
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

  const [defineDialogOpen, setDefineDialogOpen] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
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
        <Box sx={{ p: 2, pb: 9, flexGrow: 2, overflow: 'auto' }}>{page}</Box>

        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
          elevation={3}
        >
          <BottomNavigation showLabels value={window.location.hash}>
            <BottomNavigationAction
              label="Next Actions"
              icon={<Checklist />}
              href="#next-actions"
              value="#next-actions"
            />
            <Fab
              color="primary"
              sx={{ position: 'relative', top: '-5px' }}
              onClick={() => setDrawerOpen(true)}
            >
              <Add />
            </Fab>
            <BottomNavigationAction
              label="Concerns"
              icon={<Lightbulb />}
              href="#concerns"
              value="#concerns"
            />
          </BottomNavigation>
        </Paper>
      </Paper>
      <DefineDialog
        open={defineDialogOpen}
        onClose={() => setDefineDialogOpen(false)}
      />
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          <ListItem>
            <ListItemButton
              onClick={() => {
                setDefineDialogOpen(true)
                setDrawerOpen(false)
              }}
            >
              <ListItemIcon>
                <Create />
              </ListItemIcon>
              <ListItemText>Start defining</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  )
}
