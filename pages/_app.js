import '../styles/globals.css';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '../lib/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics /> {/* Add this line */}
    </ThemeProvider>
  );
}