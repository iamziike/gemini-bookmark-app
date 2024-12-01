import { useEffect, useState } from "react";

interface Props {
  parentID: string;
  childID: string;
  deps?: unknown[];
}

const useTextOverflow = ({ childID, parentID, deps = [] }: Props) => {
  const [isReady] = useState(true);
  const [widthOverflow, setWidthOverflow] = useState({
    parent: 0,
    child: 0,
    isOverflow: false,
  });

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const parentElement = document.getElementById(parentID);
    const childElement = document.getElementById(childID);

    if (!(parentElement && childElement)) {
      return;
    }

    if (
      childElement?.style?.display === "block" &&
      childElement.scrollWidth > parentElement?.clientWidth
    ) {
      setWidthOverflow({
        isOverflow: true,
        child: childElement.scrollWidth,
        parent: parentElement?.clientWidth,
      });
      return;
    }

    if (
      childElement?.style?.display === "inline" &&
      childElement.offsetWidth > parentElement?.clientWidth
    ) {
      setWidthOverflow({
        isOverflow: true,
        child: childElement.offsetWidth,
        parent: parentElement?.clientWidth,
      });
      return;
    }

    setWidthOverflow({
      isOverflow: false,
      child: childElement.scrollWidth,
      parent: parentElement?.clientWidth,
    });
  }, [...deps]);

  return {
    widthOverflow,
  };
};

export default useTextOverflow;
