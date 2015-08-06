/**
* merging two objects, source will replace duplicates in destination
* @param {object} destination
* @param {object} source
*/
function nmap_extend(destination, source) {
	var returnObj = {};
	for (var attrname in destination) { returnObj[attrname] = destination[attrname]; }
	for (attrname in source) { returnObj[attrname] = source[attrname]; }
	return returnObj;
}