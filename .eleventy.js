const path = require("path");

const handlebarsPlugin = require("@11ty/eleventy-plugin-handlebars");
const browserslist = require("browserslist");
const { bundle, browserslistToTargets, composeVisitors, transform } = require("lightningcss");

const browserTargets = ">= 0.5% in US, >= 0.5% in FR, last 2 versions and not dead";

module.exports = async function (eleventyConfig) {

  const { HtmlBasePlugin } = await import("@11ty/eleventy");
  eleventyConfig.addPlugin(HtmlBasePlugin); // <base> plugin
  eleventyConfig.addPlugin(handlebarsPlugin); // Handlebars :{

  eleventyConfig.addPassthroughCopy("./src/assets");
  // eleventyConfig.addPassthroughCopy("./src/js");

  // -- Add CSS as template format
  eleventyConfig.addTemplateFormats("css");

  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (_inputContent, inputPath) {

      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) { return; } // Skip @import files

      let targets = browserslistToTargets(browserslist(browserTargets));

      const urlVisitor = {
        Url(url) {
          return {
            url: eleventyConfig.getFilter("url")(url.url),
            loc: url.loc,
          }
        }
      }

      return async () => {
        let {code} = bundle({
          filename: inputPath,
          minify: true,
          sourceMap: false,
          targets: targets,
          visitor: urlVisitor
        });

        return code;
      }
    }
  });

  // Custom shortcodes/ filters/ helpers
  eleventyConfig.addShortcode("eq", (a, b) => {
    return a === b;
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
}