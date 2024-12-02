import * as yup from "yup";
import React, { useCallback, useReducer, useState } from "react";
import CustomModal from "@components/CustomModal";
import searchImage from "@assets/images/search.svg";
import CustomButton from "@components/CustomButton";
import CustomTextArea from "@components/CustomTextArea";
import useBookmarks from "@chrome-extension/src/hooks/useBookmarks";
import Loading from "@components/Loading";
import customYupValidation from "@constants/validationSchemas";
import {
  INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY,
  SIDE_PANEL_PAGES,
} from "@chrome-extension/src/constants";
import { Link } from "react-router-dom";
import { Form, Formik } from "formik";
import {
  openInNewWindow,
  formatDate,
  getLocalStorageData,
  waitFor,
} from "@utils/index";
import { useInViewEffect } from "react-hook-inview";
import {
  ApiPaginatedResponse,
  GetBookmarkDescriptionFromGemini,
  INITIAL_BOOKMARK_DESCRIPTION_GENERATE_STATE,
} from "@chrome-extension/src/models";
import useCustomAlert from "@components/CustomAlert/useCustomAlert";

const FormYupValidation = yup.object({
  searchQuery: customYupValidation.searchQuery,
});

interface State {
  isSearchValueFormModalVisible: boolean;
  isSearchResultsModalVisible: boolean;
  searchQuery: string;
  searchResultCurrentPageIndex: number;
  isSearching: boolean;
  searchResults: ApiPaginatedResponse<
    GetBookmarkDescriptionFromGemini[]
  > | null;
}

const BookmarkSearch = () => {
  const { showWarningAlert } = useCustomAlert();
  const { getLinksThatMatchSearch, getBookmarkFaviconURL } = useBookmarks();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setIsLoadMoreDataVisible] = useState(false);
  const [state, updateState] = useReducer(
    (state: State, newState: Partial<State>) => {
      return { ...state, ...newState };
    },
    {
      isSearching: false,
      isSearchValueFormModalVisible: false,
      isSearchResultsModalVisible: false,
      searchResultCurrentPageIndex: 1,
      searchResults: null,
      searchQuery: "",
    }
  );

  const loadMoreDataRef = useInViewEffect(
    ([entry]) => {
      if (entry.isIntersecting) {
        handleFetchNewData(
          (state.searchResults?.page ?? 1) + 1,
          state?.searchQuery
        );
      }
      setIsLoadMoreDataVisible(entry.isIntersecting);
    },
    { threshold: 0.5 },
    [state]
  );

  const handleSubmit = useCallback(
    async ({ searchQuery }: { searchQuery: string }) => {
      if (searchQuery?.toLowerCase() === state?.searchQuery?.toLowerCase()) {
        updateState({
          isSearchResultsModalVisible: true,
          isSearchValueFormModalVisible: false,
        });
        return;
      }

      updateState({ isSearching: true });

      const response = await getLinksThatMatchSearch({
        searchQuery,
        page: 1,
      });

      if (response?.type === "error" && response?.status === 429) {
        await waitFor(5);
        handleSubmit({ searchQuery });
        return;
      }

      if (response?.type === "success") {
        updateState({
          isSearching: false,
          searchQuery,
          searchResults: response,
          isSearchResultsModalVisible: true,
          isSearchValueFormModalVisible: false,
        });
      }
    },
    [state]
  );

  const handleFetchNewData = useCallback(
    async (page: number, searchQuery: string) => {
      updateState({
        isSearching: true,
      });

      const response = await getLinksThatMatchSearch({
        searchQuery,
        page,
      });

      if (response?.type === "error" && response?.status === 429) {
        await waitFor(5);
        handleFetchNewData(page, searchQuery);
      }

      if (response?.type === "success") {
        const updatedSearch = {
          isPageEnd: response?.isPageEnd ?? true,
          page: response?.page ?? 1,
          pageSize: response?.pageSize ?? 1,
          totalRecords: response?.totalRecords ?? 1,
          data: [
            ...(state?.searchResults?.data ?? []),
            ...(response?.data ?? []),
          ],
        };

        updateState({
          isSearching: false,
          searchResults: updatedSearch,
        });
      }
    },
    [state]
  );

  const getBookmarkDescriptionGenerateState = async () => {
    const response =
      await getLocalStorageData<INITIAL_BOOKMARK_DESCRIPTION_GENERATE_STATE>(
        INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY
      );

    if (response?.state === "PENDING") {
      showWarningAlert({
        content: {
          title: "Bookmarks Search",
          message:
            "We are currently processing all your existing bookmarks. Searching for bookmarks may be incomplete",
        },
        buttons: {
          proceed: {
            label: "Proceed",
          },
        },
        onProceed() {
          updateState({ isSearchValueFormModalVisible: true });
        },
      });
      return;
    }

    updateState({ isSearchValueFormModalVisible: true });
  };

  return (
    <>
      <Link
        to={SIDE_PANEL_PAGES.HOME}
        onClick={getBookmarkDescriptionGenerateState}
        className="list-unstyled btn btn-primary d-flex align-items-center"
      >
        <img src={searchImage} alt="search image" /> Search
      </Link>

      <CustomModal
        visible={state.isSearchValueFormModalVisible}
        showCloseIcon={false}
        padding={false}
        size="md"
      >
        <Formik
          className="p-3"
          validationSchema={FormYupValidation}
          onSubmit={handleSubmit}
          initialValues={{
            searchQuery: state?.searchQuery,
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
                  placeholder="Bookmarks that start with Gemini and were added on Monday around 4pm"
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
          <h4 className="position-sticky bg-white top-0 border-bottom text-center text-uppercase font-family-secondary">
            Results
          </h4>
          <div
            className="hide-scroll-bar"
            style={{
              minHeight: "50px",
              maxHeight: "50vh",
              overflowY: "scroll",
              overflowX: "hidden",
            }}
          >
            <div className="row gap-2">
              {state.searchResults?.data?.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="d-flex align-items-center pointer gap-2 font-family-secondary text-nowrap"
                  onClick={() => {
                    openInNewWindow(bookmark.url);
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

              {!state.searchResults?.data?.length &&
                state?.searchResults?.isPageEnd &&
                !state?.isSearching && (
                  <div className="text-center my-3">
                    <div>Nothing To See</div>
                  </div>
                )}

              {state?.isSearching && (
                <div className={"text-center w-100"}>
                  <Loading isLoading size="small" />
                </div>
              )}

              {!state?.searchResults?.isPageEnd && !state?.isSearching && (
                <div ref={loadMoreDataRef} className="text-center w-100" />
              )}
            </div>
          </div>

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
