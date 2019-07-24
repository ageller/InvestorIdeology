
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
		.append("svg")
			.attr("width", params.histWidth + params.histMargin.left + params.histMargin.right)
			.attr("height", params.histHeight + params.histMargin.top + params.histMargin.bottom)
			.append("g")
				.attr("transform", "translate(" + params.histMargin.left + "," + params.histMargin.top + ")");

	// X axis: scale and draw:
	params.xAxis = d3.scaleLinear()
		.domain([params.minX, params.maxX])     
		.range([0, params.histWidth]);
	params.svg.append("g")
		.attr("transform", "translate(0," + params.histHeight + ")")
		.call(d3.axisBottom(params.xAxis));


	params.histAll = binData();
	params.histPension = binData('Pension Funds');
	params.histMutual = binData('Mutual Funds');
	  
	// Y axis: scale and draw:
	params.yAxis = d3.scaleLinear()
		.range([params.histHeight, 0]);
	params.yAxis.domain([0, d3.max(params.histAll, function(d) { return d.length; })]);   
	// params.svg.append("g")
	// 	.call(d3.axisLeft(params.yAxis));

	// append the bar rectangles to the svg element
	var fillColor = getComputedStyle(document.documentElement).getPropertyValue('--plot-background-color');
	params.svg.selectAll("rect")
		.data(params.histAll)
		.enter()
		.append("rect")
			.attr("x", 1)
			.attr("transform", function(d) { return "translate(" + params.xAxis(d.x0) + "," + params.yAxis(d.length) + ")"; })
			.attr("width", function(d) { return Math.max(params.xAxis(d.x1) - params.xAxis(d.x0) -1 ,0) ; }) //-val to give some separation between bins
			.attr("height", function(d) { return params.histHeight - params.yAxis(d.length); })
			.style("fill", params.fillColor)

}


function changeHistogram(arg){
	console.log(arg)
	params.svg.selectAll('rect').data(params[arg]);

	//reset the y axis?
	params.yAxis.domain([0, d3.max(params[arg], function(d) { return d.length; })]);   

	params.svg.selectAll('rect').transition().duration(params.duration)
		.attr("transform", function(d, i) { return "translate(" + params.xAxis(d.x0) + "," + params.yAxis(d.length) + ")"; })
		.attr("height", function(d,i) { return params.histHeight - params.yAxis(d.length); })
}


function createContainers(){
	function createButton(parent, id, text, callback, arg){
		var button = parent.append('div')
			.attr('id', id)
			.attr('class','button')
			.classed('buttonHover', true)
			.style('width', params.width/3 + 'px')
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
	
	//buttons
	var allButton = createButton(container, 'allButton','All', changeHistogram, 'histAll')
	allButton
		.classed('buttonClicked', true)
		.classed('buttonHover', false)
		.style('width', parseFloat(allButton.style('width')) -1 + 'px') //to make room for border
		.style('border-right', '1px solid black')
	var pensionButton = createButton(container, 'pensionButton', 'Pension', changeHistogram, 'histPension')
	pensionButton
		.style('width', parseFloat(pensionButton.style('width')) -1 + 'px') //to make room for border
		.style('border-right', '1px solid black')
	var mutualButton = createButton(container, 'mutualButton', 'Mutual', changeHistogram, 'histMutual')

	//histogram
	container.append('div')
		.attr('id', 'histogram')
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