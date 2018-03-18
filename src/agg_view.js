function aggregationView(ID, ChartType, DataType) {

    console.log(selections[ID])

    svg = d3.select('#agg_svg' + ID);

    var data = selections.airport;


    if (DataType) {

    }

    var data_to_show = buildData(data, 'code', 'num_in_airline');

    // Create Default display
    bubbleChart(data_to_show, ID)

}

function buildData(data, keyName, valueName) {
    var output = [];
    data.forEach(function (ap) {
        var temp = {
            keyName: ap[keyName],
            value: ap[valueName]
        };
        output.append(temp)
    });
    return output
}

function bubbleChart(data_to_show, ID) {

    svg.selectAll('*').remove();

    var selection = selections[ID];

    var width = svg.getAttribute('width'),
        height = svg.getAttribute('height');

    var val_min = Number.MAX_VALUE,
        val_max = Number.MIN_VALUE;

    data_to_show.forEach(function (d) {
        val_min = Math.min(val_min, d.value);
        val_max = Math.max(val_max, d.value);
    });



    var radius_scale = d3.scaleLinear()
        .domain([val_min, val_max])
        .range([20, 60]);

    var color_scale = d3.scaleLinear()
        .domain([val_min, val_max])
        .range([selection.color.brighter(), selection.color.darker()]);

    var forceStrength = 0.3;

    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(300))
        .force('y', d3.forceY().strength(forceStrength).y(height / 2))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);

    function charge(d) {
        return -Math.pow(radius_scale(d.value), 2.0) * forceStrength;
    }

    function ticked() {
        circle
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
        text
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; });
    }




    var nodes = svg.selectAll('g')
        .data(data_to_show)
        .classed('nodes', true)
        .enter().append('g')

    var circle = nodes.selectAll('circle')
        .enter().append()
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('radius', function (d) {
            return radius_scale(d.value)
        })
        .attr('fill', function (d) {
            return color_scale(d.value)
        })

    var text = nodes.selectAll('text')
        .enter().append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .text(function (d) {
            return d.keyName
        });

    simulation.nodes(data_to_show)





}

function barChart() {

}
