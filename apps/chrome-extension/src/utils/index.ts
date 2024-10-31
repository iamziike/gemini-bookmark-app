import {
  MessageData,
  MessageEventCallbackListener,
  MessageEventType,
} from "../models";

// For some crazy reason doing chrome.runtime.sendMessage from the popup to the content script doesn't work
// hence this solution
export const emitMessageFromPopupToContentScript = async <T, D>(
  data: MessageData<T, D>
) => {
  // get current active tab
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  tabs.forEach((tab) => {
    if (tab.active) {
      chrome.tabs.sendMessage(tab?.id as any, data);
    }
  });
};

export const defaultEmitMessage = async <T, D>(data: MessageData<T, D>) => {
  chrome.runtime.sendMessage(data);
};

export const listenForMessage: MessageEventCallbackListener = (callback) => {
  chrome.runtime.onMessage.addListener(callback);
};

export const removeMessageListerner = chrome.runtime.onMessage.removeListener;
