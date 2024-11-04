import React from "react";

interface Props {
  isLoading: boolean;
}

const Loading = ({ isLoading }: Props) => {
  return (
    isLoading && (
      <div className="text-center opacity-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  );
};

export default Loading;
