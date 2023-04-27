import {
  AppBar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  AccountCircle,
  Checklist,
  Help,
  ImportExport,
  Lightbulb,
  Notifications,
} from '@mui/icons-material'
import { DefaultOtto } from '../Otto/DefaultOtto'
import { useEffect, useState, type FC } from 'react'
import { ConcernsPage } from '../ConcernsPage/ConcernsPage'
import { NextActionsPage } from '../NextActionsPage/NextActionsPage'
import { HelpDialog } from '../HelpDialog/HelpDialog'
import {
  ReleaseNotesDialog,
  releaseNotes,
} from '../ReleaseNotesDialog/ReleaseNotesDialog'
import { useReadReleaseNotes } from '../../utils/makeUseLocalStorage'
import { ImportExportDialog } from '../ImportExportDialog/ImportExportDialog'

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
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

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

  const [helpDialogOpen, setHelpDialogOpen] = useState(false)

  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)

  const [readReleaseNotes] = useReadReleaseNotes()
  const unreadReleaseNotes = releaseNotes.length - readReleaseNotes.length
  const [releaseNotesDialogOpen, setReleaseNotesDialogOpen] = useState(false)

  return (
    <>
      <Paper
        sx={{
          display: 'flex',
          flexFlow: 'column',
          height: '100%',
          width: '100%',
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
              {/* TODO: Add "what's new" dialog */}
              <IconButton onClick={() => setReleaseNotesDialogOpen(true)}>
                <Badge badgeContent={unreadReleaseNotes} color="primary">
                  <Notifications />
                </Badge>
              </IconButton>
              <div>
                <IconButton
                  size="large"
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
                  <MenuItem
                    onClick={() => {
                      setImportExportDialogOpen(true)
                      setAnchorEl(null)
                    }}
                  >
                    <ListItemIcon>
                      <ImportExport />
                    </ListItemIcon>
                    <ListItemText>Import/Export</ListItemText>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      setHelpDialogOpen(true)
                      setAnchorEl(null)
                    }}
                  >
                    <ListItemIcon>
                      <Help />
                    </ListItemIcon>
                    <ListItemText>Help</ListItemText>
                  </MenuItem>
                </Menu>
              </div>
            </Toolbar>
          </AppBar>
        </Box>
        <Box sx={{ p: 2, pb: 1, mb: 8, flexGrow: 2, overflow: 'auto' }}>
          {page}
        </Box>

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
            <BottomNavigationAction
              label="Concerns"
              icon={<Lightbulb />}
              href="#concerns"
              value="#concerns"
            />
          </BottomNavigation>
        </Paper>
      </Paper>

      <ReleaseNotesDialog
        open={releaseNotesDialogOpen}
        onClose={() => setReleaseNotesDialogOpen(false)}
      />
      <ImportExportDialog
        open={importExportDialogOpen}
        onClose={() => setImportExportDialogOpen(false)}
      />
      <HelpDialog
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </>
  )
}
