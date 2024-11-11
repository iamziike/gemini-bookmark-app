import React from "react";
import logoImage from "@assets/images/logo.svg";
import githubLogo from "@assets/images/github.svg";
import searchImage from "@assets/images/search.svg";
import settingsImage from "@assets/images/settings.svg";
import filterImage from "@assets/images/filter.svg";
import { GITHUB_REPO } from "@constants/index";
import { Link } from "react-router-dom";
import { SIDE_PANEL_PAGES } from "@chrome-extension/src/constants";

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

      <nav className="d-flex gap-2 justify-content-center align-items-center mt-2">
        <Link
          to={SIDE_PANEL_PAGES.HOME}
          className="list-unstyled btn btn-primary"
        >
          <img src={searchImage} alt="search image" />
        </Link>
        <Link
          to={SIDE_PANEL_PAGES.SETTINGS}
          className="list-unstyled btn btn-primary"
        >
          <img src={settingsImage} alt="settings image" />
        </Link>
        <Link
          to={SIDE_PANEL_PAGES.HOME}
          className="list-unstyled btn btn-primary"
        >
          <img src={filterImage} alt="filter image" />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
