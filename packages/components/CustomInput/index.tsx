import React from "react";
import clsx from "clsx";

interface CustomInputProps extends React.ComponentPropsWithoutRef<"input"> {
  readonly label?: string | React.ReactElement;
  readonly error?: string;
  placeholder: string;
}

export const CustomInput = ({
  error = "",
  className = "",
  label,
  ...props
}: CustomInputProps) => {
  return (
    <div className={className}>
      <label className="d-block form-label">
        <span>{label}</span>

        <input
          className={clsx("form-control", {
            "is-invalid": error,
          })}
          {...props}
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

export default CustomInput;
