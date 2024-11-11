import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  overrideClass?: string;
  loading?: {
    label?: string;
    isLoading: boolean;
  };
}

const ButtonLoader = () => {
  return (
    <span
      className="spinner-border spinner-border-sm text-white spinner-small"
      aria-hidden="true"
    />
  );
};

const CustomButton = ({ overrideClass, loading, label, ...props }: Props) => {
  const getClassName = () => {
    const defaultClass =
      "d-flex justify-content-center align-items-center no-wrap rounded-1 ";

    if (overrideClass) {
      return defaultClass + overrideClass;
    }

    const className = props?.className ?? "";
    return "btn btn-primary " + defaultClass + className;
  };

  const getText = () => {
    if (loading?.isLoading) {
      return loading?.label || label;
    }
    return label;
  };

  return (
    <button
      type="button"
      {...props}
      disabled={props?.disabled || loading?.isLoading}
      className={getClassName()}
    >
      <span>{getText()}</span>
      {loading?.isLoading && (
        <span className="ms-2 d-flex align-items-center">
          <ButtonLoader />
        </span>
      )}
    </button>
  );
};

export default CustomButton;
