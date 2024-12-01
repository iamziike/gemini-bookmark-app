import { GoogleGenerativeAI } from "@google/generative-ai";
import { splitArrayTo2D, transformGeminiResponseToJSON } from "@utils/index";
import {
  BOOKMARK_DESCRIPTIONS_STORE_KEY,
  GEMINI_API_KEY,
  INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY,
  MAX_GEMINI_REQUEST_PER_BATCH,
} from "../constants";
import {
  ApiPaginatedResponse,
  INITIAL_BOOKMARK_DESCRIPTION_GENERATE_STATE,
  BookmarkNode,
  CachedBookmarkDescription,
  CachedBookmarkDescriptionContent,
  DragAndDropNode,
  GetBookmarkDescriptionFromGemini,
} from "../models";

export const getCachedBookmarkDescriptions = async () => {
  const result = (await chrome.storage.local.get(
    BOOKMARK_DESCRIPTIONS_STORE_KEY
  )) as CachedBookmarkDescription;
  return result[BOOKMARK_DESCRIPTIONS_STORE_KEY] || {};
};

const cacheBookmarkedLinkDescriptions = async (
  descriptions: CachedBookmarkDescriptionContent | null,
  callback?: VoidFunction
) => {
  const prevDescriptions = await getCachedBookmarkDescriptions();
  const newDescriptions = {
    ...prevDescriptions,
    ...descriptions,
  };

  await chrome.storage.local.set(
    {
      [BOOKMARK_DESCRIPTIONS_STORE_KEY]: newDescriptions,
    },
    () => {
      callback?.();
    }
  );

  return newDescriptions;
};

export const isBookmarkALink = (value?: BookmarkNode | null) => {
  return Boolean(value?.url?.length);
};

export const getAllBookmarkedLinks = (nodes: BookmarkNode[]) => {
  const links: BookmarkNode[] = [];
  const getLinks = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (node.url) {
        links.push({ ...node, id: node.id, url: node.url });
      }
      if (node.children) {
        getLinks(node.children);
      }
    }
  };

  getLinks(nodes);

  return links;
};

export const transformBookmarksToDragAndDropNodes = (nodes: BookmarkNode[]) => {
  const dragAndDropNodes: DragAndDropNode[] = [];
  const getNodes = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      dragAndDropNodes.push({
        id: node.id,
        parent: node?.parentId ?? "",
        text: node?.title,
        droppable: !node.url,
        data: { ...node },
      });
      if (node.children) {
        getNodes(node.children);
      }
    }
  };

  getNodes(nodes);

  return dragAndDropNodes;
};

export const deleteABookmarkedDescription = async (
  id: string,
  callback?: VoidFunction
) => {
  const bookmarkDescriptions = await getCachedBookmarkDescriptions();

  delete bookmarkDescriptions[id];

  chrome.storage.local.set(
    {
      [BOOKMARK_DESCRIPTIONS_STORE_KEY]: {
        ...bookmarkDescriptions,
      },
    },
    () => {
      callback?.();
    }
  );
  return true;
};

const makePrompt = async <T>(prompt: string) => {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent(prompt);
    const data = transformGeminiResponseToJSON<T>(result.response.text());

    return {
      data,
    };
  } catch (err) {
    const error = err as { status: number; message: string };

    return {
      type: "error",
      data: null,
      status: error?.status,
      message: error?.message,
    };
  }
};

export const generateBookmarkDescriptions = async (
  links: BookmarkNode[],
  onBatchComplete?: (args: {
    currentDescriptions: CachedBookmarkDescriptionContent;
    links: BookmarkNode[];
    nextBatch: BookmarkNode[];
  }) => void
) => {
  const bookmarkDescriptions = await getCachedBookmarkDescriptions();
  links = links.filter((link) => !bookmarkDescriptions[link?.id]);
  const formatedLinks = links.map((link) => {
    return {
      id: link?.id,
      title: link?.title,
      url: link?.url,
      date: new Date(Number(link?.dateAdded)),
    };
  });

  const responseStructure = JSON.stringify({
    id: "string",
    url: "string",
    description: "string",
    title: "string",
    bookmarkCreatedAt: "UTC Time Format",
  });
  const dividedArray = splitArrayTo2D({
    list: formatedLinks,
    noOfElementsPerArray: MAX_GEMINI_REQUEST_PER_BATCH,
  });

  for (const [index, subArray] of dividedArray.entries()) {
    const prompt = `I am going to drop a list of links ${JSON.stringify(subArray)}. 
        And I want you to generate this JSON structure 
        { bookmarks: [${responseStructure}, ${responseStructure}] }. 
        The description should be a summary of the url content.
        If you cant figure out description using the entire url try to get the description using its origin only.
        Do try and generate or figure out what the website really is about.
        If you can't generate any summary return the url as the description not "null" just the url for its value. 
        I want the response to start with { and end with }'. 
        Don't add anything special.
        Just return the structure i stated earlier which is { bookmarks: [${responseStructure}, ${responseStructure}] }, cool?.
        And within it should be the link and description pair. Got it?`;

    const result = await makePrompt<{
      bookmarks: {
        url: string;
        id: string;
        description: string;
        title: string;
        bookmarkCreatedAt: string;
      }[];
    }>(prompt);

    if (result?.type === "error") {
      return result;
    }

    result?.data?.bookmarks.forEach((bookmark) => {
      bookmarkDescriptions[bookmark.id] = {
        bookmarkCreatedAt: bookmark?.bookmarkCreatedAt,
        description: bookmark?.description,
        title: bookmark?.title,
        url: bookmark?.url,
      };
    });

    const currentDescriptions =
      await cacheBookmarkedLinkDescriptions(bookmarkDescriptions);

    onBatchComplete?.({
      links,
      currentDescriptions,
      nextBatch: dividedArray[index + 1],
    });
  }

  return bookmarkDescriptions;
};

export const searchBookmarkDescriptions = async function ({
  searchQuery,
  page,
}: {
  searchQuery: string;
  page: number;
}): Promise<ApiPaginatedResponse<GetBookmarkDescriptionFromGemini[]> | null> {
  const descriptions = await getCachedBookmarkDescriptions();
  const request = Object.keys(descriptions).map((id) => ({
    id,
    ...descriptions[id],
  }));
  const descriptionsToUse = splitArrayTo2D({
    list: request,
    noOfElementsPerArray: MAX_GEMINI_REQUEST_PER_BATCH,
  });

  const responseStructure = JSON.stringify({
    id: "string",
    url: "string",
    title: "string",
    bookmarkCreatedAt: "UTC",
  });

  try {
    const prompt = `I am going to drop a list of links ${JSON.stringify(descriptionsToUse[page - 1])}. 
        And I want you to filter and return the objects that its description, url or title matches or resembles this query: ${searchQuery}.
        The response should look like [${responseStructure}, ${responseStructure}].
        I just want only the json data structure, no extra text is needed.
        I want the response to start with '[' and end with ']'. 
        And within it should be an array [${responseStructure}]. Got it?`;

    const { data } =
      await makePrompt<GetBookmarkDescriptionFromGemini[]>(prompt);

    return {
      data,
      page,
      totalRecords: descriptionsToUse.length,
      pageSize: MAX_GEMINI_REQUEST_PER_BATCH,
      isPageEnd: descriptionsToUse.length === page,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getInitialBookmarkDescriptionGenerateState = async () => {
  const response = (await chrome.storage.local.get(
    INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY
  )) as {
    [key in typeof INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY]: INITIAL_BOOKMARK_DESCRIPTION_GENERATE_STATE | null;
  };

  return response[INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY];
};

export const setInitialBookmarkDescriptionGenerateState = async (
  newState: Partial<INITIAL_BOOKMARK_DESCRIPTION_GENERATE_STATE>
) => {
  const currentState = await getInitialBookmarkDescriptionGenerateState();

  chrome.storage.local.set({
    [INITIAL_BOOKMARKS_GENERATE_STATE_STORE_KEY]: {
      ...currentState,
      ...newState,
    },
  });
};
