
//see example here: https://www.d3-graph-gallery.com/graph/histogram_basic.html
function binData(type = null){
	// set the parameters for the histogram
	var histogram = d3.histogram()
		.value(function(d){
			if (type == null){
				return d['coord1D_horizontal axis'];
			} else {
				if (d['institution_type2'] == type){
					return d['coord1D_horizontal axis'];
				}
			} 
		})   // I need to give the vector of value
		.domain(params.xAxis.domain())  // then the domain of the graphic
		.thresholds(params.xAxis.ticks(params.nBins)); // then the numbers of bins

	// And apply this function to data to get the bins
	return histogram(params.inputData);
}

function createHistogram(){

	//create the SVG element
	params.svg = d3.select('#histogram')
		.append('svg')
			.attr('width', params.histWidth + params.histMargin.left + params.histMargin.right)
			.attr('height', params.histHeight + params.histMargin.top + params.histMargin.bottom)
			.append('g')
				.attr('transform', 'translate(' + params.histMargin.left + ',' + params.histMargin.top + ')');

	//rect to capture clicks to reset the coloring
	params.svg.append('rect')
		.attr('id','clickCatcher')
		.attr('transform', 'translate(' + -params.histMargin.left + ',' + -params.histMargin.top + ')')
		.attr('width','100%')
		.attr('height','100%')
		.attr('fill',params.backgroundColor)
		.on('click',function(){
			params.svg.selectAll('.bar').transition().duration(params.duration).style('fill', params.fillColor);
			showNames();
		})

	// X axis: scale and draw:
	params.xAxis = d3.scaleLinear()
		.domain([params.minX, params.maxX])     
		.range([0, params.histWidth]);
	params.svg.append('g')
		.attr('transform', 'translate(0,' + params.histHeight + ')')
		.call(d3.axisBottom(params.xAxis));


	params.histAll = binData();
	params.histPension = binData('Pension Funds');
	params.histMutual = binData('Mutual Funds');
	  
	// Y axis: scale and draw:
	params.yAxis = d3.scaleLinear()
		.range([params.histHeight, 0]);
	params.yAxis.domain([0, d3.max(params.histAll, function(d) { return d.length; })]);   
	// params.svg.append('g')
	// 	.call(d3.axisLeft(params.yAxis));

		// text label for the x axis
	params.svg.append('text')             
		.attr('transform', 'translate(' + (params.histWidth/2) + ' ,' + (params.histHeight + params.histMargin.top + 20) + ')')
		.style('text-anchor', 'middle')
		.text('X axis label')

	// append the bar rectangles to the svg element
	var fillColor = getComputedStyle(document.documentElement).getPropertyValue('--plot-background-color');
	params.svg.selectAll('.bar')
		.data(params.histAll).enter()
		.append('rect')
			.attr('class','bar')
			.attr('x', 1)
			.attr('transform', function(d) { return 'translate(' + params.xAxis(d.x0) + ',' + params.yAxis(d.length) + ')'; })
			.attr('width', function(d) { return Math.max(params.xAxis(d.x1) - params.xAxis(d.x0) -3 ,0) ; }) //-val to give some separation between bins
			.attr('height', function(d) { return params.histHeight - params.yAxis(d.length); })
			.attr('stroke-width',1)
			.attr('stroke', 'black')
			.style('fill', params.fillColor)
			.style('cursor','pointer')
			//.on('mouseover', function() { d3.select(this).style('fill', params.hoverColor);})
			//.on('mouseout', function() { d3.select(this).style('fill', params.fillColor);})
			.on('click',function(d){
				var names = [];
				d3.selectAll('.bar').transition().duration(params.duration).style('fill', params.hoverColor);
				d3.select(this).transition().duration(params.duration).style('fill', params.fillColor)
				d.forEach(function(dd){names.push(dd['institutionname'])})
				showNames(names);
			})

}


function changeHistogram(arg){
	console.log(arg)
	showNames();
	params.svg.selectAll('.bar').data(params[arg]);

	//reset the y axis?
	params.yAxis.domain([0, d3.max(params[arg], function(d) { return d.length; })]);   

	params.svg.selectAll('.bar').transition().duration(params.duration)
		.attr('transform', function(d, i) { return 'translate(' + params.xAxis(d.x0) + ',' + params.yAxis(d.length) + ')'; })
		.attr('height', function(d,i) { return params.histHeight - params.yAxis(d.length); })
		.style('fill', params.fillColor)

}

function checkSearchInput(event = null){
	var value = document.getElementById('searchInput').value;
	if (event != null) {
		value += event.key;
	}
	console.log('searching', value)

}

function showNames(names = null){
	d3.select('#searchList').selectAll('.listNames').remove();

	if (names){
		d3.select('#searchList').selectAll('.listNames')
			.data(names).enter()
			.append('div')
				.attr('class','listNames')
				.text(function(d){return d})
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
	var container = d3.select('body').append('div')
		.attr('id','container')
		.style('border','1px solid black')
		.style('width', params.width + 'px')
		.style('height', params.height + 'px')

	//for the plot	
	var plots = container.append('div')
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
	var search = container.append('div')
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
		.on('keypress',function(){
			checkSearchInput(d3.event);
		})

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
d3.csv('src/data/positions.csv')
	.then(function(data) {
		init(data)
  })
  .catch(function(error){
		console.log('ERROR:', error)	
  })