import fs from "fs";
import prettier from "prettier";

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
  const pageFiles = fs.readdirSync("./src/pages");

  // create the /dist dir if it doesn't exist
  if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
  }

  // loop through each
  for (const pageFile of pageFiles) {
    // fetch the file contents
    const pageData = require(`../src/pages/${pageFile}`).default;

    // generate the page by replacing any template variables, and write it to dist
    fs.writeFileSync(
      `./dist/${pageFile.replace(/\.ts$/, ".html")}`,
      await prettier.format(processTemplate(layoutFile, pageData), {
        parser: "html",
      })
    );
  }
})();
