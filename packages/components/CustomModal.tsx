import React from "react";
import clsx from "clsx";
import closeIcon from "@assets/images/close.svg";
import { Modal, ModalProps } from "react-bootstrap";

interface CustomModalProps extends Pick<ModalProps, "container"> {
  size?: "sm" | "lg" | "xl" | "md";
  children: React.ReactElement | null;
  visible: boolean;
  showCloseIcon?: boolean;
  padding?: boolean;
  className?: string;
  onDismiss: VoidFunction;
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
      backdrop="static"
      show={Boolean(visible)}
      size={modalSize}
      centered
      className={className}
      {...props}
    >
      <Modal.Body className="p-0">
        <div className="w-100 bg-white">
          <div
            className="progress-meter bg-primary"
            style={{ width: "100%" }}
          />
        </div>
        <div className="p-2">
          {showCloseIcon && (
            <div className="d-flex justify-content-end">
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
          <div className="modal-body pt-4">
            <div className={clsx({ "px-3 py-4 mt-4": padding })}>
              {children}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CustomModal;
