import { useEffect } from "react";
import { listenForMessage } from "apps/chrome-extension/src/utils";
import {
  MessageData,
  MessageEventType,
} from "apps/chrome-extension/src/models";

const App = () => {
  useEffect(() => {
    listenForMessage((message: MessageData<MessageEventType, null>) => {
      alert(message?.type);
    });
  }, []);

  return <div>App</div>;
};

export default App;

