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
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    spacing: 8, // Base spacing unit (8px)
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // YouTube uses lowercase buttons
            borderRadius: 2,
            minHeight: 44, // Touch-friendly minimum height for mobile
            padding: '8px 16px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-root': {
              padding: '0 4px', // Reduced input padding
              '@media (max-width:599.95px)': {
                fontSize: '16px', // Prevent zoom on iOS when focusing inputs
              },
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            width: '100%', // Full width form controls
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '4px 8px', // Reduced from default 16px to use more space
            '@media (max-width:599.95px)': {
              padding: '8px 4px', // Slightly more padding on mobile for readability
              fontSize: '0.875rem',
            },
          },
          head: {
            backgroundColor: '#FF0000', // YouTube's signature red
            color: '#FFFFFF',
            fontWeight: 500,
            padding: '6px 8px', // Slightly more padding for headers
            '@media (max-width:599.95px)': {
              padding: '8px 4px',
              fontSize: '0.875rem',
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
      MuiContainer: {
        styleOverrides: {
          root: {
            '@media (max-width:599.95px)': {
              paddingLeft: 0,
              paddingRight: 0,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            '@media (max-width:599.95px)': {
              width: '100%',
              borderRadius: 0,
            },
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

