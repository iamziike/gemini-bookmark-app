import React from "react";
import clsx from "clsx";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  resizeable?: boolean;
}

const CustomTextArea = ({
  error,
  label,
  resizeable = false,
  className = "",
  ...props
}: Props) => {
  return (
    <div className={className}>
      <label className="d-block form-label">
        <span>{label}</span>
        <textarea
          {...props}
          rows={5}
          style={{ resize: resizeable ? "vertical" : "none" }}
          className={clsx(
            "w-100 border-2 rounded-1 px-2 py-1 py-0 font-family-secondary",
            {
              "border-danger": error,
            }
          )}
        />
        {error && (
          <div className="text-danger small" style={{ position: "relative" }}>
            {error}
          </div>
        )}
      </label>
    </div>
  );
};

export default CustomTextArea;
