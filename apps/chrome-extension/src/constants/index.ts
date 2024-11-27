export const MESSAGE_EVENT_TYPES = {
  ADD_BOOKMARK: "addBookmark",
  VIEW_ALL_BOOKMARKS: "viewAllBookmarks",
  VIEW_SETTINGS: "viewSettings",
  VIEW_HELP: "viewHelp",
} as const;

export const SIDE_PANEL_PAGES = {
  HOME: "/",
  SETTINGS: "/settings",
  HELP: "/help",
} as const;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
