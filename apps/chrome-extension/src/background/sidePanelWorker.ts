// Allows users to open the side panel by clicking on the action toolbar icon
export default function openSidePanelOnActionClick() {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}
