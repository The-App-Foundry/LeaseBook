import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* Box sizing and root resets */
  *, *::before, *::after { box-sizing: border-box; }
  html, body, main, #root { height: 100%; margin: 0; padding: 0; }
  html { font-size: 16px; -webkit-text-size-adjust: 100%; }

  /* Base typography */
  body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 1rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text};
    background-color: #e4e8ecff;
    margin: 0;
    padding: 20px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }

  /* Headings */
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    line-height: 1.25;
    color: ${({ theme }) => theme.colors.text};
  }
  h1 { font-size: 1.5rem; line-height: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; }
  h5 { font-size: 1rem; }
  h6 { font-size: 0.875rem; }

  /* Common elements */
  p { margin: 0 0 1rem 0; }
  a { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; }
  a:hover, a:focus { text-decoration: underline; }

  ul, ol { margin: 0 0 1rem 0; padding-left: 1.25rem; }

  img, svg { max-width: 100%; height: auto; display: block; }

  /* Form elements should inherit font styles */
  button, input, textarea, select { font: inherit; color: inherit; background: transparent; border: none; }
  button { cursor: pointer; }

  /* Code styling */
  code, pre {
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.875em;
    background: rgba(0,0,0,0.03);
    padding: 0.2em 0.4em;
    border-radius: 6px;
  }

  /* Focus and accessibility */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
  }
`;
