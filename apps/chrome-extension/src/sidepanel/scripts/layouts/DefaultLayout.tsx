import React from "react";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

interface Props {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      <div className="px-2">{children}</div>
      <div>
        <Toaster />
      </div>
    </div>
  );
};

export default DefaultLayout;
