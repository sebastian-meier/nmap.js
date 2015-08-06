/**
* a simple object with some get/set functions
* @constructor
* @param {object} args
* @param {integer} args.id=1 - ID of the element
* @param {integer|float} args.klass=1 - class of the element (this can be used for styling, this does not influence the algorithm)
* @param {integer|float} args.weight=1 - weight option (defines the relative size of a rectangle within the treemap)
* @param {integer|float} args.x=0 - original x-position of the element
* @param {integer|float} args.y=0 - original y-position of the element
* @return {object} nmap_element
*/
var nmap_element = function(args){
	var defaults = {
		id : 1,
		klass : 1,
		weight : 1,
		x : 0,
		y : 0
	};

	//merge givven arguments with default values
	var attr = nmap_extend(defaults, args);

	/**
	* Create nmapper_element
	* @constructor
	*/
	function nmapper_element(){}

	/**
	* return attributes of the object
	* @return {object} attr - all attributes of the object
	*/
	nmapper_element.attr = function(){
		return attr;
	};

	/**
	* return x value of the object
	* @return {float} x - x attribute of the object
	*/
	nmapper_element.getX = function(){return parseFloat(attr.x);};

	/**
	* set the x value of the object
	* @param {float|integer} x - x attribute of the object
	*/
	nmapper_element.setX = function(x){ attr.x = x;};

	/**
	* return y value of the object
	* @return {float} y - y attribute of the object
	*/
	nmapper_element.getY = function(){return parseFloat(attr.y);};
	
	/**
	* set the y value of the object
	* @param {float|integer} y - y attribute of the object
	*/
	nmapper_element.setY = function(y){ attr.y = y;};

	/**
	* return id value of the object
	* @return {float} id - id attribute of the object
	*/
	nmapper_element.getId = function(){return attr.id;};

	/**
	* set the id value of the object
	* @param {float|integer} id - id attribute of the object
	*/
	nmapper_element.setId = function(id){ attr.id = id;};

	/**
	* return klass value of the object
	* @return {float} klass - class attribute of the object
	*/
	nmapper_element.getKlass = function(){return parseFloat(attr.klass);};

	/**
	* set the klass value of the object
	* @param {float|integer} klass - klass attribute of the object
	*/
	nmapper_element.setKlass = function(klass){attr.klass = klass;};

	/**
	* return weight value of the object
	* @return {float} weight - weight attribute of the object
	*/
	nmapper_element.getWeight = function(){return parseFloat(attr.weight);};

	/**
	* set the weight value of the object
	* @param {float|integer} weight - weight attribute of the object
	*/
	nmapper_element.setWeight = function(weight){attr.weight = weight;};

	return nmapper_element;
};