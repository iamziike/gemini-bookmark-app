import * as yup from "yup";

const customYupValidation = {
  title: yup
    .string()
    .typeError("Folder name is  not a word")
    .required("Folder name is missing"),
  urlTitle: yup
    .string()
    .typeError("URL title is  not a word")
    .required("URL title is missing"),
  url: yup.string().typeError("URL is not a link").required("URL is missing"),
  searchQuery: yup.string().required("Search Query is missing"),
};

export default customYupValidation;
