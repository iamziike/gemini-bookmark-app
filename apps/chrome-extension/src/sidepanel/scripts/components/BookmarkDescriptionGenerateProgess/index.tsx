import React, { useEffect, useReducer } from "react";
import useTextOverflow from "@hooks/useTextOverflow";
import clsx from "clsx";
import { INITIAL_BOOKMARKS_GENERATE_BATCH_REQUEST_STORE_KEY } from "@chrome-extension/src/constants";
import { BookmarkDescriptionBatchRequestState } from "@chrome-extension/src/models";
import { getInitialBookmarkDescriptionGenerateState } from "@chrome-extension/src/services/bookmark";
import { getPercentage, listenToMessage } from "@utils/index";

interface State {
  stateToShow: "percentage" | "description";
  percentage: number;
  description: string;
  visible: boolean;
}

const BookmarkDescriptionGenerateProgess = () => {
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    {
      stateToShow: "description",
      percentage: 0,
      description: "",
      visible: false,
    }
  );

  const { widthOverflow } = useTextOverflow({
    childID: "bookmarks-description-generate-progress-title",
    parentID: "bookmarks-description-generate-progress-title-wrapper",
    deps: [state],
  });

  const listenToBookmarkDescriptionsCaching = async () => {
    const response = await getInitialBookmarkDescriptionGenerateState();

    if (response?.state === "PENDING") {
      updateState({
        visible: true,
      });

      listenToMessage(
        INITIAL_BOOKMARKS_GENERATE_BATCH_REQUEST_STORE_KEY,
        (data: BookmarkDescriptionBatchRequestState) => {
          if (!data?.nextBatch) {
            updateState({
              visible: true,
              stateToShow: "description",
              description: "All bookmarks have been processed",
              percentage: 100,
            });

            setTimeout(() => {
              updateState({
                visible: false,
              });
            }, 2000);
            return;
          }

          updateState({
            visible: true,
            description: `Generating descriptions for: ${data?.nextBatch?.[0]?.url}`,
            percentage: getPercentage(
              data?.completed,
              data?.completed + data?.pending
            ),
          });
        }
      );
    }
  };

  useEffect(() => {
    listenToBookmarkDescriptionsCaching();
  }, []);

  if (!state?.visible) {
    return <div />;
  }

  return (
    <div>
      <div
        className="progress-meter bg-secondary"
        style={{
          height: 5,
          width: state.percentage + "%",
          opacity: state.visible ? 1 : 0,
        }}
      />

      <div
        className={clsx("ps-2", {
          "pe-2": widthOverflow?.isOverflow || state?.percentage > 97,
          "d-none": !state.description,
        })}
      >
        <div
          id="bookmarks-description-generate-progress-title-wrapper"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            height: 21,
          }}
        >
          <div
            id="bookmarks-description-generate-progress-title"
            className="progress-meter fade-out-slow font-monospace text-end text-nowrap"
            style={{
              width: state.percentage + "%",
              fontSize: 12,
              display: widthOverflow?.isOverflow ? "inline" : "block",
              verticalAlign: "top",
            }}
            onAnimationIteration={() => {
              updateState({
                stateToShow:
                  state.stateToShow === "description"
                    ? "percentage"
                    : "description",
              });
            }}
          >
            {state.stateToShow === "description"
              ? state.description
              : `${state.percentage}%`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkDescriptionGenerateProgess;
