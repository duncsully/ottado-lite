import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { CustomizedThemeProvider } from './components/CustomizedThemeProvider'
import { HomeLayout } from './components/HomeLayout/HomeLayout'

export function App() {
  return (
    <CustomizedThemeProvider>
      <HomeLayout></HomeLayout>
    </CustomizedThemeProvider>
  )
}
