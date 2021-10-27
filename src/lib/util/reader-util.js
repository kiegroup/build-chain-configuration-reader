const { logger } = require("../common");

/**
 * Treats the url containing a expression between `%{` and `}` (without quotes)
 * @param {String} url with expressions
 */
function executeUrlExpressions(url) {
  let result = url;
  const expression = /%{([^%]+)}/g;
  let match;
  while ((match = expression.exec(url))) {
    logger.info(`Expression found in URL ${result}.`);
    logger.info(`Expression: ${match[1]}.`);

    try {
      const expressionEvalResult = eval(match[1]);
      logger.info(`Expression Result: ${expressionEvalResult}.`);
      result = result.replace(`%{${match[1]}}`, expressionEvalResult);
      logger.emptyLine();
    } catch (ex) {
      logger.error(
        `Error evaluating expression \`${match[1]}\` for url: \`${result}\``,
        ex
      );
      throw ex;
    }
  }
  return result;
}

/**
 * it treats the url in case it contains
 * @param {String} url a http(s)://whatever.domain/${GROUP}/${PROJECT_NAME}/${BRANCH}/whateverfile.txt format, where place olders are optional and can be placed anywhere on the string. They also can have default values.
 * @param {Object} placeHolders the key/values to replace url's place holders
 */
function treatUrl(url, placeHolders) {
  let result = url;
  if (placeHolders) {
    Object.entries(placeHolders).forEach(
      ([key, value]) =>
        (result = result.replace(
          new RegExp(`\\$\\{${key}(:[^}]+)?}`, "gi"),
          value
        ))
    );
  }

  return executeUrlExpressions(result);
}

function treatMapping(mapping) {
  if (mapping) {
    treatMappingDependencies(mapping.dependencies);
    treatMappingDependencies(mapping.dependant);
  }
}

function treatMappingDependencies(mappingDependencies) {
  Object.values(mappingDependencies || []).forEach(mappingElement =>
    mappingElement
      .filter(mapping => mapping.targetExpression)
      .forEach(mapping => {
        try {
          mapping.target = eval(mapping.targetExpression);
        } catch (ex) {
          logger.error(
            `Error evaluating expression \`${mapping.targetExpression}\` for source: \`${mapping.source}\``,
            ex
          );
          mapping.target = undefined;
        }
      })
  );
}

module.exports = { treatUrl, treatMapping, executeUrlExpressions };
