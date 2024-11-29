import { GoogleGenerativeAI } from "@google/generative-ai";
import { splitArrayTo2D } from "@utils/index";
import {
  BOOKMARK_DESCRIPTIONS_STORE_KEY,
  GEMINI_API_KEY,
  INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY,
  MAX_GEMINI_REQUEST_PER_BATCH,
} from "../constants";
import {
  ApiPaginatedResponse,
  BOOKMARK_UPLOAD_STATE,
  BookmarkNode,
  CachedBookmarkDescription,
  CachedBookmarkDescriptionContent,
  GetBookmarkDescriptionFromGemini,
} from "../models";

const getCachedBookmarkDescriptions = async () => {
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
  chrome.storage.local.set(
    {
      [BOOKMARK_DESCRIPTIONS_STORE_KEY]: {
        ...prevDescriptions,
        ...descriptions,
      },
    },
    () => {
      callback?.();
    }
  );
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
    const text = result.response.text();

    let sanitizedData = text.replace("```", "").replace("```", "").trim();

    if (sanitizedData.startsWith("json")) {
      sanitizedData = sanitizedData.replace("json", "");
    }

    if (sanitizedData.endsWith("json")) {
      sanitizedData = sanitizedData.replace("json", "");
    }

    if (sanitizedData.includes("```json")) {
      sanitizedData = sanitizedData.replace("```json", "");
    }

    if (sanitizedData.includes("```")) {
      sanitizedData = sanitizedData.replace("```", "");
    }

    return JSON.parse(sanitizedData) as T;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const generateBookmarkDescriptions = async (links: BookmarkNode[]) => {
  const prevDescriptions = await getCachedBookmarkDescriptions();
  const newDescriptions: CachedBookmarkDescriptionContent = {};
  const noOfArrasyPerRequest = Number(
    links.length / MAX_GEMINI_REQUEST_PER_BATCH
  );
  const responseStructure = JSON.stringify({
    id: "string",
    url: "string",
    description: "string",
    title: "string",
    bookmarkCreatedAt: "UTC Time Format",
  });
  const dividedArray = splitArrayTo2D({
    list: links,
    noOfElementsPerArray: noOfArrasyPerRequest,
  });

  for (const subArray of dividedArray) {
    const sanitizedSubArray = subArray.filter(
      (data) => prevDescriptions[data?.id]?.url !== data?.url
    );
    const prompt = `I am going to drop a list of links ${JSON.stringify(sanitizedSubArray)}. 
      And I want you to generate this JSON structure 
      { bookmarks: [${responseStructure}, ${responseStructure}] }. 
      The description should be a summary of the url content.
      If you cant figure out description using the entire url try to get the description using its origin only.
      Do try and generate or figure out what the website really is about.
      If you can't generate any summary return the url as the description not "null" just the url for its value. 
      I want the response to start with '{' and end with '}'. 
      Don't add anything special.
      Just return the structure i stated earlier which is { ${responseStructure} }, cool?.
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

    result?.bookmarks.forEach((bookmark) => {
      newDescriptions[bookmark.id] = {
        bookmarkCreatedAt: bookmark?.bookmarkCreatedAt,
        description: bookmark?.description,
        title: bookmark?.title,
        url: bookmark?.url,
      };
    });
    cacheBookmarkedLinkDescriptions(newDescriptions);
  }

  return newDescriptions;
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
    noOfElementsPerArray: request.length / MAX_GEMINI_REQUEST_PER_BATCH,
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

    const data = await makePrompt<GetBookmarkDescriptionFromGemini[]>(prompt);

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

export const getBookmarkUploadState = async () => {
  const response = (await chrome.storage.local.get(
    INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY
  )) as {
    [key in typeof INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY]: BOOKMARK_UPLOAD_STATE;
  };

  return response[INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY];
};

export const setBookmarkUploadState = async (
  newState: Partial<BOOKMARK_UPLOAD_STATE>
) => {
  const currentState = await getBookmarkUploadState();

  chrome.storage.local.set({
    [INITIAL_BOOKMARKS_UPLOAD_STATE_STORE_KEY]: {
      ...currentState,
      ...newState,
    },
  });
};
