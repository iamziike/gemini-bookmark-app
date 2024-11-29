import toast from "react-hot-toast";
import { MessageData, MessageEventCallbackListener } from "../models";

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
    if (tab.active && tab?.id) {
      chrome.tabs.sendMessage(tab?.id, data);
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

export const showToast = (message: string) => {
  toast.dismiss();

  toast(message, {
    icon: "🔥",
    duration: 2000,
    style: {
      borderRadius: "10px",
      background: "#2589E6",
      color: "#fff",
    },
  });
};
