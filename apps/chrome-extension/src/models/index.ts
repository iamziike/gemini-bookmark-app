import { FormikHelpers } from "formik";
import { BOOKMARK_DESCRIPTIONS_STORE_KEY } from "../constants";
import { NodeModel } from "@minoru/react-dnd-treeview";

export type CustomObject = {
  [key: string]: string;
};

export type MessageData<T, D> = {
  type: T;
  data: D;
};

export type ApiResponse<T = CustomObject> = {
  data: T;
};

export type ApiPaginatedResponse<T = CustomObject> = {
  data: T | null;
  page: number;
  totalRecords: number;
  pageSize: number;
  isPageEnd: boolean;
};

export type MessageEventCallbackListener =
  typeof chrome.runtime.onMessage.addListener;

export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

export type BookmarkNodeWithoutChildren = Omit<
  chrome.bookmarks.BookmarkTreeNode,
  "children"
>;

export type CreateBookmarkNode = chrome.bookmarks.BookmarkTreeNode & {
  type: "folder" | "url";
};

export type UpdateBookmarkNode = CreateBookmarkNode;

export type CachedBookmarkDescriptionContent = {
  [id: string]: {
    description: string | null;
    url: string;
    title: string;
    bookmarkCreatedAt: string;
  };
};

export type GetBookmarkDescriptionFromGemini =
  CachedBookmarkDescriptionContent[string] & {
    id: string;
  };

export type CachedBookmarkDescription = {
  [key in typeof BOOKMARK_DESCRIPTIONS_STORE_KEY]: CachedBookmarkDescriptionContent;
};

export type BookmarkCreateNode = chrome.bookmarks.BookmarkCreateArg;

export type FormikHandler<T> = (
  values: T,
  formikHelpers: FormikHelpers<T>
) => void;

export type BOOKMARK_UPLOAD_STATE = {
  state: "PENDING" | "COMPLETED";
  isUserSeenStateBefore: boolean;
  isDisplayedCompleteModalBefore: boolean;
};

export type DragAndDropNode = NodeModel & {
  data: Pick<
    BookmarkNode,
    "url" | "unmodifiable" | "dateAdded" | "dateGroupModified" | "index"
  >;
};
