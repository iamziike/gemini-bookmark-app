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
const initiateBookmarkCaching = async () => {
  const bookmarkUploadState = await getBookmarkUploadState();
  if (bookmarkUploadState?.state === "COMPLETED") {
    return;
  }

  chrome.bookmarks.getTree(async (tree) => {
    const links = getAllBookmarkedLinks(tree);
    await generateBookmarkDescriptions(links);
    setBookmarkUploadState({ state: "COMPLETED" });
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

openSidePanelOnActionClick();
setTimeout(() => {
  initiateBookmarkCaching();
}, 2000);
