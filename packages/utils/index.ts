import dayjs from "dayjs";
import { showToast } from "@chrome-extension/src/utils";

export const copyToClipboard = (text?: string) => {
  navigator.clipboard.writeText(text ?? "").then(() => {
    showToast("Copied to clipboard");
  });
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
