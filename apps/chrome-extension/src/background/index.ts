import { MAX_GEMINI_REQUEST_PER_BATCH } from "../constants";
import {
  deleteABookmarkedDescription,
  generateBookmarkDescriptions,
  getAllBookmarkedLinks,
  getBookmarkUploadState,
  isBookmarkALink,
  setBookmarkUploadState,
} from "../services/bookmark";

const openSidePanelOnActionClick = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
};

// Even if you use another bookmark app this extension will always be up-to-date
const initialBookmarkCaching = async () => {
  const bookmarkUploadState = await getBookmarkUploadState();
  if (bookmarkUploadState.state === "COMPLETED") {
    return;
  }

  chrome.bookmarks.getTree(async (tree) => {
    const links = getAllBookmarkedLinks(tree);
    await generateBookmarkDescriptions(
      links.slice(0, MAX_GEMINI_REQUEST_PER_BATCH * 3)
    );
    setTimeout(() => {
      setBookmarkUploadState({ state: "COMPLETED" });
    }, 5000);
  });
};

chrome.runtime.onInstalled.addListener(() => {
  setBookmarkUploadState({
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

setTimeout(() => {
  initialBookmarkCaching();
}, 3000);
openSidePanelOnActionClick();
