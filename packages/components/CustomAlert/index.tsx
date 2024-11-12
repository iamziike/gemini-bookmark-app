import React, { useCallback, useEffect, useReducer } from "react";
import CustomModal from "@components/CustomModal";
import CustomButton from "@components/CustomButton";
import Loading from "@components/Loading";
import smileImage from "@assets/images/smile.svg";
import sadImage from "@assets/images/sad.svg";
import worriedImage from "@assets/images/worried.svg";
import noEmotionImage from "@assets/images/no-emotion.svg";

interface ButtonType {
  label?: string;
  onClick?: VoidFunction;
  hidden?: boolean;
  className?: string;
}

export enum AlertModalEvent {
  CUSTOM_ALERT_EVENT = "custom-alert",
}

export type AlertModalType =
  | "success"
  | "error"
  | "warning"
  | "loading"
  | "confirm";

export interface AlertModalState {
  isVisible: boolean;
  type: AlertModalType;
  showCloseIcon?: boolean;
  onCancel?: VoidFunction | null;
  onProceed?: VoidFunction | null;
  timer?: number | null;
  buttons?: {
    cancel?: ButtonType;
    proceed?: ButtonType;
    custom?: ButtonType[];
  };
  content?: {
    title: string;
    message?: React.ReactElement | string;
  };
}

const initialState: AlertModalState = {
  isVisible: false,
  type: "success",
  showCloseIcon: false,
  onCancel: null,
  onProceed: null,
  content: {
    title: "",
    message: "",
  },
};

const CustomAlert = () => {
  const [state, updateState] = useReducer(
    (state: AlertModalState, newState: Partial<AlertModalState>) => {
      if (!newState) {
        return { ...state };
      }
      return { ...state, ...newState };
    },
    initialState
  );

  const handleCancel = () => {
    const { onCancel, buttons } = state;
    updateState({
      isVisible: false,
      onCancel: null,
      onProceed: null,
    });
    buttons?.cancel?.onClick?.();
    onCancel?.();
  };

  const handleProceed = () => {
    const { onProceed, buttons } = state;
    updateState({
      isVisible: false,
      onCancel: null,
      onProceed: null,
    });

    buttons?.proceed?.onClick?.();
    onProceed?.();
  };

  const handleAlertEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<AlertModalState>;

    updateState({ ...customEvent?.detail });
  }, []);

  useEffect(() => {
    addEventListener(AlertModalEvent.CUSTOM_ALERT_EVENT, handleAlertEvent);

    return () => {
      removeEventListener(AlertModalEvent.CUSTOM_ALERT_EVENT, handleAlertEvent);
    };
  }, []);

  return (
    <CustomModal
      size="md"
      showCloseIcon
      visible={state?.isVisible}
      onDismiss={handleCancel}
    >
      <div>
        {["error", "warning", "success"].includes(state?.type) && (
          <div className="text-center">
            <img
              hidden={state?.type !== "warning"}
              src={worriedImage}
              alt="warning"
              width={65}
              height={65}
              className="mb-3"
            />

            <img
              hidden={state?.type !== "error"}
              src={sadImage}
              alt="warning"
              width={65}
              height={65}
              className="mb-3"
            />

            <img
              hidden={state?.type !== "success"}
              src={smileImage}
              alt="warning"
              width={65}
              height={65}
              className="mb-3"
            />
            <div className="mb-4 text-center">
              <h6 className="font-weight-bolder">{state?.content?.title}</h6>
              <div>
                <p>{state?.content?.message}</p>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="d-flex flex-column justify-content-center gap-3">
                <CustomButton
                  className="px-4"
                  onClick={handleProceed}
                  hidden={state?.buttons?.proceed?.hidden}
                  label={state?.buttons?.proceed?.label || "OKAY"}
                />
              </div>
            </div>
          </div>
        )}

        {state?.type === "loading" && (
          <div className="text-center">
            <Loading isLoading />
            <div className="mt-2">{state?.content?.title || "Loading..."}</div>
            <div className="text-muted">{state?.content?.message}</div>
          </div>
        )}

        {state?.type === "confirm" && (
          <div className="text-center">
            <img
              src={noEmotionImage}
              alt="warning"
              width={65}
              height={65}
              className="mb-3"
            />
            <div>
              <h6 className="font-weight-bold">{state?.content?.title}</h6>
              <p>{state?.content?.message}</p>
            </div>
            <div className="row justify-content-center">
              <div className="col-12 col-lg-5">
                <div className="d-flex flex-column justify-content-center gap-3">
                  <CustomButton
                    className="px-3 px-md-5"
                    onClick={handleProceed}
                    hidden={state?.buttons?.proceed?.hidden}
                    label={state?.buttons?.proceed?.label || "OKAY"}
                  />

                  {state?.buttons?.custom?.map((button, index) => (
                    <CustomButton
                      key={index}
                      className={`px-3 px-md-5 ${button?.className ?? ""}`}
                      onClick={button.onClick}
                      hidden={button.hidden}
                      label={button.label || "Custom"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default CustomAlert;
