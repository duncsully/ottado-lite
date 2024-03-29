import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { CustomizedThemeProvider } from './components/CustomizedThemeProvider'
import { HomeLayout } from './components/HomeLayout/HomeLayout'
import { UpdateAvailableToast } from './components/UpdateAvailableToast/UpdateAvailableToast'
import { Router } from './components/Router/Router'

export function App() {
  return (
    <CustomizedThemeProvider>
      <UpdateAvailableToast />
      <Router />
    </CustomizedThemeProvider>
  )
}
