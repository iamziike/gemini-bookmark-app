import { GoogleGenerativeAI } from "@google/generative-ai";
import { BOOKMARK_STORAGE_KEY } from "@constants/index";
import { GEMINI_API_KEY } from "@chrome-extension/src/constants";
import { splitArrayTo2D } from "@utils/index";
import {
  BookmarkNode,
  CachedBookmarkDescription,
  CachedBookmarkDescriptionContent,
} from "@chrome-extension/src/models";

export const makePrompt = async (prompt: string) => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const getAllBookmarkedLinks = (nodes: BookmarkNode[]) => {
  const links: ({ id: string; url: string } & BookmarkNode)[] = [];
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

export const getCachedBookmarkDescriptions = async () => {
  const result = (await chrome.storage.local.get(
    BOOKMARK_STORAGE_KEY
  )) as CachedBookmarkDescription;
  return result.BOOKMARK_STORAGE_KEY || {};
};

export const cacheBookmarkedLinkDescriptions = async (
  descriptions: CachedBookmarkDescriptionContent,
  callback?: VoidFunction
) => {
  const prevDescriptions = await getCachedBookmarkDescriptions();
  chrome.storage.local.set(
    {
      [BOOKMARK_STORAGE_KEY]: {
        ...prevDescriptions,
        ...descriptions,
      },
    },
    () => {
      callback?.();
    }
  );
};

export const generateBookmarkDescriptions = async (links: BookmarkNode[]) => {
  const bookmarkLinks = getAllBookmarkedLinks(links).slice(0, 10);
  const maxRequestsPerBatch = Number(bookmarkLinks.length / 2);
  const dividedArray = splitArrayTo2D(bookmarkLinks, maxRequestsPerBatch);
  let description: CachedBookmarkDescriptionContent = {};

  for (const subArray of dividedArray) {
    try {
      const prompt = `I am going to drop a list of links [${subArray.map(
        (data) => JSON.stringify(data)
      )}]. 
        And I want you to generate this JSON structure 
        { [id]: {url:string, description: string} }. 
        The description should be a summary of the url content.
        if you cant generate any summary return null not "null" just null for its value. 
        I just want only the json data structure, no extra text is needed. 
        I want the response to start with '{' and end with '}'. 
        And within it should be the link and description pair. Got it?`;

      const result = await makePrompt(prompt);
      let sanitizedData = result.replace("```", "").replace("```", "").trim();

      if (sanitizedData.startsWith("json")) {
        sanitizedData = sanitizedData.replace("json", "");
      }

      if (sanitizedData.endsWith("json")) {
        sanitizedData = sanitizedData.replace("json", "");
      }

      description = { ...description, ...JSON.parse(sanitizedData) };
      cacheBookmarkedLinkDescriptions(description);
    } catch (err) {
      console.log(err);
    }
  }

  return description;
};

export const generateDescriptionForNewUsers = async () => {
  chrome.bookmarks.getTree(async (tree) => {
    generateBookmarkDescriptions(tree || []);
  });
};

export const deleteABookmarkedDescription = async (
  id: string,
  callback?: VoidFunction
) => {
  const bookmarkDescriptions = await getCachedBookmarkDescriptions();

  delete bookmarkDescriptions[id];

  chrome.storage.local.set(
    {
      [BOOKMARK_STORAGE_KEY]: {
        ...bookmarkDescriptions,
      },
    },
    () => {
      callback?.();
    }
  );
  return true;
};
