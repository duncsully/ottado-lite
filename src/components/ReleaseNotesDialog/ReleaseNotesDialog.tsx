import { FC, useState } from 'react'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import {
  Badge,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { Help, ImportExport, Notes } from '@mui/icons-material'
import { useReadReleaseNotes } from '../../utils/makeUseLocalStorage'

// TODO: Limit to most recent and have "show more" button
export const ReleaseNotesDialog: FC<{ open: boolean; onClose(): void }> = ({
  open,
  onClose,
}) => {
  // Tracks indices
  const [readNotes, setReadNotes] = useReadReleaseNotes()
  const [showingNotes, setShowingNotes] = useState<ReleaseNote | null>(null)
  return (
    <FullscreenDialog
      title="What's new"
      open={open}
      onClose={showingNotes ? () => setShowingNotes(null) : onClose}
      back={!!showingNotes}
    >
      {showingNotes ? (
        <Stack gap={1} p={2}>
          <Typography variant="h4">{showingNotes.title}</Typography>
          {showingNotes.content}
        </Stack>
      ) : (
        <Stack p={2}>
          <Button
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => {
              setReadNotes(
                Array.from({ length: releaseNotes.length }, (_, i) => i)
              )
            }}
          >
            Mark all read
          </Button>
          <List>
            {releaseNotes.reduceRight(
              (results, note, i) =>
                results.concat(
                  <ListItem
                    disableGutters
                    key={note.title}
                    onClick={() => {
                      setShowingNotes(note)
                      if (!readNotes.includes(i)) {
                        setReadNotes([...readNotes, i])
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        variant="dot"
                        color="primary"
                        invisible={readNotes.includes(i)}
                      >
                        {note.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={note.title}
                      secondary={new Date(note.date).toLocaleDateString()}
                    />
                  </ListItem>
                ),
              [] as React.ReactNode[]
            )}
          </List>
        </Stack>
      )}
    </FullscreenDialog>
  )
}

interface ReleaseNote {
  title: string
  date: string
  icon: React.ReactNode
  content: React.ReactNode
}

export const releaseNotes: readonly ReleaseNote[] = [
  {
    title: 'Help page',
    date: '2023/04/21',
    icon: <Help />,
    content: (
      <>
        <Typography>
          You can now access the help page by clicking/tapping on the account
          icon in the top right and selecting "Help" in the menu. There is a
          "Getting started" topic that goes over the basics. More topics will be
          added in the future.
        </Typography>
      </>
    ),
  },
  {
    title: 'Release notes',
    date: '2023/04/21',
    icon: <Notes />,
    content: (
      <>
        <Typography>
          OttaDo now has release notes! As you've probably already figured out,
          the bell icon in the top right will show a notification dot when there
          are updates. Click/tap on the bell icon to see what's new!
        </Typography>
      </>
    ),
  },
  /* {
    title: 'Import/Export',
    date: '2023/04/22',
    icon: <ImportExport />,
    content: (
      <>
        <Typography>
          You can now import and export your data! Click/tap on the account icon
          in the top right and select "Import/Export" in the menu. You can
          export your data as a JSON file, and import a JSON file to replace
          your current data. This is useful for backing up your data, or for
          moving your data to a new device.
        </Typography>
      </>
    ),
  }, */
] as const
