import React, { useReducer } from "react";
import closedFolderImage from "@assets/images/folder.svg";
import openFolderImage from "@assets/images/open-folder.svg";
import addImage from "@assets/images/add.svg";
import editImage from "@assets/images/edit.svg";
import deleteImage from "@assets/images/delete.svg";
import CustomModal from "@components/CustomModal";
import useCustomAlert from "@components/CustomAlert/useCustomAlert";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import BookmarkForm from "../BookmarkForm";
import { NodeModel, useDragOver } from "@minoru/react-dnd-treeview";
import { copyToClipboard } from "@utils/index";
import { isBookmarkALink } from "@chrome-extension/src/services/bookmark";
import {
  BookmarkNode,
  BookmarkNodeWithoutChildren,
} from "@chrome-extension/src/models";

interface Props {
  bookmark?: BookmarkNodeWithoutChildren;
  isFolderOpen: boolean;
  onToggleVisibility: (id?: NodeModel["id"]) => void;
  onOpenFolder: VoidFunction;
}

interface State {
  isCreateUpdateFormVisible: boolean;
  selectedBookmarkNode: BookmarkNode | null;
  actionToPerform: "update" | "create" | null;
}

const InitialState: State = {
  selectedBookmarkNode: null,
  isCreateUpdateFormVisible: false,
  actionToPerform: null,
};

const BookmarkFolder = ({
  bookmark,
  isFolderOpen,
  onToggleVisibility,
  onOpenFolder,
}: Props) => {
  const { showConfirmAlert } = useCustomAlert();
  const { deleteBookmark, getBookmarkFaviconURL } = useBookmarks();

  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    InitialState
  );

  const dragOverProps = useDragOver(
    bookmark?.id ?? "",
    isFolderOpen,
    onToggleVisibility
  );

  const handleToggleVisibility = () => {
    onToggleVisibility();
    updateState({
      selectedBookmarkNode: bookmark,
    });
  };

  const handleCopyToClipboard = (url: string) => {
    copyToClipboard(url);
  };

  const handleDeleteBookmark = (bookmark: BookmarkNode) => {
    showConfirmAlert({
      showCloseIcon: true,
      content: {
        title: isBookmarkALink(bookmark)
          ? "Are you sure you want to delete this bookmark?"
          : "Are you sure you want to delete this folder?",
      },
      onProceed() {
        deleteBookmark(bookmark, () => {
          updateState({
            selectedBookmarkNode: null,
          });
        });
      },
    });
  };

  return (
    <>
      {isBookmarkALink(bookmark) ? (
        <div
          key={bookmark?.id}
          className="d-flex gap-2 font-family-secondary text-nowrap mb-1"
        >
          <div className="d-flex justify-content-center align-items-center">
            <img
              src={getBookmarkFaviconURL(bookmark?.url ?? "")}
              alt="url favicon"
              width={20}
            />
          </div>
          <div className="d-flex justify-content-between gap-2 ellipsis align-items-center w-100">
            <div
              className="ellipsis pointer"
              onClick={() => {
                handleCopyToClipboard(bookmark?.url ?? "");
              }}
            >
              {bookmark?.title}
            </div>
            <div className="text-muted d-flex gap-1">
              <img
                src={editImage}
                alt="edit image"
                className="pointer"
                width={16}
                onClick={() => {
                  updateState({
                    isCreateUpdateFormVisible: true,
                    actionToPerform: "update",
                    selectedBookmarkNode: bookmark,
                  });
                }}
              />

              <img
                src={deleteImage}
                alt="delete image"
                className="pointer"
                width={16}
                onClick={() => {
                  if (bookmark) handleDeleteBookmark(bookmark);
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div
          className="d-flex gap-2 overflow-hidden pointer"
          {...dragOverProps}
        >
          <div className="pointer" onClick={handleToggleVisibility}>
            {isFolderOpen ? (
              <img width={20} src={openFolderImage} alt="closed folder" />
            ) : (
              <img width={20} src={closedFolderImage} alt="closed folder" />
            )}
          </div>
          <div className="w-100 overflow-hidden">
            <div className="d-flex justify-content-between align-items-center w-100 hover">
              <div
                onClick={handleToggleVisibility}
                className="text-primary pointer"
              >
                {bookmark?.title || "Untitled"}
              </div>
              <div className="text-muted d-flex gap-1">
                <img
                  src={addImage}
                  alt="add image"
                  className="pointer"
                  width={16}
                  onClick={() => {
                    onOpenFolder?.();
                    updateState({
                      isCreateUpdateFormVisible: true,
                      actionToPerform: "create",
                      selectedBookmarkNode: bookmark,
                    });
                  }}
                />

                <img
                  hidden={bookmark?.parentId === "0"}
                  src={editImage}
                  alt="edit image"
                  className="pointer"
                  width={16}
                  onClick={() => {
                    onOpenFolder?.();
                    updateState({
                      isCreateUpdateFormVisible: true,
                      actionToPerform: "update",
                      selectedBookmarkNode: bookmark,
                    });
                  }}
                />

                <img
                  hidden={bookmark?.parentId === "0"}
                  src={deleteImage}
                  alt="delete image"
                  className="pointer"
                  width={16}
                  onClick={() => {
                    if (bookmark) {
                      handleDeleteBookmark(bookmark);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomModal
        visible={state.isCreateUpdateFormVisible}
        showCloseIcon={false}
      >
        <BookmarkForm
          onSuccess={() => {
            updateState({ isCreateUpdateFormVisible: false });
          }}
          onCancel={() => {
            updateState({ isCreateUpdateFormVisible: false });
          }}
          data={{
            actionToPerform: state?.actionToPerform,
            bookmarkToUpdate:
              state?.actionToPerform === "update"
                ? state?.selectedBookmarkNode
                : null,
            parentId: isBookmarkALink(bookmark)
              ? state?.selectedBookmarkNode?.parentId
              : state?.selectedBookmarkNode?.id,
          }}
        />
      </CustomModal>
    </>
  );
};

export default BookmarkFolder;
