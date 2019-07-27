function checkSearchInput(event = null){
	var value = document.getElementById('searchInput').value;
	if (event != null) {
		value += event.key;
	}
	console.log('searching', value)

}

//show a list of names in the div below the search box
function showNames(funds = null){
	d3.select('#searchList').selectAll('.listNames').remove();

	if (funds){
		d3.select('#searchList').selectAll('.listNames')
			.data(funds).enter()
			.append('div')
				.attr('class','listNames')
				.classed('listNamesHover', true)
				.attr('id',function(d) {return 'listNames' + d['institutionname'].replace(/[^a-zA-Z0-9]/g, "");})
				.on('click', function(d) {showNameInfo(d);})
				.text(function(d){return d['institutionname'];})
	}
}

//get the position of a dom element on the page
//https://www.kirupa.com/html5/get_element_position_using_javascript.htm
function getPosition(el) {
	var xPos = 0;
	var yPos = 0;

	while (el) {
		if (el.tagName == "body") {
			// deal with browser quirks with body/window/document and page scroll
			var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
			var yScroll = el.scrollTop || document.documentElement.scrollTop;
 
			xPos += (el.offsetLeft - xScroll + el.clientLeft);
			yPos += (el.offsetTop - yScroll + el.clientTop);
		} else {
			// for all other non-BODY elements
			xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
			yPos += (el.offsetTop - el.scrollTop + el.clientTop);
		}

		el = el.offsetParent;
	}
	return {
		x: xPos,
		y: yPos
	};
}
//show the type of fund for a given name (could add more info if desired)
function showNameInfo(fund){
	var id = fund['institutionname'].replace(/[^a-zA-Z0-9]/g, "")
	var elm = d3.select('#listNames' + id);
	var pos = getPosition(elm.node());
	var bodyMargin = parseFloat(d3.select('body').style('margin-top'));

	//clear the funds
	showNames(); 

	//add back this fund to the 
	d3.select('#searchList').append('div')
		.attr('id','listNames' + id)
		.attr('class','listNames')
		.classed('listNamesHover', false)
		.style('border-top', '1px solid black')
		.style('margin-top', pos.y - params.buttonHeight - bodyMargin - 3  + 'px') //2 for the borders
		.text(fund['institutionname'])

	//move it to the top of the div
	d3.select('#listNames' + id).transition().duration(params.duration)
		.style('margin-top',0 + 'px')
		.style('border-top',0 + 'px')
		.style('border-bottom', 0 + 'px')
		.on('end', function(){
			var tp = fund['institution_type2'];
			if (tp[tp.length - 1] == 's') tp = tp.substring(0, tp.length - 1);
			d3.select(this).append('div')
				.attr('class','fundInfo')
				.text(tp)
		})
}