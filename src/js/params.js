//all "global" variables are contained within params object
  
var params;
function defineParams(){
	params = new function() {

		//holds the data object
		this.inputData = null;

		//this is the histogram DOM elements
		this.svg = null;

		//duration for transitions
		this.duration = 500;

		//for binning the data
		this.nBins = 20;
		this.minX = -1.;
		this.maxX = 1.;
		this.foregroundColor = getComputedStyle(document.documentElement).getPropertyValue('--foreground-color'); 
		this.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color'); 
		this.fillColor = getComputedStyle(document.documentElement).getPropertyValue('--highlight-color'); 
		this.hoverColor = getComputedStyle(document.documentElement).getPropertyValue('--hover-color'); 

		//store the binned data
		this.histAll = null;
		this.histPension = null;
		this.histMutual = null;

		//store the histogram axis converters
		this.xAxis = null;
		this.yAxis = null;

		//dimensions of the containers
		this.plotWidth = 460;
		this.searchWidth = 300;
		this.width = this.plotWidth + this.searchWidth
		this.height = 500;
		this.buttonHeight = 60
		this.histMargin = {'top': 10, 'right': 15, 'bottom': 40, 'left': 15};
		this.histWidth = this.plotWidth - this.histMargin.left - this.histMargin.right;
		this.histHeight = this.height - this.buttonHeight - this.histMargin.top - this.histMargin.bottom;
	};


}
