
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


	//bin the data for the three different categories
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
				showNames(d);
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
