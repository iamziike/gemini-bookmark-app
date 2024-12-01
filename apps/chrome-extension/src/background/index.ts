import { sendMessage, waitFor } from "@utils/index";
import { INITIAL_BOOKMARKS_GENERATE_BATCH_REQUEST_STORE_KEY } from "../constants";
import { BookmarkDescriptionBatchRequestState } from "../models";
import {
  deleteABookmarkedDescription,
  generateBookmarkDescriptions,
  getAllBookmarkedLinks,
  getInitialBookmarkDescriptionGenerateState,
  isBookmarkALink,
  setInitialBookmarkDescriptionGenerateState,
} from "../services/bookmark";

const openSidePanelOnActionClick = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
};

// Even if you use another bookmark app this extension will always be up-to-date
const initiateBookmarkCaching = async () => {
  const bookmarkDescriptionGenerateState =
    await getInitialBookmarkDescriptionGenerateState();
  if (bookmarkDescriptionGenerateState?.state === "COMPLETED") {
    return;
  }

  chrome.bookmarks.getTree(async (tree) => {
    const links = getAllBookmarkedLinks(tree);
    const response = await generateBookmarkDescriptions(
      links,
      ({ currentDescriptions, links, nextBatch }) => {
        const completed = Object.keys(currentDescriptions).length;
        const data: BookmarkDescriptionBatchRequestState = {
          completed,
          nextBatch,
          pending: links.length - completed,
        };
        sendMessage(INITIAL_BOOKMARKS_GENERATE_BATCH_REQUEST_STORE_KEY, data);
      }
    );

    if (response?.isError) {
      await waitFor(20);
      initiateBookmarkCaching();
      return;
    }

    setInitialBookmarkDescriptionGenerateState({ state: "COMPLETED" });
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setInitialBookmarkDescriptionGenerateState({
    state: "PENDING",
    isDisplayedCompleteModalBefore: false,
    isUserSeenStateBefore: false,
  });
});

chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
  if (isBookmarkALink(bookmark)) {
    await generateBookmarkDescriptions([bookmark]);
  }
});

chrome.bookmarks.onChanged.addListener(async (id) => {
  const [bookmark] = await chrome.bookmarks.get(id);
  if (isBookmarkALink(bookmark)) {
    await generateBookmarkDescriptions([bookmark]);
  }
});

chrome.bookmarks.onMoved.addListener(async (id) => {
  const [bookmark] = await chrome.bookmarks.get(id);

  if (isBookmarkALink(bookmark)) {
    await generateBookmarkDescriptions([bookmark]);
  }
});

chrome.bookmarks.onRemoved.addListener(async (id, bookmark) => {
  if (isBookmarkALink(bookmark?.node)) {
    deleteABookmarkedDescription(id);
  }
});

openSidePanelOnActionClick();
setTimeout(() => {
  initiateBookmarkCaching();
}, 1000);
