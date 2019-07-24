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
        this.fillColor = getComputedStyle(document.documentElement).getPropertyValue('--highlight-color'); 

        //store the binned data
        this.histAll = null;
        this.histPension = null;
        this.histMutual = null;

        //store the histogram axis converters
        this.xAxis = null;
        this.yAxis = null;
        
        //dimensions of the containers
        this.width = 460;
        this.height = 500;
        this.buttonHeight = 60
		this.histMargin = {'top': 10, 'right': 30, 'bottom': 30, 'left': 40};
    	this.histWidth = this.width - this.histMargin.left - this.histMargin.right;
    	this.histHeight = this.height - this.buttonHeight - this.histMargin.top - this.histMargin.bottom;
    };


}
