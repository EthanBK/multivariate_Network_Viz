function aggregationView(ID, ChartType, DataType) {

    // console.log('selections[ID]', selections[ID])


    var svg_bg = document.getElementById('agg_svg'+ID);

    var data = selections[ID].airport;
    // console.log('data', data)

    var data_to_show = [];

    switch(DataType) {
        case 0:
            data_to_show = buildData(data, 'code', 'num_in_airline');
            break;
        case 1:
            data_to_show = buildData(data, 'code', 'num_out_airline');
            break;
        case 2:

            break;
        case 3:

            break;

        default:
            data_to_show = buildData(data, 'code', 'num_in_airline');
    }

    switch(ChartType) {
        case 0:
            bubbleChart(svg_bg, data_to_show, ID);
            break;
        case 1:
            barChart(svg_bg, data_to_show, ID);
            break;

        default:
            bubbleChart(svg_bg, data_to_show, ID);
    }

}

function buildData(data, keyName, valueName) {
    var output = [];
    data.forEach(function (ap) {
        var temp = {
            keyName: ap[keyName],
            value: ap[valueName]
        };
        output.push(temp)
    });
    return output
}

function bubbleChart(svg_bg, data_to_show, ID) {

    d3.select(svg_bg).selectAll('*').remove();

    // if (d3.select(svg_bg).selectAll('*') !== null) return;

    var selection = selections[ID];

    var width = svg_bg.getAttribute('width'),
        height = svg_bg.getAttribute('height');

    var val_min = Number.MAX_VALUE,
        val_max = Number.MIN_VALUE;

    data_to_show.forEach(function (d) {
        val_min = Math.min(val_min, d.value);
        val_max = Math.max(val_max, d.value);
    });


    var radius_scale = d3.scaleLinear()
        .domain([d3.min(data_to_show, function (d) {
            return d.value
        }), d3.max(data_to_show, function (d) {
            return d.value
        })])
        .range([6, 18]);

    var color_scale = d3.scaleLinear()
        .domain([val_min, val_max])
        .range([d3.rgb(selection.color).darker(2), d3.rgb(selection.color).brighter(3)]);

    var forceStrength = 0.3;

    var simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(width / 2))
        .force('y', d3.forceY().strength(forceStrength).y(height / 2))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);

    function charge(d) {
        return -Math.pow(radius_scale(d.value), 2.0) * forceStrength;
    }

    var svg = d3.select('#agg_svg'+ID)
        .append('svg')
        .classed('inner_svg', true)
        .attr('id', 'inner_svg'+ID);

    var nodes = svg.selectAll('g')
        .data(data_to_show)
        .classed('nodes', true)
        .enter().append('g');

    var circle = nodes.append('circle')
        .classed('bubble_circle'+ID, true)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', function (d) {
            return radius_scale(d.value)
        })
        .attr('fill', function (d) {
            return color_scale(d.value)
        })
        .on('click', function (d) {

            console.log('sdfsf')

        });
    var text = nodes.append('text')
        .classed('bubble_text'+ID, true)
        .attr('x', 0)
        .attr('y', 0)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .attr('font-size', 4)
        .text(function (d) {
            return d.keyName
        });

    simulation.nodes(data_to_show);

    function ticked() {
        circle
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
        text
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; });
    }
}

function barChart(svg_bg, data_to_show, ID) {

    d3.select(svg_bg).selectAll('*').remove();

    // if (d3.select(svg_bg).selectAll('*') !== null) return;

    var selection = selections[ID];

    var width = svg_bg.getAttribute('width'),
        height = svg_bg.getAttribute('height'),
        margin = {top: 20, bottom: 20, left: 20, right: 20 };

    var val_min = Number.MAX_VALUE,
        val_max = Number.MIN_VALUE;

    data_to_show.forEach(function (d) {
        val_min = Math.min(val_min, d.value);
        val_max = Math.max(val_max, d.value);
    });

    var xScale = d3.scaleBand()
        .domain(data_to_show.map(function (d) {
            return d.keyName;
        }))
        .range()

}
