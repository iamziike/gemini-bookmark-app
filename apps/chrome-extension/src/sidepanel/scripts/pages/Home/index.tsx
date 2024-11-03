import React from "react";
import searchImage from "@assets/images/search.svg";
import addImage from "@assets/images/add.svg";
import settingsImage from "@assets/images/settings.svg";
import filterImage from "@assets/images/filter.svg";

const Home = () => {
  return (
    <div className="d-flex gap-2 justify-content-center align-items-center">
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
    </div>
  );
};

export default Home;
