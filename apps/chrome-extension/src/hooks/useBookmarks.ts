import useCustomAlert from "@components/CustomAlert/useCustomAlert";
import { INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY } from "../constants";
import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import {
  deleteABookmarkedDescription,
  generateBookmarkDescriptions,
  getInitialBookmarkDescriptionGenerateState,
  isBookmarkALink,
  searchBookmarkDescriptions,
  setInitialBookmarkDescriptionGenerateState,
} from "../services/bookmark";
import {
  BookmarkNode,
  CreateBookmarkNode,
  UpdateBookmarkNode,
} from "../models";

const bookmarksAtom = atom<{
  quantity: number;
  list: BookmarkNode[];
  isFetching: boolean;
}>({
  quantity: 0,
  list: [],
  isFetching: true,
});

const useBookmarks = (props?: { fetchBookmarks: boolean }) => {
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom);

  const { showWarningAlert, showSuccessAlert } = useCustomAlert();

  const checkInitialBookmarkDescriptionGenerateState = async () => {
    const response = await getInitialBookmarkDescriptionGenerateState();

    if (!response?.isUserSeenStateBefore && response?.state === "PENDING") {
      setInitialBookmarkDescriptionGenerateState({
        isUserSeenStateBefore: true,
      });
      showWarningAlert({
        content: {
          title: "Processing Existing Bookmarks",
          message:
            "We are currently processing all your existing bookmarks. This may take some time but we will update you when it's done",
        },
      });
    }

    if (
      !response?.isDisplayedCompleteModalBefore &&
      response?.state === "PENDING"
    ) {
      chrome.storage.local.onChanged.addListener((changes) => {
        if (
          changes[INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY]?.newValue
            ?.state === "COMPLETED"
        ) {
          setInitialBookmarkDescriptionGenerateState({
            isDisplayedCompleteModalBefore: true,
          });
          showSuccessAlert({
            content: {
              title: "All Bookmarks Processed 😉",
            },
          });
        }
      });
    }
  };

  const getBookmarks = () => {
    setBookmarks((prev) => ({ ...prev, isFetching: true }));

    const getBookmarkQuantity = (nodes: BookmarkNode[]) => {
      let bookmarksQuantity = 0;

      function countBookmarks(nodes: BookmarkNode[]) {
        nodes.forEach((node) => {
          // Count the bookmark only if it has a URL (i.e., it's a bookmark, not a folder)
          if (node.url) {
            bookmarksQuantity++;
          }
          // Recursively process child nodes
          if (node.children) {
            countBookmarks(node.children);
          }
        });
      }

      countBookmarks(nodes);
      return bookmarksQuantity;
    };

    chrome.bookmarks.getTree((bookmarks) => {
      const updatedBookmarks = bookmarks[0]?.children || [];
      const quantity = getBookmarkQuantity(updatedBookmarks);
      setBookmarks({
        quantity,
        list: updatedBookmarks,
        isFetching: false,
      });
    });
  };

  const getBookmarkFaviconURL = (searchURL: string) => {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", searchURL);
    url.searchParams.set("size", "64");
    return url.toString();
  };

  const refreshBookmarks = () => {
    getBookmarks();
  };

  const addBookmark = (
    bookmark: CreateBookmarkNode,
    callback?: VoidFunction
  ) => {
    chrome.bookmarks.create(
      {
        parentId: bookmark.parentId,
        title: bookmark.title,
        url: bookmark?.type === "folder" ? undefined : bookmark.url,
        index: 0,
      },
      () => {
        callback?.();
        refreshBookmarks();
      }
    );
  };

  const updateBookmark = (
    bookmark: UpdateBookmarkNode,
    callback?: VoidFunction
  ) => {
    chrome.bookmarks.update(
      bookmark.id,
      {
        title: bookmark.title,
        url: bookmark?.type === "folder" ? undefined : bookmark.url,
      },
      async () => {
        if (isBookmarkALink(bookmark)) {
          await generateBookmarkDescriptions([bookmark]);
        }
        callback?.();
        refreshBookmarks();
      }
    );
  };

  const moveBookmark = (
    data: {
      id: string;
      targetIndex: number;
      parentId: string;
    },
    callback?: () => void
  ) => {
    const { id, parentId, targetIndex } = data;
    chrome.bookmarks.move(id, { index: targetIndex, parentId }, () => {
      callback?.();
      refreshBookmarks();
    });
  };

  const deleteBookmark = (bookmark: BookmarkNode, callback?: VoidFunction) => {
    const removeBookmark = isBookmarkALink(bookmark)
      ? chrome.bookmarks.remove
      : chrome.bookmarks.removeTree;

    removeBookmark(bookmark?.id, () => {
      callback?.();
      refreshBookmarks();
      deleteABookmarkedDescription(bookmark?.id);
    });
  };

  const getLinksThatMatchSearch = async ({
    page,
    searchQuery,
  }: {
    searchQuery: string;
    page: number;
  }) => {
    return searchBookmarkDescriptions({
      page,
      searchQuery,
    });
  };

  useEffect(() => {
    checkInitialBookmarkDescriptionGenerateState();

    if (props?.fetchBookmarks) {
      getBookmarks();
    }
  }, []);

  return {
    bookmarks,
    addBookmark,
    moveBookmark,
    getBookmarkFaviconURL,
    updateBookmark,
    deleteBookmark,
    getLinksThatMatchSearch,
  };
};

export default useBookmarks;
