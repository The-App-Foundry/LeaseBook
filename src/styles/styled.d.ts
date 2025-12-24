import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      background: string;
      text: string;
      surface: string;
      muted: string;
      border: string;
      success: string;
      danger: string;
      focus: string;
    };
    fonts: {
      body: string;
      mono: string;
    };
    radii: {
      sm: string;
      md: string;
      lg: string;
    };
  }
}
