function aggregationView(ID, DataType, ChartType) {

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
    // console.log(data)
    var output = [];
    data.forEach(function (ap) {
        var temp = {
            id: +ap.id,
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
    var data = selection.airport;
    var tooltip_agg = floatingTooltip('bubble_tooltip', 240);

    var width = +svg_bg.getAttribute('width'),
        height = +svg_bg.getAttribute('height');

    var radius_max = 18,
        radius_min = 6;

    var val_min = d3.min(data_to_show, function (d) {
        return d.value
        }),
        val_max = d3.max(data_to_show, function (d) {
            return d.value
        });

    var radius_scale = d3.scaleLinear()
        .domain([val_min, val_max])
        .range([radius_min, radius_max]);

    var color_scale = d3.scaleLinear()
        .domain([val_min, val_max])
        .range([d3.rgb(selection.color).darker(1), d3.rgb(selection.color).brighter(3)]);

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

    var svg = d3.select('#agg_svg' + ID)
        .append('svg')
        .classed('inner_svg', true)
        .attr('id', 'inner_svg' + ID);

    var nodes = svg.selectAll('g')
        .data(data_to_show)
        .classed('nodes', true)
        .enter().append('g');

    var circle = nodes.append('circle')
        .classed('bubble_circle' + ID, true)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', function (d) {
            return radius_scale(d.value)
        })
        .attr('fill', function (d) {
            return color_scale(d.value)
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', function () {
            high_level.clicked(document.getElementById('high_level_rect' + ID))
        });
    var text = nodes.append('text')
        .classed('bubble_text' + ID, true)
        .attr('x', 0)
        .attr('y', 0)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "hanging")
        .attr('font-size', 4)
        .text(function (d) {
            return d.keyName
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', function () {
            high_level.clicked(document.getElementById('high_level_rect' + ID))
        });
    // var cover = nodes.append('circle')
    //     .classed('bubble_cover' + ID, true)
    //     .attr('cx', 0)
    //     .attr('cy', 0)
    //     .attr('r', function (d) {
    //         return radius_scale(d.value)
    //     })
    //     .attr('fill', function (d) {
    //         return color_scale(d.value)
    //     })
    //     .on('mouseover', mouseover)
    //     .on('mouseout', mouseout)
    //     .on('click', function () {
    //         high_level.clicked(document.getElementById('high_level_rect' + ID))
    //     });

    simulation.nodes(data_to_show);

    function ticked() {
        circle
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });
        text
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; });
    }

    function mouseover(d) {

        d3.select(this)
            .transition().duration(200)
            .attr('r', radius_max + 2);

        simulation.alphaTarget(0.1).nodes(data_to_show);

        var ap = data.find(function (value) {
            return value.id === d.id;
        });

        var message = '<span class="name">Name: </span><span class="value">' +
            ap.name +
            '</span><br/>' +
            '<span class="name">Country: </span><span class="value">' +
            ap.country +
            '</span><br/>' +
            '<span class="name">Number of Airlines: </span><span class="value">' +
            (ap.num_in_airline + ap.num_out_airline) +
            '<span> (In: </span>' + ap.num_in_airline +
            '<span>, out: </span>' + ap.num_out_airline +
            '<span>)</span>' +
            '</span>';

        tooltip_agg.showTooltip(message, d3.event);
    }

    function mouseout(d) {
        d3.select(this)
            .transition().duration(200)
            .attr('r', radius_scale(d.value));

        simulation.nodes(data_to_show);

        tooltip_agg.hideTooltip();
    }
}

function barChart(svg_bg, data_to_show, ID) {

    d3.select(svg_bg).selectAll('*').remove();

    // if (d3.select(svg_bg).selectAll('*') !== null) return;

    var selection = selections[ID];
    var data = selection.airport;
    var tooltip_agg = floatingTooltip('bar_tooltip', 240);

    var width = +svg_bg.getAttribute('width'),
        height = +svg_bg.getAttribute('height'),
        margin = {top: 30, bottom: 20, left: 20, right: 10 };

    var xScale = d3.scaleBand()
        .domain(data_to_show.map(function (d) {
            return d.keyName;
        }))
        .range([0, width - margin.right - margin.left]);

    var yScale = d3.scaleLinear()
        .domain([d3.max(data_to_show, function (d) {
            return d.value
        }) + 1, 0])
        .range([margin.top, height - margin.bottom]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format("d"));

    var svg = d3.select('#agg_svg'+ID)
        .append('svg')
        .classed('inner_svg', true)
        .attr('id', 'inner_svg'+ID)
        .attr('width', width)
        .attr('height', height);

    var xAxis_group =  svg.append('g')
        .classed('xAxis'+ID, true)
        .attr('transform', 'translate(' + margin.left +
            ',' + (height - margin.bottom) + ')')
        .call(xAxis)
        .selectAll('text')
        .attr('fill', 'white')
        .attr('transform', 'rotate(-90) translate(' + (-10) + ',' + (-10) + ')')
        .attr('font-size', 3);

    var yAxis_group = svg.append('g')
        .classed('yAxis'+ID, true)
        .attr('transform', 'translate(' + margin.left +
            ',' + 0 +')')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', 'white')
        .attr('font-size', 4);

    var bar_holder = svg.selectAll('rect.bar')
        .data(data_to_show)
        .enter().append('rect')
        .classed('bar', true)
        .attr('fill', d3.rgb(selection.color).brighter(2))
        .attr('x', function (d) {
            return xScale(d.keyName) + margin.left;
        })
        .attr('y', height - margin.bottom)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .on('click', function () {
            high_level.clicked(document.getElementById('high_level_rect'+ID))
        })
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    bar_holder.transition()
        .duration(2500)
        .attr('y', function (d) {
            return yScale(d.value)
        })
        .attr('height', function (d) {
            return height - yScale(d.value) - margin.bottom;
        });

    function mouseover(d) {

        d3.select(this)
            .transition().duration(200)
            .attr('pre_color', this.getAttribute('fill'))
            .attr('fill', d3.rgb(this.getAttribute('fill'))
                .darker(1));


        var ap = data.find(function (value) {
            return value.id === d.id;
        });

        var message = '<span class="name">Name: </span><span class="value">' +
            ap.name +
            '</span><br/>' +
            '<span class="name">Country: </span><span class="value">' +
            ap.country +
            '</span><br/>' +
            '<span class="name">Number of Airlines: </span><span class="value">' +
            (ap.num_in_airline + ap.num_out_airline) +
            '<span> (In: </span>' + ap.num_in_airline +
            '<span>, out: </span>' + ap.num_out_airline +
            '<span>)</span>' +
            '</span>';

        tooltip_agg.showTooltip(message, d3.event);
    }

    function mouseout(d) {
        d3.select(this)
            .transition().duration(200)
            .attr('r', (d.value))
            .attr('fill', this.getAttribute('pre_color'));

        tooltip_agg.hideTooltip();
    }

}
