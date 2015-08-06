/**
* a simple boundingbox with some get/set functions
* @constructor
* @param {object} args
* @param {integer|float} args.width=0 - width of the boundingbox
* @param {integer|float} args.height=0 - height of the boundingbox
* @param {integer|float} args.x=0 - x-position of the boundingbox
* @param {integer|float} args.y=0 - y-position of the boundingbox
* @param {nmap_element} args.element=null - the element of this specific bounding box
* @return {object} nmap_element
*/
var nmap_boundingbox = function(args){
	var defaults = {
		x : 0,
		y : 0,
		width : 0,
		height : 0,
		element : null
	};

	//merge givven arguments with default values
	var attr = nmap_extend(defaults, args);

	/**
	* Create nmapper_boundingbox
	* @constructor
	*/
	function nmapper_boundingbox(){}

	/**
	* return attributes of the object
	* @return {object} attr - all attributes of the object
	*/
	nmapper_boundingbox.attr = function(){
		return attr;
	};

	/**
	set the bounding parameters of the boundingbox
	* @param {object} bound_attr
	* @param {float|integer} bound_attr.x - x position of boundingbox
	* @param {float|integer} bound_attr.y - y position of boundingbox
	* @param {float|integer} bound_attr.width - width of boundingbox
	* @param {float|integer} bound_attr.height - height of boundingbox
	*/
	nmapper_boundingbox.setBounds = function(bound_attr){
		//merge new bounding box with existing bounding box (overwrite)
		attr = nmap_extend(attr, bound_attr);
	};

	/**
	* return element of the boundingbox
	* @return {nmap_element} element - element of the boundingbox
	*/
	nmapper_boundingbox.getElement = function(){ return attr.element; };

	/**
	* set the element value of the boundingbox
	* @param {nmap_boundingbox} element - element of the boundingbox
	*/
	nmapper_boundingbox.setElement = function(element){ attr.element = element; };

	return nmapper_boundingbox;
};