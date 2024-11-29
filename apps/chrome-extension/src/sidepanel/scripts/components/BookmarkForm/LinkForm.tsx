import * as yup from "yup";
import React, { useEffect, useState } from "react";
import CustomInput from "@components/CustomInput";
import CustomButton from "@components/CustomButton";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import { Formik, Form } from "formik";
import { BookmarkFormProps } from "./index";
import { FormikHandler } from "@chrome-extension/src/models";

interface Props {
  data: BookmarkFormProps;
  onCancel: VoidFunction;
  onSuccess: VoidFunction;
}

interface FormValues {
  title: string;
  url: string;
}

const FormYupValidation = yup.object({
  title: yup
    .string()
    .typeError("URL title is  not a word")
    .required("URL title is missing"),
  url: yup.string().typeError("URL is not a link").required("URL is missing"),
});

const LinkForm = ({ data, onCancel, onSuccess }: Props) => {
  const { bookmarkToUpdate, parentId } = data;
  const { addBookmark, updateBookmark } = useBookmarks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    title: bookmarkToUpdate?.title ?? "",
    url: bookmarkToUpdate?.url ?? "",
  });
  const actionToPerform = data?.bookmarkToUpdate ? "update" : "create";

  const handleSuccess = () => {
    setIsSubmitting(false);
    onSuccess();
  };

  const handleSubmit: FormikHandler<FormValues> = async ({ title, url }) => {
    setIsSubmitting(true);
    if (actionToPerform === "update") {
      updateBookmark(
        {
          id: bookmarkToUpdate?.id ?? "",
          title,
          type: "url",
        },
        handleSuccess
      );
      return;
    }

    addBookmark(
      {
        title,
        index: 0,
        id: bookmarkToUpdate?.id ?? "",
        type: "url",
        parentId,
        url,
      },
      handleSuccess
    );
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab.url && actionToPerform === "create") {
        setInitialFormValues({
          title: currentTab.title ?? "",
          url: currentTab.url,
        });
      }
    });
  }, []);

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={initialFormValues}
      validationSchema={FormYupValidation}
      enableReinitialize
    >
      {({ isValid, errors, handleChange, values }) => (
        <Form>
          <div className="d-flex justify-content-center align-items-center">
            <div className="w-100">
              <div className="d-flex justify-content-between align-items-center"></div>
              <CustomInput
                name="title"
                label="Title"
                placeholder="Enter URL Title"
                error={errors.title}
                onChange={handleChange}
                value={values.title}
              />

              <CustomInput
                name="url"
                label="URL"
                placeholder="Enter URL"
                error={errors.url}
                onChange={handleChange}
                value={values.url}
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

export default LinkForm;
