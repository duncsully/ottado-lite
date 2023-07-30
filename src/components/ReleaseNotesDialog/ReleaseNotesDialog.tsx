import { FC, useState } from 'react'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import {
  Badge,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import {
  DoNotDisturb,
  FilterList,
  Help,
  ImportExport,
  Notes,
  Search,
} from '@mui/icons-material'
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
                  <ListItemButton
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
                  </ListItemButton>
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
          You can now access the help page by clicking the account icon in the
          top right and selecting "Help" in the menu. There is a "Getting
          started" topic that goes over the basics. More topics will be added in
          the future.
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
          are updates. Click the bell icon to see what's new!
        </Typography>
      </>
    ),
  },
  {
    title: 'Import/Export',
    date: '2023/04/24',
    icon: <ImportExport />,
    content: (
      <>
        <Typography>
          You can now import and export your data! Click the account icon in the
          top right and select "Import/Export" in the menu. You can export your
          data as a JSON file, and import a JSON file to replace your current
          data. This is useful for backing up your data or moving your data to a
          different device.
        </Typography>
      </>
    ),
  },
  {
    title: 'Filter by tags',
    date: '2023/04/25',
    icon: <FilterList />,
    content: (
      <>
        <Typography>
          Your top five most commonly used tags are now shown along the top and
          can be used to filter your next actions! Additionally, the filter
          dialog's functionality has been adjusted to match the new tag
          filtering logic. Only next actions with at least one of the selected
          tags will be shown. Next actions of the same priority will be sorted
          in descending order by the amount of selected tags they have.
        </Typography>
      </>
    ),
  },
  {
    title: 'Search next actions',
    date: '2023/04/28',
    icon: <Search />,
    content: (
      <>
        <Typography>
          You can now search your next actions! Click the search icon in the top
          right on the Next Actions page to open the search dialog. You can
          toggle whether you want to search completed actions too.
        </Typography>
      </>
    ),
  },
  {
    title: 'Filter tag improvements',
    date: '2023/05/18',
    icon: <FilterList />,
    content: (
      <>
        <Typography>
          The tag filter chips at the top of the Next Actions page have been
          improved! Now your top five most <em>filtered by</em> tags will be
          shown (as opposed to top five most used tags).
        </Typography>
      </>
    ),
  },
  {
    title: 'Prerequisites',
    date: '2023/07/21',
    icon: <DoNotDisturb />,
    content: (
      <>
        <Typography>
          You can now add prerequisites to your next actions! These actions
          won't show up in your next actions list until their prerequisites are
          completed.
        </Typography>
      </>
    ),
  },
] as const
