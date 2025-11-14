'use client';

import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useThemeStore } from '@/config/theme-store';

const createAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#FF0000', // YouTube's signature red
        light: '#FF3333', // Lighter red for hover states
        dark: '#CC0000', // Darker red for active states
        contrastText: '#FFFFFF', // White text on red background
      },
      secondary: {
        main: '#606060', // YouTube's secondary gray
        contrastText: '#FFFFFF',
      },
      error: {
        main: '#CC0000', // Darker red for errors
      },
      warning: {
        main: '#FFA500', // Orange for warnings
      },
      info: {
        main: '#1E88E5', // Blue for info
      },
      success: {
        main: '#34A853', // YouTube's green/success color
      },
      background: {
        default: isDark ? '#121212' : '#F5F5F5', // Slightly grey in light mode to differentiate from white components
        paper: isDark ? '#1E1E1E' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#FFFFFF' : '#000000',
        secondary: isDark ? '#AAAAAA' : '#606060', // YouTube's secondary text color
      },
    },
    typography: {
      fontFamily: '"Roboto", "Arial", sans-serif', // YouTube's font
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // YouTube uses lowercase buttons
            borderRadius: 2,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '4px 8px', // Reduced from default 16px to use more space
          },
          head: {
            backgroundColor: '#FF0000', // YouTube's signature red
            color: '#FFFFFF',
            fontWeight: 500,
            padding: '6px 8px', // Slightly more padding for headers
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              padding: '0 4px', // Reduced input padding
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1a1a1a', // Dark background for header
            color: '#FFFFFF', // White text for header
          },
        },
      },
    },
  });
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((state) => state.mode);
  const theme = createAppTheme(mode);
  
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}

