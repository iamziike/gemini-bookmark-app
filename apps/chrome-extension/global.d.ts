/// <reference types="react-scripts" />
/// <reference types="chrome"/>

declare module "*.svg" {
  const content: string;

  export default content;
}

declare module "*.css" {
  const content: {
    [key: string]: string;
  };

  export default content;
}

declare module "*.jpg" {
  const content: string;

  export default content;
}

declare module "*.png" {
  const content: string;

  export default content;
}

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_GEMINI_API_KEY: string;
  }
}

type CustomSearchParams = "search";

interface URLSearchParams {
  get(name: CustomSearchParams): string | null;
  set(name: CustomSearchParams, value: string): void;
}
