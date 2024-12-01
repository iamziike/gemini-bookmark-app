import React from "react";
import clsx from "clsx";
import closeIcon from "@assets/images/close.svg";
import { Modal, ModalProps } from "react-bootstrap";

interface CustomModalProps extends Pick<ModalProps, "container"> {
  size?: "sm" | "lg" | "xl" | "md";
  children: React.ReactElement | React.ReactElement[] | null;
  visible: boolean;
  showCloseIcon?: boolean;
  padding?: boolean;
  className?: string;
  onDismiss?: VoidFunction;
}

const CustomModal = ({
  children,
  onDismiss,
  visible,
  size = "lg",
  showCloseIcon = true,
  padding = true,
  className,
  ...props
}: CustomModalProps) => {
  const modalSize = size === "md" ? undefined : size;

  return (
    <Modal
      centered
      backdrop="static"
      size={modalSize}
      show={Boolean(visible)}
      className={clsx(className)}
      backdropClassName="zIndex-1055"
      contentClassName="zIndex-1055"
      {...props}
    >
      <Modal.Body className="position-relative p-0 rounded-2 overflow-hidden">
        <div className="w-100 bg-primary">
          <div
            className="progress-meter bg-secondary"
            style={{ height: 5, width: "100%" }}
          />
        </div>
        <div className="p-2">
          {showCloseIcon && (
            <div
              style={{ top: "0", right: "7px" }}
              className="d-flex justify-content-end pt-1 px-0 position-absolute z-3"
            >
              <span
                className="close"
                aria-label="Close"
                onClick={onDismiss}
                role="button"
              >
                <img src={closeIcon} className="pointer" />
              </span>
            </div>
          )}
          <div
            style={{ maxHeight: "70vh" }}
            className={clsx(
              "position-relative overflow-y-scroll hide-scroll-bar",
              {
                "px-3 pt-0 py-4": padding,
              }
            )}
          >
            {children}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CustomModal;
