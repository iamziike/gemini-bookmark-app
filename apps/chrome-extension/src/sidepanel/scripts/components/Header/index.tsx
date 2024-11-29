import React from "react";
import logoImage from "@assets/images/logo.svg";
import githubLogo from "@assets/images/github.svg";
import BookmarkSearch from "../BookmarkSearch";
import { GITHUB_REPO } from "@constants/index";

const Header = () => {
  return (
    <header className="position-sticky top-0 left-0 bg-primary pb-3">
      <div className="d-flex justify-content-between align-items-center shadow-sm text-center p-3 px-2">
        <div className="">
          <img src={logoImage} alt="Logo" width={200} />
        </div>
        <div
          onClick={() => {
            window.open(GITHUB_REPO, "_blank");
          }}
        >
          <img className="pointer" src={githubLogo} alt="Logo" width={30} />
        </div>
      </div>

      <nav className="d-flex gap-2 justify-content-end px-2 align-items-center mt-2">
        <BookmarkSearch />
      </nav>
    </header>
  );
};

export default Header;
