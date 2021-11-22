import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "transcripts");

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, "");

    let type;
    let data;

    // fileName.endsWith(".md")
    //   ? (type = "text")
    //   : fileName.endsWith(".json")
    //   ? (type = "json")
    //   : (type = "other");

    if (fileName.endsWith(".md")) {
      type = "text";
      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      data = matterResult.data;
    } else if (fileName.endsWith(".json")) {
      type = "json";
      // const fullPath = path.join(postsDirectory, fileName);
      // // const sentences = fs.readFileSync(fullPath);
      // // const sentences = { temp: "fs.readFile(fullPath);" };
      // const example = await import(fullPath);
      // const sentences = example.default;
      // data = { sentences };
    } else {
      type = "other";
    }

    // Combine the data with the id
    return {
      id,
      type,
      ...data,
    };
  });
  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
}

export async function getPostData(id) {
  let data;
  let transcriptExists;
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  let contentHtml = processedContent.toString();

  const fullPathJSON = path.join(postsDirectory, `${id}.json`);
  if (fs.existsSync(fullPathJSON)) {
    const file = fs.readFileSync(fullPathJSON);
    const sentences = JSON.parse(file);
    data = { sentences };
    transcriptExists = true;
  } else {
    transcriptExists = false;
  }

  // const checkJSONExists = await import(fullPathJSON);

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data,
    ...data,
    transcriptExists,
  };
}
