import dayjs from "dayjs";
import { showToast } from "@chrome-extension/src/utils";
import { CustomObject } from "@chrome-extension/src/models";

export const copyToClipboard = (text?: string) => {
  navigator.clipboard.writeText(text ?? "").then(() => {
    showToast("Copied to clipboard");
  });
};

export const openInNewWindow = (text?: string) => {
  window.open(text, "_blank");
};

export const splitArrayTo2D = <T>({
  list,
  noOfElementsPerArray,
}: {
  list: T[];
  noOfElementsPerArray: number;
}): T[][] => {
  const result: T[][] = [];
  let chunk: T[] = [];

  list.forEach((item, index) => {
    chunk.push(item);
    if (chunk.length === noOfElementsPerArray || index === list.length - 1) {
      result.push(chunk);
      chunk = [];
    }
  });

  return result;
};

export const formatDate = ({
  date,
  format = "DD/MM/YYYY",
}: {
  date?: string | number;
  format?: "MMMM D, YYYY • h:mm A" | "DD/MM/YYYY" | "D MMMM, YYYY";
}) => {
  dayjs.locale("en");
  const formatted = dayjs(date).format(format);
  return formatted;
};

export const getFallback = <T, U>(val1: T, val2: U) => {
  return val1 || val2;
};

export const sendMessage = (id: string, data: CustomObject<unknown>) => {
  chrome.runtime.sendMessage({ id, data }, () => {
    if (chrome.runtime.lastError) {
      console.log("No Receiver for message!!");
      return;
    }
  });
};

export const listenToMessage = <T>(id: string, callback: (data: T) => void) => {
  chrome.runtime.onMessage.addListener((value: { id: string; data: T }) => {
    if (value?.id === id) {
      callback(value.data);
    }
  });
};

export const getLocalStorageData = async <T extends object>(id: string) => {
  const response = await chrome.storage.local.get(id);
  return response?.[id] as T;
};

export const setLocalStorageData = (
  id: string,
  data: CustomObject<unknown>
) => {
  chrome.storage.local.set({ [id]: data });
};

export const getPercentage = (
  part: number,
  whole: number,
  decimalPlaces = 2
) => {
  if (whole === 0) return 0;

  const percentage = (part / whole) * 100;
  return Number(percentage.toFixed(decimalPlaces));
};

export const truncateText = (text = "", maxLength = 30) => {
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength) + "...";
};

export const waitFor = async (secs: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, secs * 1000);
  });
};

export const transformGeminiResponseToJSON = <T>(text: string) => {
  let sanitizedData = text.replace("```", "").replace("```", "").trim();

  if (sanitizedData.startsWith("json")) {
    sanitizedData = sanitizedData.replace("json", "");
  }

  if (sanitizedData.endsWith("json")) {
    sanitizedData = sanitizedData.replace("json", "");
  }

  if (sanitizedData.includes("```json")) {
    sanitizedData = sanitizedData.replace("```json", "");
  }

  if (sanitizedData.includes("```")) {
    sanitizedData = sanitizedData.replace("```", "");
  }

  return JSON.parse(sanitizedData) as T;
};
