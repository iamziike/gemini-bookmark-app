import { FormikHelpers } from "formik";
import { MESSAGE_EVENT_TYPES } from "../constants";
import { BOOKMARK_STORAGE_KEY } from "@constants/index";

export type MessageEventType =
  (typeof MESSAGE_EVENT_TYPES)[keyof typeof MESSAGE_EVENT_TYPES];

export type MessageData<T, D> = {
  type: T;
  data: D;
};

export type MessageEventCallbackListener =
  typeof chrome.runtime.onMessage.addListener;

export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

export type CreateBookmarkNode = chrome.bookmarks.BookmarkTreeNode & {
  type: "folder" | "url";
};

export type UpdateBookmarkNode = CreateBookmarkNode;

export type BookmarkDescriptionResult = {
  [BOOKMARK_STORAGE_KEY]: {
    [id: string]: {
      description: string;
      url: string;
    };
  };
};

export type BookmarkCreateNode = chrome.bookmarks.BookmarkCreateArg;

export type FormikHandler<T> = (
  values: T,
  formikHelpers: FormikHelpers<T>
) => void;