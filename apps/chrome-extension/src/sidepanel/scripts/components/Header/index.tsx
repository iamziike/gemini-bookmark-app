import React from "react";
import logoImage from "@assets/images/logo.svg";
import githubLogo from "@assets/images/github.svg";
import searchImage from "@assets/images/search.svg";
import addImage from "@assets/images/add.svg";
import settingsImage from "@assets/images/settings.svg";
import filterImage from "@assets/images/filter.svg";
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

      <nav className="d-flex gap-2 justify-content-center align-items-center mt-2">
        <div className="list-unstyled btn btn-primary">
          <img src={addImage} alt="add image" />
        </div>
        <div className="list-unstyled btn btn-primary">
          <img src={searchImage} alt="search image" />
        </div>
        <div className="list-unstyled btn btn-primary">
          <img src={settingsImage} alt="settings image" />
        </div>
        <div className="list-unstyled btn btn-primary">
          <img src={filterImage} alt="filter image" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
