import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // Define your custom color palette
  colors: {
    'dark-olive': [
      '#F0F2E9', '#DDE3C8', '#C9D4A7', '#B6C685', '#A2B863', 
      '#8F9C41', '#7B8130', '#686623', '#554C1A', '#423A10'
    ],
    'lime-green': [
      '#F2FFF2', '#E0FFE0', '#D0FFD0', '#C0FFC0', '#B0FFB0', 
      '#A0FFB0', '#90FFA0', '#80FFB0', '#70FFC0', '#60FFD0'
    ],
  },
  
  // Set the primary color for the theme
  primaryColor: 'dark-olive',

  // Define global font styles
  fontFamily: 'Roboto Flex, sans-serif',
  headings: {
    fontFamily: 'Roboto Flex, sans-serif',
    fontWeight: '500', 
  },
});
