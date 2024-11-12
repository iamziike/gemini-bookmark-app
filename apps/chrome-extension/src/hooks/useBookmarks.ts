import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { BOOKMARK_STORAGE_KEY } from "@constants/index";
import { isBookmarkALink } from "../utils";
import {
  BookmarkDescriptionResult,
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

  const refreshBookmarks = () => {
    getBookmarks();
  };

  const addBookmark = (newBookmark: CreateBookmarkNode) => {
    chrome.bookmarks.create(
      {
        parentId: newBookmark.parentId,
        title: newBookmark.title,
        url: newBookmark?.type === "folder" ? undefined : newBookmark.url,
      },
      () => {
        refreshBookmarks();
        // if (isBookmarkALink(newBookmark)) {
        //   //   setBookmarkDescription(newBookmark);
        // }
      }
    );
  };

  const updateBookmark = (newBookmark: UpdateBookmarkNode) => {
    chrome.bookmarks.update(
      newBookmark.id,
      {
        title: newBookmark.title,
        url: newBookmark?.type === "folder" ? undefined : newBookmark.url,
      },
      () => {
        refreshBookmarks();
        // if (isBookmarkALink(newBookmark)) {
        //   // setBookmarkDescription(newBookmark);
        // }
      }
    );
  };

  const deleteBookmark = (bookmark: BookmarkNode, callback?: VoidFunction) => {
    const removeBookmark = isBookmarkALink(bookmark)
      ? chrome.bookmarks.remove
      : chrome.bookmarks.removeTree;

    removeBookmark(bookmark?.id, () => {
      callback?.();
      refreshBookmarks();
      // deleteBookmarkDescription(bookmarkId);
    });
  };

  //   const deleteBookmarkDescription = async (id: string) => {
  //     const bookmarkDescriptions = (await chrome.storage.sync.get(
  //       BOOKMARK_STORAGE_KEY
  //     )) as BookmarkDescriptionResult;

  //     delete bookmarkDescriptions[BOOKMARK_STORAGE_KEY][id];

  //     await chrome.storage.sync.set({
  //       [BOOKMARK_STORAGE_KEY]: bookmarkDescriptions[BOOKMARK_STORAGE_KEY],
  //     });

  //     return true;
  //   };

  //   const setBookmarkDescription = async ({ id, url }: BookmarkNode) => {
  //     const bookmarkDescriptions = (await chrome.storage.sync.get(
  //       BOOKMARK_STORAGE_KEY
  //     )) as BookmarkDescriptionResult;

  //     const isURLExist =
  //       bookmarkDescriptions[BOOKMARK_STORAGE_KEY]?.[id]?.url === url;

  //     if (isURLExist) {
  //       return false;
  //     }

  //     // generateBookmarkDescription with gemini prompt api
  //     const description = "This is a description";
  //     await chrome.storage.sync.set({
  //       [BOOKMARK_STORAGE_KEY]: {
  //         ...bookmarkDescriptions,
  //         [id]: { description, url },
  //       },
  //     });

  //     return true;
  //   };

  //   const getBookmarkByDescription = async (description: string) => {
  //     const result = await chrome.storage.sync.get(BOOKMARK_STORAGE_KEY);
  //     console.log(description);
  //     return Object.keys(result)[0];
  //   };

  //   const getBookmarks = () => {
  //     chrome.bookmarks.getTree((bookmarks) => {
  //       setBookmarks(bookmarks[0].children || []);
  //     });
  //   };

  //   const deleteBookmakrs = (bookmarkId: string) => {
  //     chrome.bookmarks.remove(bookmarkId, () => {
  //       deleteBookmarkDescription(bookmarkId);
  //       getBookmarks();
  //     });
  //   };

  useEffect(() => {
    if (props?.fetchBookmarks) {
      getBookmarks();
    }
  }, []);

  return {
    bookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    // updateBookmark,
    // addBookmark,
    // deleteBookmakrs,
    // getBookmarkByDescription,
  };
};

export default useBookmarks;
