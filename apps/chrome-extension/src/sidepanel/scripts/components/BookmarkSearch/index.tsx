import * as yup from "yup";
import React, { useReducer } from "react";
import CustomModal from "@components/CustomModal";
import searchImage from "@assets/images/search.svg";
import CustomButton from "@components/CustomButton";
import CustomTextArea from "@components/CustomTextArea";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import InfiniteScroll from "react-infinite-scroll-component";
import { SIDE_PANEL_PAGES } from "@chrome-extension/src/constants";
import { Link } from "react-router-dom";
import { Form, Formik } from "formik";
import { copyToClipboard, formatDate } from "@utils/index";
import {
  ApiPaginatedResponse,
  GetBookmarkDescriptionFromGemini,
} from "@chrome-extension/src/models";

const FormYupValidation = yup.object({
  searchQuery: yup.string().required("Search Query is missing"),
});

interface State {
  isSearchValueFormModalVisible: boolean;
  isSearchResultsModalVisible: boolean;
  searchQuery: string;
  searchResultCurrentPageIndex: number;
  searchResults: ApiPaginatedResponse<
    GetBookmarkDescriptionFromGemini[]
  > | null;
}

const BookmarkSearch = () => {
  const { getLinksThatMatchSearch, getBookmarkFaviconURL } = useBookmarks();
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    {
      isSearchValueFormModalVisible: false,
      isSearchResultsModalVisible: false,
      searchResultCurrentPageIndex: 1,
      searchResults: null,
      searchQuery: "",
    }
  );

  const handleFetchData = async ({
    searchQuery,
    page = 1,
  }: {
    searchQuery: string;
    page: number;
  }) => {
    if (!searchQuery) {
      return;
    }

    const searchResults = await getLinksThatMatchSearch({
      searchQuery,
      page,
    });

    updateState({
      searchQuery,
      searchResults,
      isSearchResultsModalVisible: true,
      isSearchValueFormModalVisible: false,
    });
  };

  return (
    <>
      <Link
        to={SIDE_PANEL_PAGES.HOME}
        onClick={() => updateState({ isSearchValueFormModalVisible: true })}
        className="list-unstyled btn btn-primary d-flex align-items-center"
      >
        <img src={searchImage} alt="search image" /> Search
      </Link>

      <CustomModal
        visible={state.isSearchValueFormModalVisible}
        showCloseIcon={false}
        padding={false}
      >
        <Formik
          className="p-3"
          validationSchema={FormYupValidation}
          initialValues={{
            searchQuery: state?.searchQuery,
          }}
          onSubmit={({ searchQuery }) => {
            handleFetchData({ searchQuery, page: 1 });
          }}
        >
          {({ handleChange, errors, isSubmitting, isValid, values }) => (
            <Form className="p-2 pt-2 py-1">
              <label className="d-block mb-2">
                <h4 className="text-center text-uppercase font-family-secondary">
                  Bookmarks Lookup
                </h4>
                <CustomTextArea
                  rows={5}
                  onChange={handleChange}
                  name="searchQuery"
                  style={{ resize: "none" }}
                  value={values.searchQuery}
                  placeholder="Bookmarks that start with Gemini and were added on Monday around 4pm?"
                  error={errors?.searchQuery}
                />
              </label>
              <div className="d-flex justify-content-end gap-2">
                <CustomButton
                  type="submit"
                  label="Search"
                  disabled={!isValid}
                  loading={{ isLoading: isSubmitting }}
                />
                <CustomButton
                  type="button"
                  label="Cancel"
                  className="btn-outline-primary"
                  onClick={() => {
                    updateState({ isSearchValueFormModalVisible: false });
                  }}
                />
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>

      <CustomModal
        padding={false}
        visible={state.isSearchResultsModalVisible}
        className="pb-0"
        onDismiss={() => {
          updateState({ isSearchResultsModalVisible: false });
        }}
      >
        <div className="p-2 py-1">
          <h4 className="position-sticky bg-white top-0 border-bottom pb-2 text-center text-uppercase font-family-secondary">
            Results
          </h4>
          <InfiniteScroll
            className="row gap-2"
            dataLength={state.searchResults?.totalRecords ?? 1} //This is important field to render the next data
            hasMore={!state.searchResults?.isPageEnd}
            loader={<h4>Loading...</h4>}
            next={() => {
              const newPage = state.searchResults?.page ?? 1;
              handleFetchData({
                searchQuery: state.searchQuery,
                page: newPage + 1,
              });
              console.log("INSIDE");
            }}
          >
            {state.searchResults?.data?.map((bookmark) => (
              <div
                key={bookmark.id}
                className="d-flex align-items-center pointer gap-2 font-family-secondary text-nowrap"
                onClick={() => {
                  console.log(bookmark);
                  copyToClipboard(bookmark.url);
                }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={getBookmarkFaviconURL(bookmark?.url ?? "")}
                    alt="url favicon"
                    width={24}
                  />
                </div>
                <div className="row justify-content-between ellipsis align-items-center">
                  <div className="ellipsis pointer">{bookmark.title}</div>
                  <div className="small">
                    {formatDate({
                      date: bookmark?.bookmarkCreatedAt,
                      format: "MMMM D, YYYY • h:mm A",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {!state.searchResults?.data?.length && (
              <div className="text-center my-3">
                <div>Nothing To See</div>
              </div>
            )}
          </InfiniteScroll>

          <div className="position-sticky bg-white bottom-0 d-flex justify-content-end gap-2 pt-2">
            <CustomButton
              type="button"
              label="Back"
              className="btn-outline-primary"
              onClick={() => {
                updateState({
                  isSearchResultsModalVisible: false,
                  isSearchValueFormModalVisible: true,
                });
              }}
            />
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default BookmarkSearch;