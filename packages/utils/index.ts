export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};

export const splitArrayTo2D = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  let chunk: T[] = [];

  arr.forEach((item, index) => {
    chunk.push(item);
    if (chunk.length === size || index === arr.length - 1) {
      result.push(chunk);
      chunk = [];
    }
  });

  return result;
};
