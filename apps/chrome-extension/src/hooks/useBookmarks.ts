import { useEffect } from "react";
import { atom, useAtom } from "jotai";
import { isBookmarkALink } from "../utils";
import {
  deleteABookmarkedDescription,
  generateBookmarkDescriptions,
  getAllBookmarkedLinks,
  getCachedBookmarkDescriptions,
} from "@utils/bookmark";
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

  const addBookmark = (
    bookmark: CreateBookmarkNode,
    callback?: VoidFunction
  ) => {
    chrome.bookmarks.create(
      {
        parentId: bookmark.parentId,
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

  const getLinksThatMatchSearch = async (query: string) => {
    const bookmarkDescriptions = await getCachedBookmarkDescriptions();
    const linksID = Object.keys(bookmarkDescriptions).filter((key) => {
      return bookmarkDescriptions[key].description.includes(query);
    });

    return getAllBookmarkedLinks(bookmarks.list).filter(({ id }) =>
      linksID.includes(id)
    );
  };

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
    getLinksThatMatchSearch,
  };
};

export default useBookmarks;
