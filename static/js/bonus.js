
// set svg dimensional params
var svgWidth = 760;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background-color", "#bdc3c7")
    .style("opacity", 0.8);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .classed('iframeContainer', true);

// Initial Params
var chosenXAxis = "age";

var chosenYAxis = "serum_creatinine";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    if (chosenXAxis === 'age') {
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
    }
    else {
        var xLinearScale = d3.scaleLinear()
            .domain([-1, 2])
            .range([0, width]);
    }

    return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(xScale, xAxis) {
    var bottomAxis = d3.axisBottom(xScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating yAxis var upon click on axis label
function renderYAxes(yScale, yAxis) {
    var leftAxis = d3.axisLeft(yScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// function used for updating circles group with a transition to
// new circles text group omitted
function renderXCircles(circlesGroup, xScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => xScale(d[chosenXAxis]));

    // textGroup.transition()
    //     .duration(1000)
    //     .attr("x", d => xScale(d[chosenXAxis]));


    return circlesGroup;
};

// function used for updating circles group with a transition to
// new circles textgroup omitted
function renderYCircles(circlesGroup, yScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => yScale(d[chosenYAxis]));

    // textGroup.transition()
    //     .duration(1000)
    //     .attr("y", d => yScale(d[chosenYAxis]));

    return circlesGroup;
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelx;
    var labely;

    if (chosenXAxis === "age") {
        labelx = "Age: ";
    }
    else {
        labelx = "Gender: "
    }

    if (chosenYAxis === "serum_creatinine") {
        labely = "Serum Creatinine: ";
    }
    else {
        labely = 'Ejection Fraction: '
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-5, 10])
        .html(function (d) {
            if (d['DEATH_EVENT'] === 1) {
                deathLabel = "Heart Failure"
            }
            else {
                deathLabel = "No Heart Failure"
            }
            return (`${deathLabel}<br>${labelx} ${d[chosenXAxis]} <br> ${labely} ${d[chosenYAxis]} `);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", toolTip.show)
        // onmouseout event
        .on("mouseout", toolTip.hide);

    return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
//d3.json(/api/v1.0/Heart_Failure_Records)
d3.csv("../static/Data/heart.csv").then(function (data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function (data) {
        data['age'] = +data['age'];
        data['sex'] = +data['sex'];
        data['serum_creatinine'] = +data['serum_creatinine'];
        data['ejection_fraction'] = +data['ejection_fraction'];
        data['DEATH_EVENT'] = +data['DEATH_EVENT'];
    });



    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Add Color
    var color = d3.scaleOrdinal(data.map(d => d.DEATH_EVENT), d3.schemeCategory10)

    // append initial circles
    var circlesGroup = chartGroup.append('g')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", d => color(d.DEATH_EVENT))
        .attr("opacity", ".75")
        .style("stroke", "#7F7F7F")
        .style("stroke-width", 1);

    //Add state abbr labels    
    // var textGroup = chartGroup.append('g')
    //     .selectAll("panda")
    //     .data(data)
    //     .enter()
    //     .append("text")
    //     .text(d => d['abbr'])
    //     .attr("x", (d) => xLinearScale(d[chosenXAxis]))
    //     .attr("y", (d) => yLinearScale(d[chosenYAxis]))
    //     .attr('font-size', '10px')
    //     .style('font', 'bold Verdana, Helvetica, Arial, sans-serif')
    //     .attr('text-anchor', 'middle')
    //     .style("opacity", 1)
    //     .style('fill', 'black');

    // Create group for two x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .classed("aText", true)
        .text("Age (Years)");

    var sexLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 45)
        .attr("value", "sex") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Gender (M=0/F=1)");

    // Create group for two y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var creatineLabel = ylabelsGroup.append("text")
        .attr("y", 55 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "serum_creatinine") // value to grab for event listener
        .classed("active", true)
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Serum Creatinine (mg/dL)");

    var ejectLabel = ylabelsGroup.append("text")
        .attr("y", 45 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "ejection_fraction") // value to grab for event listener
        .classed("inactive", true)
        .classed("aText", true)
        .text("Ejection Fraction (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = xValue;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis); //textgroup omitted

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    sexLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    sexLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = yValue;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(data, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis); //textgroup omitted

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "serum_creatinine") {
                    creatineLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ejectLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    creatineLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ejectLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});