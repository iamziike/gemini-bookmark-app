import React from "react";
import BookmarkFolder from "../BookmarkFolder";
import Loading from "@components/Loading";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";

const BookmarkFolders = () => {
  const { bookmarks } = useBookmarks({ fetchBookmarks: true });

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
      <div>
        {bookmarks?.list?.map((bookmark) => (
          <BookmarkFolder key={bookmark?.id} bookmark={bookmark} />
        ))}

        <Loading isLoading={bookmarks?.isFetching} />
      </div>
    </>
  );
};

export default BookmarkFolders;
