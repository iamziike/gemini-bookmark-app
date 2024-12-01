import React from "react";
import clsx from "clsx";

interface Props {
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
}

const Loading = ({ isLoading, size = "medium" }: Props) => {
  return (
    isLoading && (
      <div className="text-center opacity-50">
        <div
          role="status"
          className={clsx("spinner-border text-primary", {
            "spinner-small": size === "small",
            "spinner-medium": size === "medium",
            "spinner-large": size === "large",
          })}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  );
};

export default Loading;
