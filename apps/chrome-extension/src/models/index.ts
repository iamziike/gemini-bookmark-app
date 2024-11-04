import { MESSAGE_EVENT_TYPES } from "../constants";

export type MessageEventType =
  (typeof MESSAGE_EVENT_TYPES)[keyof typeof MESSAGE_EVENT_TYPES];

export type MessageData<T, D> = {
  type: T;
  data: D;
};

export type MessageEventCallbackListener =
  typeof chrome.runtime.onMessage.addListener;

export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;
