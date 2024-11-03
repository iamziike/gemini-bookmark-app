import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export default function IframeComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      setIframeDoc(iframe.contentWindow.document);
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Iframe Component"
      width="600"
      height="400"
      style={{ border: "none" }}
    >
      {iframeDoc && ReactDOM.createPortal(children, iframeDoc.body)}
    </iframe>
  );
}
