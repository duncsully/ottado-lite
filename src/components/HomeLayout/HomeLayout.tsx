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
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export const HomeLayout: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const handleClose = () => {
    setAnchorEl(null)
  }

  const { pathname: tabId, hash, state } = useLocation()
  const navigate = useNavigate()
  const goBack = () => navigate(-1)

  const [readReleaseNotes] = useReadReleaseNotes()
  const unreadReleaseNotes = releaseNotes.length - readReleaseNotes.length

  const back = state?.back

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
                <IconButton href="#search-next-actions">
                  <Search />
                </IconButton>
              )}
              <IconButton href="#whats-new">
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
                    href="#import-export"
                    component="a"
                    onClick={() => {
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
                    href="#help"
                    component="a"
                    onClick={() => {
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

      <ReleaseNotesDialog open={hash === '#whats-new'} onClose={goBack} />
      <ImportExportDialog open={hash == '#import-export'} onClose={goBack} />
      <HelpDialog open={hash === '#help'} onClose={goBack} />
      <SearchNextActionsDialog
        open={hash === '#search-next-actions' || back}
        onClose={goBack}
        onClickNextAction={(nextAction) => {
          navigate(`/next-actions/${nextAction.id}`, { state: { back: true } })
        }}
      />
    </>
  )
}

// TODO: `value` from `to` doesn't seem to be working, need to pass directly as a prop
const BottomNavigationActionLink: FC<
  BottomNavigationActionProps<'a'> & { to: string }
> = forwardRef(({ to, ...props }, ref) => (
  <BottomNavigationAction
    ref={ref}
    component={Link}
    replace
    to={to}
    value={to}
    {...props}
  />
))
