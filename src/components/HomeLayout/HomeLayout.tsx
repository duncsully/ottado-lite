import {
  AppBar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  BottomNavigationActionProps,
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
  Search,
} from '@mui/icons-material'
import { DefaultOtto } from '../Otto/DefaultOtto'
import { useState, type FC, forwardRef } from 'react'
import { HelpDialog } from '../HelpDialog/HelpDialog'
import {
  ReleaseNotesDialog,
  releaseNotes,
} from '../ReleaseNotesDialog/ReleaseNotesDialog'
import { useReadReleaseNotes } from '../../utils/makeUseLocalStorage'
import { ImportExportDialog } from '../ImportExportDialog/ImportExportDialog'
import { SearchNextActionsDialog } from '../SearchNextActionsDialog/SearchNextActionsDialog'
import { EditActionDialog } from '../EditActionDialog/EditActionDialog'
import { type NextAction } from '../../types'
import { Link, Outlet, useLocation } from 'react-router-dom'

export const HomeLayout: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const tabId = useLocation().pathname

  const [helpDialogOpen, setHelpDialogOpen] = useState(false)

  const [importExportDialogOpen, setImportExportDialogOpen] = useState(false)

  const [readReleaseNotes] = useReadReleaseNotes()
  const unreadReleaseNotes = releaseNotes.length - readReleaseNotes.length
  const [releaseNotesDialogOpen, setReleaseNotesDialogOpen] = useState(false)

  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  const [viewingAction, setViewingAction] = useState<NextAction | undefined>(
    undefined
  )

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
              {/* TODO: Improve logic for dynamic app bar */}
              {tabId === '/next-actions' && (
                <IconButton onClick={() => setSearchDialogOpen(true)}>
                  <Search />
                </IconButton>
              )}
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
          <Outlet />
        </Box>

        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}
          elevation={3}
        >
          <BottomNavigation showLabels value={tabId}>
            <BottomNavigationActionLink
              label="Next Actions"
              icon={<Checklist />}
              to="/next-actions"
              value="/next-actions"
            />
            <BottomNavigationActionLink
              label="Concerns"
              icon={<Lightbulb />}
              to="/concerns"
              value="/concerns"
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
      <SearchNextActionsDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onClickNextAction={setViewingAction}
      />
      <EditActionDialog
        action={viewingAction}
        onClose={() => setViewingAction(undefined)}
        back
      />
    </>
  )
}

// TODO: value doesn't seem to be working
const BottomNavigationActionLink: FC<
  BottomNavigationActionProps<'a'> & { to: string }
> = forwardRef(({ to, ...props }, ref) => (
  <BottomNavigationAction
    ref={ref}
    component={Link}
    to={to}
    value={to}
    {...props}
  />
))
