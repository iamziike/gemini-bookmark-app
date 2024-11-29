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
import { BookmarkNode } from "@chrome-extension/src/models";
import { Collapse } from "react-bootstrap";
import { copyToClipboard } from "@utils/index";
import { isBookmarkALink } from "@chrome-extension/src/services/bookmark";

interface Props {
  bookmark: BookmarkNode;
}

interface State {
  isFolderOpen: boolean;
  isCreateUpdateFormVisible: boolean;
  selectedBookmarkNode: BookmarkNode | null;
  actionToPerform: "update" | "create" | null;
}

const InitialState: State = {
  isFolderOpen: false,
  selectedBookmarkNode: null,
  isCreateUpdateFormVisible: false,
  actionToPerform: null,
};

const BookmarkFolder = ({ bookmark }: Props) => {
  const { showSuccessAlert, showConfirmAlert } = useCustomAlert();
  const { deleteBookmark, getBookmarkFaviconURL } = useBookmarks();
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    InitialState
  );

  const handleToggleVisibility = () => {
    updateState({
      isFolderOpen: !state.isFolderOpen,
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
          showSuccessAlert({
            content: {
              title: "Bookmark deleted",
            },
          });

          updateState({
            selectedBookmarkNode: null,
          });
        });
      },
    });
  };

  return (
    <>
      <div className="d-flex gap-1 overflow-hidden">
        <div className="pointer" onClick={handleToggleVisibility}>
          {state?.isFolderOpen ? (
            <img src={openFolderImage} alt="closed folder" />
          ) : (
            <img src={closedFolderImage} alt="closed folder" />
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
                  updateState({
                    isFolderOpen: true,
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
                  updateState({
                    isCreateUpdateFormVisible: true,
                    isFolderOpen: true,
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
                  handleDeleteBookmark(bookmark);
                }}
              />
            </div>
          </div>

          <Collapse in={state?.isFolderOpen}>
            <div className="row gap-2">
              {bookmark.children?.map((child) => {
                if (!child?.children) {
                  return (
                    <div
                      key={child.id}
                      className="d-flex gap-1 font-family-secondary text-nowrap"
                    >
                      <div>
                        <img
                          src={getBookmarkFaviconURL(child?.url ?? "")}
                          alt="url favicon"
                          width={16}
                        />
                      </div>
                      <div className="d-flex justify-content-between gap-2 ellipsis align-items-center w-100">
                        <div
                          className="ellipsis pointer"
                          onClick={() => {
                            handleCopyToClipboard(child.url ?? "");
                          }}
                        >
                          {child.title}
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
                                isFolderOpen: true,
                                actionToPerform: "update",
                                selectedBookmarkNode: child,
                              });
                            }}
                          />

                          <img
                            src={deleteImage}
                            alt="delete image"
                            className="pointer"
                            width={16}
                            onClick={() => {
                              handleDeleteBookmark(child);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
                return <BookmarkFolder key={child.id} bookmark={child} />;
              })}
            </div>
          </Collapse>
        </div>
      </div>

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
