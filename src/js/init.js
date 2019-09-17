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

function getContainerSize(){
	params.needsResize = false;

	//get the parent size
	var parent = d3.select('#visContainer').node().parentNode;
	var parentWidth = parent.getBoundingClientRect().width;
	var parentHeight = parent.getBoundingClientRect().height;

	//calculate the new widths
	//params.width = params.width0;
	if (params.width0 >= parentWidth - 20){//allow for some margin?
		params.needsResize = true;
		params.width = parentWidth - 20;
		params.plotWidth = params.width*params.plotWidthRatio;
		params.searchWidth = params.width - params.plotWidth; 
		params.histWidth = params.plotWidth - params.histMargin.left - params.histMargin.right;
	}


	//calculate new heights
	//params.height = params.height0;
	if (params.height0 > parentHeight - 20){ //allow for some margin?
		params.needsResize = true;
		params.height = parentHeight - 20;
		params.histHeight = params.height - params.buttonHeight - params.histMargin.top - params.histMargin.bottom;
	} 
	//console.log('parent', parent, parentWidth, parentHeight, params.needsResize, params.histHeight)
}
function resizeContainers(){

	getContainerSize();
	if (params.needsResize){
		//remove the container
		d3.select('#visContainer').selectAll('div').remove();
		d3.select('#visContainer').selectAll('svg').remove();

		//create the containers
		createContainers();

	}
	
}
function fontLoop(elem, fs, dfs, w){
	//shrink the text until it fits
	var sW = elem.node().scrollWidth;
	var wRound = Math.ceil(w);
	while (sW > wRound && fs > 0){
		fs -= dfs;
		elem.style('font-size', fs);
		sW = elem.node().scrollWidth;
	}

	return fs;
}
function resizeButtonFont(){
	var elems = document.getElementsByClassName("button");
	var minFs = params.buttonFontSize;
	//first iterate through to get the minimum font size
	for(var i = 0; i < elems.length; i++) {
		var elem = d3.select(elems.item(i));
		var fs = params.buttonFontSize;
		var dfs = 0.1; //amount to shrink text at each iteration
		var w = elem.node().getBoundingClientRect().width;
		fs = fontLoop(elem, fs, dfs, w);
		if (fs > 0.1) minFs = Math.min(minFs, fs);
		if (i == elems.length - 1){
			//now resize all to that minimum value
			for(var j = 0; j < elems.length; j++) {
				var elem = d3.select(elems.item(j));
				elem.style('font-size', 0.9*minFs);
			};	
			//also resize the search box to match
			d3.select('#searchInput').style('font-size', 0.9*minFs);
			d3.select('#searchIcon').style('font-size', 0.9*minFs);
		}
	}

}

function createContainers(){

	function createButton(parent, id, width, text, callback, arg){
		var button = parent.append('div')
			.attr('id', id)
			.attr('class','button')
			.classed('buttonHover', true)
			.style('width', width + 'px')
			.style('height', params.buttonHeight + 'px')
			.style('line-height',params.buttonHeight + 'px')
			.style('font-size',params.buttonFontSize + 'px')
			.text(text)
			.on('click', function(){
				d3.selectAll('.button')
					.classed('buttonHover', true)
					.classed('buttonClicked', false);				
				d3.select('#'+id)
					.classed('buttonHover', false)
					.classed('buttonClicked', true);
				callback(arg);
			})

		return button
	}

	//main container
	params.container = d3.select('#visContainer')
		.style('border','1px solid black')
		.style('width', params.width + 'px')
		.style('height', params.height + 'px')

	//for the plot	
	var plots = params.container.append('div')
		.attr('id','plotContainer')
		.style('width', params.plotWidth + 'px')
		.style('height', params.height + 'px')	
		.style('border-right','1px solid black')
		.style('float','left')

	//buttons
	var allButton = createButton(plots, 'allButton',params.plotWidth/3 -1, 'All', changeHistogram, 'histAll')
	allButton.style('border-right', '1px solid black')
	var pensionButton = createButton(plots, 'pensionButton', params.plotWidth/3 -1, 'Pension', changeHistogram, 'histPension')
	pensionButton.style('border-right', '1px solid black')
	var mutualButton = createButton(plots, 'mutualButton', params.plotWidth/3, 'Mutual', changeHistogram, 'histMutual')

	//check which one should be highlighted
	var modButton = allButton;
	if (params.isPension) modButton = pensionButton
	if (params.isMutual) modButton = mutualButton
	modButton
		.classed('buttonClicked', true)
		.classed('buttonHover', false)

	//histogram
	plots.append('div')
		.attr('id', 'histogram')

	//search box
	var search = params.container.append('div')
		.attr('id','searchContainer')
		.style('width',params.searchWidth -1 + 'px' )
		.style('height',params.height + 'px') 
		.style('float','left')

	var searchInput = search.append('input')
		.attr('id','searchInput')
		.attr('type','text')
		.attr('placeholder','Search')
		.attr('autocomplete','off')
		.style('float', 'left')
		.style('width',params.searchWidth - params.buttonHeight - 1 + 'px' )
		.style('height',params.buttonHeight + 1 + 'px') //not sure why I need the +1 here?
		.style('font-size',params.buttonFontSize + 'px')
		.style('line-height',params.buttonHeight + 'px')
		.style('border-bottom', '1px solid black')
		.style('border-right', '1px solid black')
		.on('click',function(){
			d3.select(this)
				.attr('value',null)
		})
		.on('keydown',function(){
			if (params.searchTimeout) clearTimeout(params.searchTimeout);
			params.searchTimeout = setTimeout(checkSearchInput, 50);
		})
	//clear the input on any mouse click?
	params.container.on('click', function(){clearSearch(event)});


	var searchButton = 	search.append('div')
		.attr('id', 'searchButton')
		.attr('class','button')
		.classed('buttonHover', true)
		.style('width', params.buttonHeight-1 + 'px')
		.style('height', params.buttonHeight + 'px')
		.on('click', function(){
			checkSearchInput();
		})
		.on('mousedown', function(){
			d3.select(this)
				.classed('buttonHover', false)
				.classed('buttonClicked', true);
		})
		.on('mouseup', function(){
			d3.select(this)
				.classed('buttonHover', true)
				.classed('buttonClicked', false);
		})

	searchButton.append('i')
		.attr('id','searchIcon')
		.attr('class', 'fa fa-search')
		.style('font-size',params.buttonFontSize + 'px')
		.style('line-height',params.buttonHeight + 'px')

	search.append('div')
		.attr('id','searchList')
		.style('overflow-y','auto')
		.style('float','left')
		.style('height',params.height - params.buttonHeight - 1 + 'px') 
		.style('width',params.searchWidth -1 + 'px' )

	resizeButtonFont();

	//bin the data and make this histogram
	createHistogram();
}

//runs directly after the data is read in, and initializes everything
function init(data){
	//create the params object
	defineParams(); 
	params.inputData = data;
	params.isMobile = isMobile;

	//create the containers
	getContainerSize();
	createContainers();


}

//runs on load
//d3.csv('src/data/positionsSorted.csv')
d3.csv('src/data/dummyDataCraft.csv')
	.then(function(data) {
		init(data)
  })
  .catch(function(error){
		console.log('ERROR:', error)	
  })

var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}
window.addEventListener("resize", function(){
	//if (isMobile) resizeContainers();
	resizeContainers();
});