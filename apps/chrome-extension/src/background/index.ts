import { generateDescriptionForNewUsers } from "@utils/bookmark";

const openSidePanelOnActionClick = () => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
};

openSidePanelOnActionClick();

chrome.runtime.onInstalled.addListener(async () => {
  generateDescriptionForNewUsers();
});
