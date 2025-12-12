'use client'

import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  /* Font Imports - Optimized generic import, but realistically should be in layout.tsx via next/font */
  
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${(props) => props.theme.typography?.fontFamily.body || 'sans-serif'};
    background-color: ${(props) => props.theme.colors?.background};
    color: ${(props) => props.theme.colors?.text.primary};
    line-height: 1.6;
    transition: background-color 0.3s ease, color 0.3s ease;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${(props) => props.theme.typography?.fontFamily.heading || 'serif'};
    font-weight: 700;
    line-height: 1.2;
    color: ${(props) => props.theme.colors?.text.primary};
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }
`
