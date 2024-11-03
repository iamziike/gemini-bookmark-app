import React from "react";
import Header from "../components/Header";

interface Props {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      <div className="mt-2 px-2">{children}</div>
    </div>
  );
};

export default DefaultLayout;
