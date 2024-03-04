/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * The Google API key to use for the Google Maps API.
   */
  readonly VITE_GOOGLE_API_KEY: string;

  /**
   * The jwt Secret
   */
  readonly VITE_JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
