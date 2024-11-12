import { AlertModalEvent, AlertModalState } from ".";

const useCustomAlert = () => {
  const showAlert = (detail: Omit<AlertModalState, "isVisible">) => {
    const customEvent = new CustomEvent<AlertModalState>(
      AlertModalEvent.CUSTOM_ALERT_EVENT,
      {
        detail: {
          buttons: undefined,
          ...detail,
          isVisible: true,
        },
      }
    );

    dispatchEvent(customEvent);

    if (detail.timer) {
      setTimeout(() => {
        closeAlert();
      }, detail.timer * 1000);
    }
  };

  const closeAlert = (detail?: Omit<Partial<AlertModalState>, "isVisible">) => {
    const customEvent = new CustomEvent<Partial<AlertModalState>>(
      AlertModalEvent.CUSTOM_ALERT_EVENT,
      {
        detail: {
          ...detail,
          isVisible: false,
        },
      }
    );

    dispatchEvent(customEvent);
  };

  const showLoading = (detail?: Partial<AlertModalState>) => {
    showAlert({ ...detail, type: "loading", showCloseIcon: false });
  };

  const stopLoading = () => {
    closeAlert({ type: "loading", showCloseIcon: false });
  };

  const showSuccessAlert = (
    detail: Omit<AlertModalState, "isVisible" | "type">
  ) => {
    showAlert({ ...detail, type: "success" });
  };

  const showErrorAlert = (
    detail: Omit<AlertModalState, "isVisible" | "type">
  ) => {
    showAlert({ ...detail, type: "error" });
  };

  const showWarningAlert = (
    detail: Omit<AlertModalState, "isVisible" | "type">
  ) => {
    showAlert({ ...detail, type: "warning" });
  };

  const showConfirmAlert = (
    detail: Omit<AlertModalState, "isVisible" | "type">
  ) => {
    showAlert({ ...detail, type: "confirm" });
  };

  return {
    showAlert,
    closeAlert,
    showLoading,
    stopLoading,
    showSuccessAlert,
    showWarningAlert,
    showErrorAlert,
    showConfirmAlert,
  };
};

export default useCustomAlert;
