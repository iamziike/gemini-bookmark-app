import allBookmarkImage from "../../../assets/images/all-bookmarks.svg";
import addBookmarkImage from "../../../assets/images/add-bookmark.svg";
import helpImage from "../../../assets/images/help.svg";
import settingsImage from "../../../assets/images/settings.svg";
import { MESSAGE_EVENT_TYPES } from "apps/chrome-extension/src/constants";
import { emitMessageFromPopupToContentScript } from "apps/chrome-extension/src/utils";

const App = () => {
  const options = [
    {
      name: "Add Bookmark",
      eventType: MESSAGE_EVENT_TYPES.ADD_BOOKMARK,
      icon: addBookmarkImage,
    },
    {
      name: "View Bookmarks",
      eventType: MESSAGE_EVENT_TYPES.VIEW_ALL_BOOKMARKS,
      icon: allBookmarkImage,
    },
    {
      name: "View Settings",
      eventType: MESSAGE_EVENT_TYPES.VIEW_SETTINGS,
      icon: settingsImage,
    },
    {
      name: "View Help",
      eventType: MESSAGE_EVENT_TYPES.VIEW_HELP,
      icon: helpImage,
    },
  ];

  return (
    <>
      <nav className="nav">
        {options.map((option) => (
          <div
            key={option.eventType}
            onClick={() => {
              emitMessageFromPopupToContentScript({
                type: option.eventType,
                data: null,
              });
            }}
          >
            <img
              title={option.name}
              src={option?.icon}
              alt={option.name}
              width={50}
            />
          </div>
        ))}
      </nav>

      {/* <div className="text-center">Buy me Coffee</div> */}
    </>
  );
};

export default App;
