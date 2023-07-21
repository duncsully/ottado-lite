import { useEffect, useState } from 'react'
import { releaseNotes } from '../components/ReleaseNotesDialog/ReleaseNotesDialog'

export const makeUseLocalStorage = <T>(
  key: string,
  initialValue: T | (() => T)
) => {
  const updaters = new Set<React.Dispatch<any>>()
  return () => {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key)
        // Parse stored json or if none return initialValue
        if (item) {
          return JSON.parse(item)
        }
        return initialValue instanceof Function ? initialValue() : initialValue
      } catch (error) {
        // If error also return initialValue
        console.log(error)
        return initialValue
      }
    })
    const setValue = (value: T | ((val: T) => T)) => {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      updaters.forEach((updater) => updater(valueToStore))
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(() => {
      updaters.add(setStoredValue)
      return () => {
        updaters.delete(setStoredValue)
      }
    }, [key])
    return [storedValue as T, setValue] as const
  }
}

// TODO: Put in DB so it can be exported?
export const useReadReleaseNotes = makeUseLocalStorage(
  'readNotes',
  // Start with all release notes "read"
  () => Array.from({ length: releaseNotes.length }, (_, i) => i) as number[]
)

export const useSearchIncludeCompleted = makeUseLocalStorage(
  'includeCompleted',
  false
)
