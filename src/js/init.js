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

function createContainers(){
	function createButton(parent, id, width, text, callback, arg){
		var button = parent.append('div')
			.attr('id', id)
			.attr('class','button')
			.classed('buttonHover', true)
			.style('width', width + 'px')
			.style('height', params.buttonHeight + 'px')
			.style('font-size',params.buttonHeight*0.6 + 'px')
			.style('line-height',params.buttonHeight + 'px')
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
	params.container = d3.select('body').append('div')
		.attr('id','visContainer')
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
	allButton
		.classed('buttonClicked', true)
		.classed('buttonHover', false)
		.style('border-right', '1px solid black')
	var pensionButton = createButton(plots, 'pensionButton', params.plotWidth/3 -1, 'Pension', changeHistogram, 'histPension')
	pensionButton
		.style('border-right', '1px solid black')
	var mutualButton = createButton(plots, 'mutualButton', params.plotWidth/3, 'Mutual', changeHistogram, 'histMutual')

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
		.style('font-size',params.buttonHeight*0.6 + 'px')
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
		.attr('class', 'fa fa-search')
		.style('font-size',params.buttonHeight*0.6 + 'px')
		.style('line-height',params.buttonHeight + 'px')

	search.append('div')
		.attr('id','searchList')
		.style('overflow-y','auto')
		.style('float','left')
		.style('height',params.height - params.buttonHeight - 1 + 'px') 
		.style('width',params.searchWidth -1 + 'px' )

}

//runs directly after the data is read in, and initializes everything
function init(data){
	//create the params object
	defineParams(); 
	params.inputData = data;

	//create the containers
	createContainers();

	//bin the data
	createHistogram();

}

//runs on load
d3.csv('src/data/positionsSorted.csv')
	.then(function(data) {
		init(data)
  })
  .catch(function(error){
		console.log('ERROR:', error)	
  })