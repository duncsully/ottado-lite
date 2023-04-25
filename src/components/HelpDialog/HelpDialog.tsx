import { FC, useState } from 'react'
import { FullscreenDialog } from '../FullscreenDialog/FullscreenDialog'
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { Help } from '@mui/icons-material'

// TODO: Add search
export const HelpDialog: FC<{ open: boolean; onClose(): void }> = ({
  open,
  onClose,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null)
  return (
    <>
      <FullscreenDialog
        title="Help"
        open={open}
        onClose={selectedTopic ? () => setSelectedTopic(null) : onClose}
        back={!!selectedTopic}
      >
        {selectedTopic ? (
          <Box p={2}>
            <Stack gap={1}>
              <Typography variant="h4">{selectedTopic}</Typography>
              {helpTopics[selectedTopic]}
            </Stack>
          </Box>
        ) : (
          <>
            <Typography variant="h6" p={2}>
              Topics
            </Typography>
            <List>
              {Object.entries(helpTopics).map(([title, content]) => (
                <ListItem
                  key={title}
                  onClick={() => setSelectedTopic(title as HelpTopic)}
                >
                  <ListItemIcon>
                    <Help />
                  </ListItemIcon>
                  <ListItemText primary={title} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </FullscreenDialog>
    </>
  )
}

type HelpTopic = keyof typeof helpTopics

// TODO: Expand on topics and split out "Getting Started" into subtopics
const helpTopics = {
  'Getting started': (
    <>
      <Typography variant="body1">
        Let's go over the basics! First, we need to go over a couple terms:
      </Typography>
      <ul>
        <li>
          <b>Concern: </b>Anything that occupies space in your mind. It can be
          as concrete as a task you know you have to do or as abstract as a
          nagging sensation that you're not satisfied with some aspect of your
          life. Leaving these concerns in your mind often causes anxiety. You
          can relieve a lot of that anxiety by putting your concerns into an
          external system, such as OttaDo!
        </li>
        <li>
          <b>Next action: </b>A clearly defined task. Next actions can have
          various helpful details like estimated time and effort amounts, as
          well as arbitrary tags, to help sort them. This makes it easy to find
          the right next action to work on.
        </li>
      </ul>
      <Typography variant="body1">
        You are free to use OttaDo however you like, but here is the recommended
        process, based on the Getting Things Done methodology:
      </Typography>
      <ol>
        <li>
          <a href="#capture">Capture concerns</a>
        </li>
        <li>
          <a href="#clarify">Clarify concerns</a>
        </li>
        <li>
          <a href="#review">Review next actions</a>
        </li>
        <li>
          <a href="#productivity">Be productive!</a>
        </li>
      </ol>

      <Typography variant="h5" mt={1}>
        Capture concerns
      </Typography>
      <Typography variant="body1">
        You can list concerns on the Concerns page accessed via clicking the
        "Concerns" tab. It's recommended to add concerns as they come to you,
        getting them out of your head so you can continue to focus on other
        tasks. Add a concern by clicking the textbox at the bottom, typing in a
        concern, and pressing enter or clicking the plus button in the textbox.
      </Typography>
      <Typography variant="body1">
        You can click on a concern in the list to edit or delete it.
      </Typography>
      <Typography variant="h5" mt={1}>
        Clarify concerns
      </Typography>
      <Typography variant="body1">
        It's recommended to go through your concerns list on a regular basis
        when you have the time and energy to do so. You can start the process by
        clicking the large pencil button on the Concerns page on the bottom
        right. This will open a view where you will handle each concern one at a
        time. If a concern is no longer relevant, you can delete it by clicking
        the three dots menu button in the top right, and then click delete.
        Otherwise, you can define a next action with the "Define a next action"
        button.
      </Typography>
      <Typography variant="body1">
        To define an action, all that is required is a title. It should be
        descriptive enough that you can easily understand what the action is.
        You can also add a description with more details. It's highly recommend
        that you also add an estimated time and effort amounts. These will help
        you filter next actions later. Additionally, you can add any tags you
        want. When you've finished defining the action, click the add button.
      </Typography>
      <Typography variant="body1">
        You can add as many next actions as you want to a concern. You can also
        click a next action to edit or delete it. When you're done defining,
        click the "Done with concern" button to move onto the next concern.
        Repeat the process until you've handled all of your concerns.
      </Typography>

      <Typography variant="h5" mt={1}>
        Review next actions
      </Typography>
      <Typography variant="body1">
        You can review your next actions on the Next Actions page accessed via
        clicking the "Next Actions" tab. You should check this page whenever you
        have a spare moment.
      </Typography>
      <Typography variant="body1">
        By default, you will see your two highest priority next actions. Only
        two items are shown so as not to overwhelm you. You can see the next two
        highest priority actions by clicking the "New options" button.
        Alternatively, you can click the "Show all" button to see all of your
        next actions. You can filter what next actions are shown by clicking the
        Effort and/or Time buttons and selecting the desired values.
        Additionally, clicking the button in the top right will allow you to
        sort next actions within their priorities by the amount of matching
        tags.
      </Typography>
      <Typography variant="body1">
        Click on a next action to see more details and edit it. You can delete
        the next action by clicking the three dots menu button in the top right,
        and then click delete.
      </Typography>

      <Typography variant="h5" mt={1}>
        Be productive!
      </Typography>
      <Typography variant="body1">
        After filtering your next actions, you should be able to find one you
        can do. Get it done and then just click/press the checkbox next to the
        next action to mark it as done. Any actions you finish will be moved to
        the "finished today" list below. You can uncheck the box to move it
        back. See how many you can finish in a day!
      </Typography>
    </>
  ),
} as const
