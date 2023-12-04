import fs from "fs";
import prettier from "prettier";
import config from "../src/config";

const pagesMap = <any>config.pages;

// parses templateString and replaces with any params
function processTemplate(
  templateString: string,
  params: { [x in string]: string | null } | null | undefined
) {
  let templateStringModified = templateString;

  // if params is provided, attempt to replace the template variables
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // need to escape any quotes, so they don't mess up the JSON
      // const escapedValue = value ? value.replace(/"/g, '\\"') : "";

      const currentRegex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      templateStringModified = templateStringModified.replace(
        currentRegex,
        value ?? ""
      );
    });
  }

  // replace any remaining template variables with "undefined"
  templateStringModified = templateStringModified.replace(
    /{{\s*([^}]*)\s*}}/g,
    "undefined"
  );

  return templateStringModified;
}

(async function () {
  // get the default layout file
  const layoutFile = fs.readFileSync(`./src/layout/default.html`, {
    encoding: "utf8",
  });

  // get all of the page files
  const pageFiles = fs
    .readdirSync("./src/pages")
    .filter((e) => e.match(/\.html$/));

  // create the /dist dir if it doesn't exist
  if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
  }

  // loop through each
  for (const pageFile of pageFiles) {
    const pageName = pageFile.replace(/\.html$/, "");

    // fetch the page metadata
    const pageMetadata = pagesMap[pageName];

    // fetch the html content
    const htmlData = fs.readFileSync(`./src/pages/${pageName}.html`, {
      encoding: "utf-8",
    });

    // generate the page by replacing any template variables, and write it to dist
    fs.writeFileSync(
      `./dist/${pageName}.html`,
      await prettier.format(
        processTemplate(layoutFile, { content: htmlData, ...pageMetadata }),
        {
          parser: "html",
        }
      )
    );
  }
})();
