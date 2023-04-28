import { useEffect, useState } from 'react'

export const makeUseLocalStorage = <T>(key: string, initialValue: T) => {
  const updaters = new Set<React.Dispatch<any>>()
  return () => {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        // Get from local storage by key
        const item = window.localStorage.getItem(key)
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue
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

export const useReadReleaseNotes = makeUseLocalStorage(
  'readNotes',
  [] as number[]
)

export const useSearchIncludeCompleted = makeUseLocalStorage(
  'includeCompleted',
  false
)
