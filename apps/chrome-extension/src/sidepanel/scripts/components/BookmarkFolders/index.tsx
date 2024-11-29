import React from "react";
import openFolderImage from "@assets/images/open-folder-white.svg";
import NewBookmarkFolder from "../NewBookmarkFolder";
import Loading from "@components/Loading";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import { transformBookmarksToDragAndDropNodes } from "@chrome-extension/src/services/bookmark";
import {
  Tree,
  DndProvider,
  MultiBackend,
  getBackendOptions,
} from "@minoru/react-dnd-treeview";

const BookmarkFolders = () => {
  const { bookmarks, getBookmarkFaviconURL, moveBookmark } = useBookmarks({
    fetchBookmarks: true,
  });
  const ROOT_ID = bookmarks?.list?.[0]?.parentId ?? "0";
  const dragNdDropTree = transformBookmarksToDragAndDropNodes(bookmarks?.list);

  return (
    <>
      <div>
        <h5 className="d-flex ">
          Bookmarks{" "}
          <span className="ms-1 d-flex align-items-center small font-monospace text-muted">
            <Loading size="small" isLoading={bookmarks?.isFetching} />

            <span hidden={!bookmarks?.quantity}>({bookmarks?.quantity})</span>
          </span>
        </h5>
      </div>
      <div className="position-relative">
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
          <Tree
            sort={false}
            rootId={ROOT_ID}
            tree={dragNdDropTree}
            enableAnimateExpand
            listComponent="div"
            listItemComponent="div"
            classes={{
              draggingSource: "drag-n-drop-dragging-Source",
              dropTarget: "drag-n-drop-drop-target",
            }}
            canDrag={(node) =>
              node?.parent !== ROOT_ID && !node?.data?.unmodifiable
            }
            onDrop={(_, options) => {
              const newSibling = dragNdDropTree[options?.destinationIndex ?? 0];

              moveBookmark({
                id: options?.dragSourceId?.toString() ?? "",
                parentId: options?.dropTargetId?.toString() ?? "",
                targetIndex: newSibling?.data?.index ?? 0,
              });
            }}
            dragPreviewRender={({ item }) => {
              const url = item?.data?.url;

              return (
                <div
                  style={{ width: "max-content" }}
                  className="d-flex align-content-between bg-secondary gap-2 px-2 py-1"
                >
                  <div>
                    <img
                      alt="section image"
                      width={16}
                      src={
                        url ? getBookmarkFaviconURL(url ?? "") : openFolderImage
                      }
                    />
                  </div>
                  <div className="d-flex justify-content-between gap-2 ellipsis align-items-center w-100 text-white">
                    {item?.text || "Untitled"}
                  </div>
                </div>
              );
            }}
            render={(item, { isOpen, depth, onToggle }) => {
              return (
                <div
                  style={{
                    marginLeft: depth * 25,
                  }}
                >
                  <NewBookmarkFolder
                    isFolderOpen={isOpen}
                    onToggleVisibility={onToggle}
                    bookmark={{
                      ...item?.data,
                      id: item?.id?.toString() ?? "",
                      title: item?.text,
                    }}
                    onOpenFolder={() => {
                      if (!isOpen) {
                        onToggle();
                      }
                    }}
                  />
                </div>
              );
            }}
          />
        </DndProvider>
        <Loading isLoading={bookmarks?.isFetching} />
      </div>
    </>
  );
};

export default BookmarkFolders;
