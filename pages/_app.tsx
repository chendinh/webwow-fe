import { useEffect } from 'react';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const themePreference = localStorage.getItem('theme');
    if (themePreference === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;