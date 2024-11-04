import React, { useEffect, useReducer } from "react";
import Loading from "@components/Loading";
import BookmarkFolder from "../../components/BookmarkFolder";
import { BookmarkNode } from "@chrome-extension/src/models";

interface State {
  bookmarks: BookmarkNode[];
  bookmarksQuantity: number;
  isLoading: boolean;
}

const InitialState: State = {
  bookmarks: [],
  bookmarksQuantity: 0,
  isLoading: true,
};

const Home = () => {
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    InitialState
  );

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
    updateState({ bookmarksQuantity });
  };

  const getBookmarks = async () => {
    const nodes = await chrome.bookmarks.getTree();
    const parentNode = nodes[0];

    if (parentNode && !parentNode?.title) {
      updateState({ bookmarks: parentNode?.children });
    } else {
      updateState({ bookmarks: nodes });
    }

    getBookmarkQuantity(nodes);
  };

  useEffect(() => {
    getBookmarks();
  }, []);

  return (
    <div>
      <div>
        <h5>
          Bookmarks{" "}
          <span className="small font-monospace text-muted">
            ({state?.bookmarksQuantity})
          </span>
        </h5>
      </div>
      {state?.bookmarks?.map((bookmark) => (
        <BookmarkFolder key={bookmark?.id} bookmark={bookmark} />
      ))}

      <Loading isLoading={!state?.bookmarks?.length} />
    </div>
  );
};

export default Home;
