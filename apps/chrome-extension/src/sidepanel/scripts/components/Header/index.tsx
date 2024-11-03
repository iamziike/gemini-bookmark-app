import React from "react";
import logoImage from "@assets/images/logo.svg";
import githubLogo from "@assets/images/github.svg";
import { GITHUB_PROFILE_URL } from "@constants/index";

const Header = () => {
  return (
    <header className="d-flex justify-content-between align-items-center shadow-sm text-center p-3 px-2">
      <div className="">
        <img src={logoImage} alt="Logo" width={200} />
      </div>
      <div
        onClick={() => {
          window.open(GITHUB_PROFILE_URL, "_blank");
        }}
      >
        <img className="pointer" src={githubLogo} alt="Logo" width={30} />
      </div>
    </header>
  );
};

export default Header;
