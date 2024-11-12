import React from "react";
import Header from "../components/Header";
import CustomAlert from "@components/CustomAlert";
import { Toaster } from "react-hot-toast";

interface Props {
  children: React.ReactNode;
}

const DefaultLayout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      <div className="px-2">{children}</div>
      <Toaster />
      <CustomAlert />
    </div>
  );
};

export default DefaultLayout;
