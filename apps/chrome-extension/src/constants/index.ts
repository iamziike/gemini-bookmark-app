export const SIDE_PANEL_PAGES = {
  HOME: "/",
  SETTINGS: "/settings",
  HELP: "/help",
} as const;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

export const MAX_GEMINI_REQUEST_PER_BATCH = 2;

export const BOOKMARK_DESCRIPTIONS_STORE_KEY = "BOOKMARK_STORAGE_KEY";

export const INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY =
  "INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY";
