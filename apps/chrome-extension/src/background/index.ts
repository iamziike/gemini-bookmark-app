import openSidePanelOnActionClick from "./sidePanelWorker";

openSidePanelOnActionClick();

// Background Script
chrome.runtime.onMessage.addListener(() => {
  console.log("INAA");
  //   if (message.type === "GET_BOOKMARKS") {
  //     // Simulating an async operation (e.g., fetching bookmarks)
  //     chrome.bookmarks.getTree((bookmarks) => {
  //       // Ensure you send a response here
  //       sendResponse({ success: true, data: bookmarks });
  //     });

  //     // Return true to indicate that we will call sendResponse asynchronously
  //     return true;
  //   }

  //   // Handle other types of messages if necessary
});
