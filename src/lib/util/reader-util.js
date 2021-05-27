/**
 * it treats the url in case it contains
 * @param {String} url a http(s)://whatever.domain/${GROUP}/${PROJECT_NAME}/${BRANCH}/whateverfile.txt format, where place olders are optional and can be placed anywhere on the string
 * @param {Object} placeHolders the key/values to replace url's place holders
 */
function treatUrl(url, placeHolders) {
  let result = url;
  if (placeHolders) {
    Object.entries(placeHolders).forEach(
      ([key, value]) => (result = result.replace(`$\{${key}}`, value))
    );
  }
  return result;
}

function treatMapping(mapping) {
  if (mapping) {
    treatMappingDependencies(mapping.dependencies);
    treatMappingDependencies(mapping.dependant);
  }
}

function treatMappingDependencies(mappingDependencies) {
  Object.values(mappingDependencies || [])
    .filter(mapping => mapping.targetExpression)
    .forEach(mapping => {
      try {
        mapping.target = eval(mapping.targetExpression);
      } catch (ex) {
        console.error(
          `Error evaluating expression \`${mapping.targetExpression}\` for source: \`${mapping.source}\``,
          ex
        );
        mapping.target = undefined;
      }
    });
}

module.exports = { treatUrl, treatMapping };
