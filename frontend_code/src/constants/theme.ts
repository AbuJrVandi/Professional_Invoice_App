import { createTheme, Theme } from '@rneui/themed';

export const theme = createTheme({
  lightColors: {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#38A169',
    error: '#E53E3E',
    warning: '#ED8936',
    grey0: '#1A202C',
    grey1: '#2D3748',
    grey2: '#4A5568',
    grey3: '#718096',
    grey4: '#A0AEC0',
    grey5: '#E2E8F0',
    background: '#F7FAFC',
    white: '#FFFFFF',
    black: '#000000',
  },
  darkColors: {
    primary: '#4361ee',
    secondary: '#3f37c9',
    success: '#48BB78',
    error: '#F56565',
    warning: '#ED8936',
    grey0: '#F7FAFC',
    grey1: '#EDF2F7',
    grey2: '#E2E8F0',
    grey3: '#CBD5E0',
    grey4: '#A0AEC0',
    grey5: '#2D3748',
    background: '#1A202C',
    white: '#FFFFFF',
    black: '#000000',
  },
  mode: 'light',
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
});

export type CustomTheme = typeof theme;

export const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.lightColors.background,
  },
  card: {
    borderRadius: 16,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    backgroundColor: theme.lightColors.white,
    shadowColor: theme.lightColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.lightColors.primary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.lightColors.secondary,
  },
  text: {
    fontSize: 16,
    marginBottom: theme.spacing.sm,
    color: theme.lightColors.black,
  },
  input: {
    marginBottom: theme.spacing.lg,
    borderRadius: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: theme.lightColors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
}; 