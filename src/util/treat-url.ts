import { safeEval } from "@bc-cr/util/safe-eval";

/**
 * Replaces any placeholders with correct values and executes any expression and replaces the expression with the execution result
 * @param {String} url a url which can contain placeholders as well as expressions. 
 * For eg: http(s)://domain/${GROUP}/${PROJECT_NAME}/${BRANCH}/whateverfile%{new Number(3).toString()}.txt
 * @param group [OPTIONAL] Value for ${GROUP} placeholder. Overrides the default value
 * @param name [OPTIONAL] Value for ${PROJECT_NAME} placeholder. Overrides the default value
 * @param branch [OPTIONAL] Value for ${BRANCH} placeholder. Overrides the default value
 * @returns {string} url with no placeholders and expressions
 */
export function treatUrl(
  url: string,
  group?: string,
  name?: string,
  branch?: string
): string {
  return replacePlaceholders(replaceExpressions(url), group, name, branch);
}

/**
 * Generates placeholders values required to replace any place holders in the definition file url
 * @param url url which contains the placeholders. For eg: https://github.com/${GROUP}/${NAME:build-chain}
 * @param group [OPTIONAL] Value for ${GROUP} placeholder. Overrides the default value
 * @param name [OPTIONAL] Value for ${PROJECT_NAME} placeholder. Overrides the default value
 * @param branch [OPTIONAL] Value for ${BRANCH} placeholder. Overrides the default value
 * @returns {string} url with no placeholders
 */
function replacePlaceholders(
  url: string,
  group?: string,
  name?: string,
  branch?: string
): string {
  let result = url;

  // all url place holders are of the form ${KEY:DEFAULT} where :DEFAULT is optional
  const placeholderRegex = /\${([^{}:]+)(:([^{}]*))?}/g;
  const matches = [...url.matchAll(placeholderRegex)];
  matches.forEach(match => {
    const key = match[1];
    // if env variable is not defined then use default value 
    let value = process.env[key] ?? match[3] ?? "";
    if (key === "GROUP" && group) {
      value = group;
    } else if (key === "PROJECT_NAME" && name) {
      value = name;
    } else if (key === "BRANCH" && branch) {
      value = branch;
    }

    result = result.replace(
      new RegExp(`\\$\\{${key}(:([^{}]*))?}`, "gi"),
      value
    );
  });
  return result;
}

/**
 * Treats the url containing a expression between `%{` and `}` (without quotes)
 * Any string contained in `%{` and `}` is executed as javascript code. The result it produces, replaces the expression in the url
 * @param url with expressions
 * @returns {string} url with no expressions
 */
function replaceExpressions(url: string): string {
  let result = url;
  const expressionRegex = /%{([^%]+)}/g;
  const matches = [...url.matchAll(expressionRegex)];
  matches.forEach(match => {
    result = result.replace(`%{${match[1]}}`, safeEval(match[1]) as string);
  });
  return result;
}
