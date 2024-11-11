import React, { useEffect, useReducer } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import FolderForm from "./FolderForm";
import LinkForm from "./LinkForm";
import { BookmarkNode } from "@chrome-extension/src/models";

interface Props {
  onCancel: VoidFunction;
  onSuccess: VoidFunction;
  data: BookmarkFormProps;
}

export interface BookmarkFormProps {
  parentId?: string;
  index?: number;
  actionToPerform?: "create" | "update" | null;
  bookmarkToUpdate?: BookmarkNode | null;
  defaultTab?: "url" | "folder";
}

interface State {
  selectedTab: BookmarkFormProps["defaultTab"];
}

const BookmarkForm = ({ data, onCancel, onSuccess }: Props) => {
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    {
      selectedTab: data?.defaultTab,
    }
  );

  const disabledUnselectedTab = Boolean(data?.bookmarkToUpdate);

  useEffect(() => {
    updateState({ selectedTab: data?.defaultTab });
  }, [disabledUnselectedTab]);

  return (
    <Tabs
      fill
      justify
      activeKey={state.selectedTab}
      className="my-3"
      onSelect={(selectedTab) => {
        updateState({
          selectedTab: selectedTab as BookmarkFormProps["defaultTab"],
        });
      }}
    >
      <Tab
        disabled={disabledUnselectedTab && state?.selectedTab === "folder"}
        eventKey="url"
        title="URL"
        transition
      >
        <LinkForm data={data} onCancel={onCancel} onSuccess={onSuccess} />
      </Tab>
      <Tab
        disabled={disabledUnselectedTab && state?.selectedTab === "url"}
        transition
        eventKey="folder"
        title="FOLDER"
      >
        <FolderForm data={data} onCancel={onCancel} onSuccess={onSuccess} />
      </Tab>
    </Tabs>
  );
};

export default BookmarkForm;
