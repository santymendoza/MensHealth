class groupedBarChartViz {
    constructor(parentElement, wordData) {
        this.parentElement = parentElement;
        this.wordData = wordData;

        // parse date method
        this.parseDate = d3.timeParse("%Y-%m-%d");
        this.parseYear = d3.timeParse("%Y");

        this.initVis();
    }
    initVis(){
        let vis = this;
        vis.cleanData();
        vis.data = vis.wordData;

        vis.margin = {top: 40, right: 40, bottom: 60, left: 40};

		vis.width = 1000 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain(d3.extent(vis.cleanedData, d=>{
                return vis.parseDate(d.date.substring(0,10))
        }));

        vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, 5])


        vis.xAxis = d3.axisBottom()
        .scale(vis.x);

        vis.yAxis = d3.axisLeft()
        .scale(vis.y);

        vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
        .attr("class", "y-axis axis");
        
        console.log(vis.cleanedData)
        
        vis.wrangleData();

    }

    wrangleData(){
        let vis = this;
        
        vis.displayData = vis.stackedData;

		// Update the visualization
		vis.updateVis();
    }
    
    cleanData(){
        let vis = this;
        vis.occurances = {}
        vis.cleanedData = [];
        for(let x = 0; x < vis.wordData.length; x++){
            // TODO: Add other intervals like minutes, seconds
            let currentYear = vis.parseDate(vis.wordData[x]["date"].substring(0,10)).getYear();
            let info = {days : 0, weeks : 0, months : 0, date: vis.wordData[x]["date"]}
            // Check if date already exists
            if (!(currentYear in vis.occurances)){
                // If it doesnt set all potential word values to 0
                vis.occurances[currentYear] = info;
            }

            if (vis.wordData[x]["word"] == "minute" || vis.wordData[x]["word"] == "minutes" || vis.wordData[x]["word"] == "second" || vis.wordData[x]["word"] == "seconds" || vis.wordData[x]["word"] == "hour" || vis.wordData[x]["word"] == "hours"){
                vis.occurances[currentYear]["days"]++;
            }
            else if(vis.wordData[x]["word"] == "week" || vis.wordData[x]["word"] == "weeks" || vis.wordData[x]["word"] == "day" || vis.wordData[x]["word"] == "days"){
                vis.occurances[currentYear]["weeks"]++;
            }
            else if(vis.wordData[x]["word"] == "month" || vis.wordData[x]["word"] == "months" || vis.wordData[x]["word"] == "year" || vis.wordData[x]["word"] == "years"){
                vis.occurances[currentYear]["months"]++;
            }
        }
        vis.cleanedData = Object.values(vis.occurances);
    }

    updateVis(){
        let vis = this;
        vis.cleanData();

		// Draw the layers
		let rect = vis.svg.selectAll("rect")
            .data(vis.cleanedData);

        rect.enter().append("rect")
            .attr("fill", "orange")
            // Enter update
            .merge(rect)
            .attr("x", d => vis.x(vis.parseDate(d.date.substring(0,10))))
            .attr("y", d => vis.y(d.days))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.days));

        rect.enter().append("rect")
            .attr("fill", "blue")
            // Enter update
            .merge(rect)
            .attr("x", d => vis.x(vis.parseDate(d.date.substring(0,10))) + 10)
            .attr("y", d => vis.y(d.weeks))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.weeks));

        rect.enter().append("rect")
            .attr("fill", "green")
            // Enter update
            .merge(rect)
            .attr("x", d => vis.x(vis.parseDate(d.date.substring(0,10))) + 20)
            .attr("y", d => vis.y(d.months))
            .attr("width", 10)
            .attr("height", d => vis.height - vis.y(d.months));

        rect.exit().remove();

		// Call axis functions with the new domain
		vis.svg.select(".x-axis").call(vis.xAxis);
		vis.svg.select(".y-axis").call(vis.yAxis);
    }
}