import clsx from "clsx";
import classNames from "./Loading.module.css";
import React from "react";

interface Props {
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
}

const Loading = ({ isLoading, size = "medium" }: Props) => {
  return (
    isLoading && (
      <div className="text-center opacity-50">
        <div
          className={clsx("spinner-border text-primary", {
            [classNames["spinner-small"]]: size === "small",
            [classNames["spinner-medium"]]: size === "medium",
            [classNames["spinner-large"]]: size === "large",
          })}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  );
};

export default Loading;
