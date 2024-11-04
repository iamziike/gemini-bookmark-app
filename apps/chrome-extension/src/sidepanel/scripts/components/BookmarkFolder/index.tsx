import React from "react";
import closedFolder from "@assets/images/folder.svg";
import { BookmarkNode } from "@chrome-extension/src/models";
import { Collapse } from "react-bootstrap";

interface Props {
  bookmark: BookmarkNode;
}

function faviconURL(searchURL: string) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", searchURL);
  url.searchParams.set("size", "32");
  return url.toString();
}

const BookmarkFolder = ({ bookmark }: Props) => {
  const [open, setOpen] = React.useState(false);

  const handleToggleVisibility = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="d-flex gap-1 overflow-hidden">
      <div className="pointer" onClick={handleToggleVisibility}>
        <img src={closedFolder} alt="closed folder" />
      </div>

      <div className="w-100">
        <div className="d-flex align-items-center gap-1 pointer">
          <div onClick={handleToggleVisibility} className="text-primary">
            {bookmark?.title}
          </div>
        </div>

        <Collapse in={open} className="w-100">
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
                        src={faviconURL(child?.url ?? "")}
                        alt="closed folder"
                        width={16}
                      />
                    </div>
                    <div className="ellipsis">{child.title}</div>
                  </div>
                );
              }
              return <BookmarkFolder key={child.id} bookmark={child} />;
            })}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default BookmarkFolder;
