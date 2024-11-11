import * as yup from "yup";
import React from "react";
import CustomInput from "@components/CustomInput";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import CustomButton from "@components/CustomButton";
import { Formik, Form } from "formik";
import { BookmarkFormProps } from "./index";
import { FormikHandler } from "@chrome-extension/src/models";

interface Props {
  data: BookmarkFormProps;
  onSuccess: VoidFunction;
  onCancel: VoidFunction;
}

interface FormValues {
  title: string;
}

const FormYupValidation = yup.object({
  title: yup
    .string()
    .typeError("Folder name is  not a word")
    .required("Folder name is missing"),
});

const FolderFolder = ({ data, onCancel, onSuccess }: Props) => {
  const { bookmarkToUpdate, parentId } = data;
  const { addBookmark, updateBookmark } = useBookmarks();
  const actionToPerform = data?.bookmarkToUpdate ? "update" : "create";
  const InitialFormValues: FormValues = {
    title: bookmarkToUpdate?.title ?? "",
  };

  const handleSubmit: FormikHandler<FormValues> = async ({ title }) => {
    if (actionToPerform === "update") {
      updateBookmark({
        id: bookmarkToUpdate?.id ?? "",
        title,
        type: "folder",
      });
    } else {
      addBookmark({
        id: bookmarkToUpdate?.id ?? "",
        title,
        type: "folder",
        parentId,
      });
    }

    onSuccess();
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={InitialFormValues}
      validationSchema={FormYupValidation}
    >
      {({ isValid, errors, handleChange, values, isSubmitting }) => (
        <Form>
          <div className="d-flex justify-content-center align-items-center">
            <div className="w-100">
              <div className="d-flex justify-content-between align-items-center"></div>
              <CustomInput
                name="title"
                label="Folder Name"
                placeholder="Enter Folder Title"
                error={errors.title}
                onChange={handleChange}
                value={values.title}
              />

              <div className="mt-4 d-flex gap-2">
                <CustomButton
                  type="submit"
                  disabled={!isValid}
                  className="w-100"
                  label={data?.bookmarkToUpdate ? "Update" : "Create New"}
                  loading={{
                    isLoading: isSubmitting,
                    label: "Saving",
                  }}
                />
                <CustomButton
                  className="w-100 btn-outline-primary"
                  label="Close"
                  onClick={onCancel}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default FolderFolder;
