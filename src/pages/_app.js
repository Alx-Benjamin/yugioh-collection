// pages/_app.js
import '../../src/style.css';
import Navbar from '../components/NavBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a custom theme
const theme = createTheme({
  palette: {
    // Customize your theme colors here
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      <>
        <Navbar />
        <Component {...pageProps} />
      </>
    </ThemeProvider>
  );
}

export default MyApp;