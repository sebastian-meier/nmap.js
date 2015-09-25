//JavaScript implementation of http://nmap.vicg.icmc.usp.br/
/*global goog:false */

/**
* this is constructing the nmap algorithm function
* @constructor
* @param {object} args
* @param {integer|float} args.width=1 - width of the treemap
* @param {integer|float} args.height=1 - height of the treemap
* @param {integer|float} args.x=0 - x-position of the treemap
* @param {integer|float} args.y=0 - y-position of the treemap
* @param {nmap_boundingbox} args.visualSpace=null - this doesn't need to be defined for initialization, as this is a recursive function, it calls itself to work on a smaller fraction of the problem and therefore we need this attribute
* @param {boolean} args.HORIZONTAL=true - Don't touch this
* @param {boolean} args.HORIZONTAL=false - Don't touch this
* @return {object} nmap
*/
var nmap = function(args){
	var defaults = {
		x:0,
		y:0,
		width:1,
		height:1,
		visualSpace : null,
		HORIZONTAL : true,
		VERTICAL : false
	};

	//merge given arguments and defaults
	var attr = nmap_extend(defaults, args);

	/**
	* Create nmapper
	* @constructor
	*/
	function nmapper(){
		//Initially there is no visualSpace given, therefore we set the visualSpace to the bounding box of the full treemap
		if(attr.visualSpace === null){
			attr.visualSpace = new nmap_boundingbox({
				x:attr.x,
				y:attr.y,
				height:attr.height,
				width:attr.width
			});
		}
	}

	nmapper();

	/**
	 * return attributes of the object
	 * @return {object} attr - all attributes of the object
	 */
	nmapper.attr = function(){
		return attr;
	};

	/**
	* normalize the 2d coordinates to the given bounding box of the treemap
	* @param {array} elements - array of nmap_element objects
	* @return {array} elements - array of nmap_element objects
	*/
	nmapper.normalize = function(elements){
		//if elements are given
		if(elements !== null){
			//get max and min for x and y for the set of points
			var maxx = Number.MIN_VALUE;
			var minx = Number.MAX_VALUE;

			var maxy = Number.MIN_VALUE;
			var miny = Number.MAX_VALUE;

			for(var i = 0; i<elements.length; i++){
				maxx = Math.max(maxx, elements[i].getX());
				minx = Math.min(minx, elements[i].getX());
				maxy = Math.max(maxy, elements[i].getY());
				miny = Math.min(miny, elements[i].getY());
			}

			//REMOVE ???
			if(!isFinite(maxx)){maxx=0;}
			if(!isFinite(maxy)){maxy=0;}
			if(!isFinite(minx)){minx=0;}
			if(!isFinite(miny)){miny=0;}

			//normalize the pints by the given max/min values in relation to the bounding box of the treemap
			for(i = 0; i<elements.length; i++){
				var tx;
				if((maxx-minx)===0){
					tx = 0;
				}else{
					tx = (((elements[i].getX() - minx)/(maxx - minx))*(attr.visualSpace.attr().width)) + attr.visualSpace.attr().x;
				}

				var ty;
				if((maxy-miny)===0){
					ty = 0;
				}else{
					ty = (((elements[i].getY() - miny)/(maxy - miny))*(attr.visualSpace.attr().height)) + attr.visualSpace.attr().y;
				}

				elements[i].setX(tx);
				elements[i].setY(ty);
			}
		}

		return elements;
	};

	/**
	* custom javascript sorter on X value
	* @param {nmap_element} a
	* @param {nmap_element} b
	* @return {integer} result - normal sorting return
	*/
	nmapper.sortByX = function(a, b){
		if (a.getX() < b.getX()) {
			return -1;
		}else if (a.getX() > b.getX()) {
			return 1;
		}else {
			return 0;
		}
	};

	/**
	* custom javascript sorter on Y value
	* @param {nmap_element} a
	* @param {nmap_element} b
	* @return {integer} result - normal sorting return
	*/
	nmapper.sortByY = function(a, b){
		if (a.getY() < b.getY()) {
			return -1;
		}else if (a.getY() > b.getY()) {
			return 1;
		}else {
			return 0;
		}
	};

	/**
	* Alternate cut approach to generating the treemap
	* @param {object} cut_attr
	* @param {array} cut_attr.elements - array of nmap_elements
	* @param {nmap_boundingbox} cut_attr.visualSpace - recursive purpose (see above)
	* @param {boolean} cut_attr.bisection=null - recursive purpose (see above)
	* @return {array} elementsAreas - array of nmap_boundingbox objects
	*/
	nmapper.alternateCut = function(cut_attr){
		var defaults = {
			elements:null,
			visualSpace:attr.visualSpace,
			bisection:null
		};

		cut_attr = nmap_extend(defaults, cut_attr);

		//normaliza input data in the visual Space area
		cut_attr.elements = nmapper.normalize(cut_attr.elements);


		if(cut_attr.bisection === null){
			/*
			* The direction of the first bisection is decided based on the width 
			* (R_w) and height (R_h) of R. If R_w > R_h the bisection is horizontal, 
			* vertical otherwise.
			*/
			var bisection;
			if (cut_attr.visualSpace.attr().width > cut_attr.visualSpace.attr().height) {
				cut_attr.bisection = attr.HORIZONTAL;
			} else {
				cut_attr.bisection = attr.VERTICAL;
			}
		}

		var elementsAreas = [];
		if(cut_attr.elements.length === 1){
			var bb = new nmap_boundingbox({
				x : cut_attr.visualSpace.attr().x,
				y : cut_attr.visualSpace.attr().y,
				width : cut_attr.visualSpace.attr().width,
				height : cut_attr.visualSpace.attr().height,
				element : cut_attr.elements[0]
			});
			elementsAreas.push(bb);
		}else{

			if(cut_attr.bisection === attr.HORIZONTAL){
				cut_attr.elements.sort(nmapper.sortByX);
			}else{
				cut_attr.elements.sort(nmapper.sortByY);
			}

			var cutElement = Math.floor(cut_attr.elements.length / 2);

			var Da = cut_attr.elements.slice(0, cutElement);
			var Db = cut_attr.elements.slice(cutElement, cut_attr.elements.length);

			var pA = 0.0;
			for(var i = 0; i<Da.length; i++){
				pA += Da[i].getWeight();
			}

			var pB = 0.0;
			for(i = 0; i<Db.length; i++){
				pB += Db[i].getWeight();
			}

			var Ra = null;
			var Rb = null;

			var srcPts, dstPts;

			if(cut_attr.bisection === attr.HORIZONTAL){
				var wRa = (pA / (pA + pB)) * cut_attr.visualSpace.attr().width;
				var wRb = (pB / (pA + pB)) * cut_attr.visualSpace.attr().width;

				var bh = (Da[Da.length - 1].getX() + Db[0].getX()) / 2;

				Ra = new nmap_boundingbox({
					x : cut_attr.visualSpace.attr().x,
					y : cut_attr.visualSpace.attr().y,
					width : bh-cut_attr.visualSpace.attr().x,
					height : cut_attr.visualSpace.attr().height
				});

				Rb = new nmap_boundingbox({
					x : cut_attr.visualSpace.attr().x + Ra.attr().width,
					y : cut_attr.visualSpace.attr().y,
					width : cut_attr.visualSpace.attr().width - Ra.attr().width,
					height : cut_attr.visualSpace.attr().height
				});

				var HRa = new goog.graphics.AffineTransform(wRa/Ra.attr().width, 0, 0, 1, cut_attr.visualSpace.attr().x *(1-(wRa/Ra.attr().width)), 0);
				for(i = 0; i<Da.length; i++){
					srcPts = [Da[i].getX(), Da[i].getY()];
					dstPts = [];
					HRa.transform(srcPts, 0, dstPts, 0, 1);
					Da[i].setX(dstPts[0]);
					Da[i].setY(dstPts[1]);
				}

				srcPts = [
					Ra.attr().x, Ra.attr().y,
					Ra.attr().x, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y
				];
				dstPts = [];
				HRa.transform(srcPts, 0, dstPts, 0, 4);
				Ra.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

				var HRb = new goog.graphics.AffineTransform(wRb/Rb.attr().width, 0, 0, 1, (cut_attr.visualSpace.attr().x + cut_attr.visualSpace.attr().width)*(1-(wRb/Rb.attr().width)), 0);
				for(i = 0; i<Db.length; i++){
					srcPts = [Db[i].getX(), Db[i].getY()];
					dstPts = [];
					HRb.transform(srcPts, 0, dstPts, 0, 1);
				}

				srcPts = [
					Rb.attr().x, Rb.attr().y,
					Rb.attr().x, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y
				];
				dstPts = [];
				HRb.transform(srcPts, 0, dstPts, 0, 4);
				Rb.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

			}else if(cut_attr.bisection === attr.VERTICAL){

				var hRa = (pA / (pA + pB)) * cut_attr.visualSpace.attr().height;
				var hRb = (pB / (pA + pB)) * cut_attr.visualSpace.attr().height;

				var bv = (Da[Da.length - 1].getY() + Db[0].getY()) / 2;
				var RaHeight = bv - cut_attr.visualSpace.attr().y;
				if(RaHeight===0){RaHeight = 1;}

				Ra = new nmap_boundingbox({
					x : cut_attr.visualSpace.attr().x,
					y : cut_attr.visualSpace.attr().y,
					width: cut_attr.visualSpace.attr().width,
					height:RaHeight
				});

				Rb = new nmap_boundingbox({
					x : cut_attr.visualSpace.attr().x,
					y : cut_attr.visualSpace.attr().y + Ra.attr().height,
					width: cut_attr.visualSpace.attr().width,
					height: cut_attr.visualSpace.attr().height - Ra.attr().height
				});

				var VRa = new goog.graphics.AffineTransform(1, 0, 0, hRa/Ra.attr().height, 0, cut_attr.visualSpace.attr().y *(1-(hRa/Ra.attr().height)));
				for(i = 0; i<Da.length; i++){
					srcPts = [Da[i].getX(), Da[i].getY()];
					dstPts = [];
					VRa.transform(srcPts, 0, dstPts, 0, 1);
					Da[i].setX(dstPts[0]);
					Da[i].setY(dstPts[1]);
				}

				srcPts = [
					Ra.attr().x, Ra.attr().y,
					Ra.attr().x, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y
				];
				dstPts = [];
				VRa.transform(srcPts, 0, dstPts, 0, 4);
				Ra.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

				var VRb = new goog.graphics.AffineTransform(1, 0, 0, hRb/Rb.attr().height, 0, (cut_attr.visualSpace.attr().y + cut_attr.visualSpace.attr().height)*(1-(hRb/Rb.attr().height)));
				for(i = 0; i<Db.length; i++){
					srcPts = [Db[i].getX(), Db[i].getY()];
					dstPts = [];
					VRb.transform(srcPts, 0, dstPts, 0, 1);
				}

				srcPts = [
					Rb.attr().x, Rb.attr().y,
					Rb.attr().x, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y
				];
				dstPts = [];
				VRb.transform(srcPts, 0, dstPts, 0, 4);
				Rb.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

			}

			elementsAreas = elementsAreas.concat(nmapper.alternateCut({visualSpace:Ra, elements:Da, bisection:!cut_attr.bisection}));
			elementsAreas = elementsAreas.concat(nmapper.alternateCut({visualSpace:Rb, elements:Db, bisection:!cut_attr.bisection}));

		}

        return elementsAreas;
	};

	/**
	* Equal weight approach to generating the treemap
	* @param {object} weight_attr
	* @param {array} weight_attr.elements - array of nmap_elements
	* @param {nmap_boundingbox} weight_attr.visualSpace - recursive purpose (see above)
	* @param {boolean} weight_attr.bisection=null - recursive purpose (see above)
	* @return {array} elementsAreas - array of nmap_boundingbox objects
	*/
	nmapper.equalWeight = function(weight_attr){
		var defaults = {
			elements:null,
			visualSpace:attr.visualSpace,
			bisection:attr.VERTICAL
		};

		weight_attr = nmap_extend(defaults, weight_attr);

		//normaliza input data in the visual Space area
		weight_attr.elements = nmapper.normalize(weight_attr.elements);

		var elementsAreas = [];
		if(weight_attr.elements.length === 1){
			var bb = new nmap_boundingbox({
				x : weight_attr.visualSpace.attr().x,
				y : weight_attr.visualSpace.attr().y,
				width : weight_attr.visualSpace.attr().width,
				height : weight_attr.visualSpace.attr().height,
				element : weight_attr.elements[0]
			});
			elementsAreas.push(bb);
		}else{
			//get the direction to bisects
			if(weight_attr.visualSpace.attr().width > weight_attr.visualSpace.attr().height){
				weight_attr.bisection = attr.HORIZONTAL;
			}

			if(weight_attr.bisection === attr.HORIZONTAL){
				weight_attr.elements.sort(nmapper.sortByX);
			}else{
				weight_attr.elements.sort(nmapper.sortByY);
			}

			var pA = 0.0, pB = 0.0, pAAux = 0.0, pBAux = 0.0, cutElement = 1;
			for(var i = 0; i<weight_attr.elements.length; i++){
				pBAux += weight_attr.elements[i].getWeight();
			}

			var minDiff = Number.MAX_VALUE;
			for(i = 1; i < weight_attr.elements.length; ++i){	
				pAAux += weight_attr.elements[i - 1].getWeight(); 
				pBAux -= weight_attr.elements[i - 1].getWeight();
				if(Math.abs(pAAux - pBAux) < minDiff){
					minDiff = Math.abs(pAAux - pBAux);
					cutElement = i;
					pA = pAAux; 
					pB = pBAux;
				}
			}

			var Da = weight_attr.elements.slice(0, cutElement);
			var Db = weight_attr.elements.slice(cutElement, weight_attr.elements.length);

			var Ra = null;
			var Rb = null;

			var srcPts = [];
			var dstPts = [];

			if (weight_attr.bisection === attr.HORIZONTAL) {
				var wRa = (pA / (pA + pB)) * weight_attr.visualSpace.attr().width;
				var wRb = (pB / (pA + pB)) * weight_attr.visualSpace.attr().width;

				var bh = (Da[Da.length - 1].getX() + Db[0].getX()) / 2;
				Ra = new nmap_boundingbox({
					x:weight_attr.visualSpace.attr().x,
					y:weight_attr.visualSpace.attr().y,
					width:bh - weight_attr.visualSpace.attr().x,
					height:weight_attr.visualSpace.attr().height
				});

				Rb = new nmap_boundingbox({
					x:weight_attr.visualSpace.attr().x + Ra.attr().width,
					y:weight_attr.visualSpace.attr().y,
					width:weight_attr.visualSpace.attr().width - Ra.attr().width,
					height:weight_attr.visualSpace.attr().height
				});

				var HRa = new goog.graphics.AffineTransform(wRa/Ra.attr().width, 0, 0, 1, weight_attr.visualSpace.attr().x *(1-(wRa/Ra.attr().width)), 0);
				for(i = 0; i<Da.length; i++){
					srcPts = [Da[i].getX(), Da[i].getY()];
					dstPts = [];
					HRa.transform(srcPts, 0, dstPts, 0, 1);
					Da[i].setX(dstPts[0]);
					Da[i].setY(dstPts[1]);
				}

				srcPts = [
					Ra.attr().x, Ra.attr().y,
					Ra.attr().x, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y
				];
				dstPts = [];
				HRa.transform(srcPts, 0, dstPts, 0, 4);
				Ra.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

				var HRb = new goog.graphics.AffineTransform(wRb/Rb.attr().width, 0, 0, 1, (weight_attr.visualSpace.attr().x + weight_attr.visualSpace.attr().width)*(1-(wRb/Rb.attr().width)), 0);
				for(i = 0; i<Db.length; i++){
					srcPts = [Db[i].getX(), Db[i].getY()];
					dstPts = [];
					HRb.transform(srcPts, 0, dstPts, 0, 1);
				}

				srcPts = [
					Rb.attr().x, Rb.attr().y,
					Rb.attr().x, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y
				];
				dstPts = [];
				HRb.transform(srcPts, 0, dstPts, 0, 4);
				Rb.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

			} else if (weight_attr.bisection === attr.VERTICAL) {

				var hRa = (pA / (pA + pB)) * weight_attr.visualSpace.attr().height;
				var hRb = (pB / (pA + pB)) * weight_attr.visualSpace.attr().height;

				var bv = (Da[Da.length - 1].getY() + Db[0].getY()) / 2;
				Ra = new nmap_boundingbox({
					x:weight_attr.visualSpace.attr().x,
					y:weight_attr.visualSpace.attr().y,
					width:weight_attr.visualSpace.attr().width,
					height:bv - weight_attr.visualSpace.attr().y
				});

				Rb = new nmap_boundingbox({
					x:weight_attr.visualSpace.attr().x,
					y:weight_attr.visualSpace.attr().y + Ra.attr().height,
					width:weight_attr.visualSpace.attr().width,
					height:weight_attr.visualSpace.attr().height - Ra.attr().height
				});

				//The following lines are duplicates of the previous algorithm
				var VRa = new goog.graphics.AffineTransform(1, 0, 0, hRa/Ra.attr().height, 0, weight_attr.visualSpace.attr().y *(1-(hRa/Ra.attr().height)));
				for(i = 0; i<Da.length; i++){
					srcPts = [Da[i].getX(), Da[i].getY()];
					dstPts = [];
					VRa.transform(srcPts, 0, dstPts, 0, 1);
					Da[i].setX(dstPts[0]);
					Da[i].setY(dstPts[1]);
				}

				srcPts = [
					Ra.attr().x, Ra.attr().y,
					Ra.attr().x, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y+Ra.attr().height,
					Ra.attr().x+Ra.attr().width, Ra.attr().y
				];
				dstPts = [];
				VRa.transform(srcPts, 0, dstPts, 0, 4);
				Ra.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

				var VRb = new goog.graphics.AffineTransform(1, 0, 0, hRb/Rb.attr().height, 0, (weight_attr.visualSpace.attr().y + weight_attr.visualSpace.attr().height)*(1-(hRb/Rb.attr().height)));
				for(i = 0; i<Db.length; i++){
					srcPts = [Db[i].getX(), Db[i].getY()];
					dstPts = [];
					VRb.transform(srcPts, 0, dstPts, 0, 1);
				}

				srcPts = [
					Rb.attr().x, Rb.attr().y,
					Rb.attr().x, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y+Rb.attr().height,
					Rb.attr().x+Rb.attr().width, Rb.attr().y
				];
				dstPts = [];
				VRb.transform(srcPts, 0, dstPts, 0, 4);
				Rb.setBounds({
					x:dstPts[0],
					y:dstPts[1],
					width:dstPts[4]-dstPts[0],
					height:dstPts[5]-dstPts[1]
				});

			}

			elementsAreas = elementsAreas.concat(nmapper.equalWeight({visualSpace:Ra, elements:Da}));
			elementsAreas = elementsAreas.concat(nmapper.equalWeight({visualSpace:Rb, elements:Db}));
		}

		return elementsAreas;
	};

	return nmapper;
};