import {
  Autocomplete,
  Button,
  InputAdornment,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import {
  FormEventHandler,
  useState,
  type ReactNode,
  type FC,
  useMemo,
} from 'react'
import { Effort, NextAction, Priority } from '../../types'
import {
  Notes,
  Schedule,
  FitnessCenter,
  PriorityHigh,
  LocalOffer,
  Title,
  Save,
  Add,
  DoNotDisturb,
} from '@mui/icons-material'
import { timeEstimateOptions } from '../../options'
import { db } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

const timeEstimateItems = timeEstimateOptions.map(({ value, text }) => (
  <MenuItem key={value} value={value}>
    {'< ' + text}
  </MenuItem>
))

const effortItems = Object.entries(Effort).reduce((options, [text, value]) => {
  if (isNaN(+text)) {
    options.push(
      <MenuItem key={value} value={value}>
        {text}
      </MenuItem>
    )
  }
  return options
}, [] as ReactNode[])

const priorityItems = Object.entries(Priority).reduce(
  (options, [text, value]) => {
    if (isNaN(+text)) {
      options.push(
        <MenuItem key={value} value={value}>
          {text}
        </MenuItem>
      )
    }
    return options
  },
  [] as ReactNode[]
)

export const NextActionForm: FC<{
  existingAction?: NextAction
  onSubmit(nextAction: NextAction): void
}> = ({ existingAction, onSubmit }) => {
  const tags = useLiveQuery(() => db.tags.toArray())

  const handleTagChange = (_: React.SyntheticEvent, value: string[]) => {
    setSelectedTags(value)
  }

  const [actionTitle, setActionTitle] = useState(existingAction?.title ?? '')
  const [description, setDescription] = useState(
    existingAction?.description ?? ''
  )
  const [minutesEstimate, setMinutesEstimate] = useState<number | undefined>(
    existingAction?.minutesEstimate
  )
  const [effort, setEffort] = useState(existingAction?.effort ?? Effort.Low)
  const [priority, setPriority] = useState(
    existingAction?.priority ?? Priority.Lowest
  )
  const [selectedTags, setSelectedTags] = useState(
    existingAction?.tags ?? ([] as string[])
  )

  const incompleteNextActions = useLiveQuery(() =>
    db.nextActions.where('completedAt').equals(0).toArray()
  )

  const [dependencies, setDependencies] = useState(
    existingAction?.dependencies ?? []
  )

  const isDirty =
    existingAction?.title !== actionTitle.trim() ||
    existingAction?.description !== description ||
    existingAction?.minutesEstimate !== minutesEstimate ||
    existingAction?.effort !== effort ||
    existingAction?.priority !== priority ||
    existingAction?.tags.length !== selectedTags.length ||
    existingAction?.tags.some((tag, i) => tag !== selectedTags[i]) ||
    existingAction?.dependencies.length !== dependencies.length ||
    existingAction?.dependencies.some((dep, i) => dep !== dependencies[i])

  const canSubmit = !!actionTitle.trim() && (!existingAction || isDirty)

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    onSubmit({
      title: actionTitle.trim(),
      description,
      minutesEstimate,
      effort,
      priority,
      tags: selectedTags,
      createdAt: existingAction?.createdAt ?? Date.now(),
      completedAt: existingAction?.completedAt ?? 0,
      dependencies,
    })
  }
  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="1rem">
        <TextField
          label="Action title"
          value={actionTitle}
          onChange={(e) => setActionTitle(e.target.value)}
          variant="filled"
          size="small"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Title />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="filled"
          size="small"
          fullWidth
          multiline
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {/* hack to align the icon for multiline input*/}
                <Notes sx={{ mt: '-16px' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Estimated time"
          value={minutesEstimate ?? ''}
          onChange={(e) => setMinutesEstimate(+e.target.value || undefined)}
          variant="filled"
          size="small"
          fullWidth
          select
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Schedule />
              </InputAdornment>
            ),
          }}
        >
          {timeEstimateItems}
        </TextField>
        <TextField
          label="Effort"
          value={effort}
          onChange={(e) => setEffort(+e.target.value as Effort)}
          variant="filled"
          size="small"
          fullWidth
          select
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FitnessCenter />
              </InputAdornment>
            ),
          }}
        >
          {effortItems}
        </TextField>
        <TextField
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(+e.target.value as Priority)}
          variant="filled"
          size="small"
          fullWidth
          select
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PriorityHigh />
              </InputAdornment>
            ),
          }}
        >
          {priorityItems}
        </TextField>

        <Autocomplete
          value={selectedTags}
          onChange={handleTagChange}
          options={tags?.map((tag) => tag.name) ?? ([] as string[])}
          loading={!tags}
          size="small"
          fullWidth
          multiple
          freeSolo
          autoComplete
          autoHighlight
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              variant="filled"
              label="Tags"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <LocalOffer sx={{ mt: '-16px' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <Autocomplete
          multiple
          options={incompleteNextActions ?? ([] as NextAction[])}
          loading={!incompleteNextActions}
          getOptionLabel={(option) => option.title}
          value={
            incompleteNextActions?.filter((nextAction) =>
              dependencies.includes(nextAction.id!)
            ) ?? ([] as NextAction[])
          }
          onChange={(_, value) => {
            setDependencies(value.map((nextAction) => nextAction.id!))
          }}
          size="small"
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              variant="filled"
              label="Prerequisites"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <DoNotDisturb sx={{ mt: '-16px' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Stack direction="row">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!canSubmit}
            fullWidth
            startIcon={existingAction ? <Save /> : <Add />}
          >
            {existingAction ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}
