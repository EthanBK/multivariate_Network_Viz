
var block_svg;

function high_level() {

    var width = 1500,
        height = 750;

    block_svg = d3.selectAll('#high_level')
        .append('svg')
        .attr('id', "high_level_svg")
        .attr('width', width)
        .attr('height', height)
}

function buildBlock(selection, isNew) {

    var block_width = 300,
        block_height = 300;

    var square_width = block_width / 2;


    var data = [
        { id: 2, name: 'arrow', path: 'M 0,0 m -5,-5 L 5,0 L -5,5 Z', viewbox: '-5 -5 10 10' }
    ];

    var color = 'white',
        margin = {top: 50, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select('#high_level_svg').append('svg:svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    var defs = svg.append('svg:defs')

    var paths = svg.append('svg:g')
        .attr('id', 'markers')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var marker = defs.append('svg:marker')
        .attr('id', 'arrow')
        .attr('markerHeight', 5)
        .attr('markerWidth', 5)
        .attr('markerUnits', 'strokeWidth')
        .attr('orient', 'auto')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('viewBox', '-5 -5 10 10')
        .append('svg:path')
        .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
        .attr('fill', 'white');
    //
    // var path = paths.selectAll('path')
    //         .data(data)
    //         .enter()
    //         .append('svg:path')
    //         .attr('d', function(d,i){ return 'M 0,' + (i * 100) + ' L ' + (width - margin.right) + ',' + (i * 100) + '' })
    //         .attr('stroke', 'white')
    //         .attr('stroke-width', 5)
    //         .attr('stroke-linecap', 'round')
    //         .attr('marker-start', function(d,i){ return 'url(#marker_' + d.name + ')' })
    //         .attr('marker-end', function(d,i){ return 'url(#marker_' + d.name  + ')' })

    if (isNew) {
        // Create New Block
        var nodes = block_svg.append('g')
            .attr('id', 'group'+ selection.id)
            .attr('width', block_width)
            .attr('height', block_height);

        var rect = nodes.append('rect')
            .attr('width', square_width)
            .attr('height', square_width)
            .attr('stroke', selection.color)
            .attr('stroke-width', 3)
            .attr('fill', '#1f201c')
            .attr('x', selection.x1)
            .attr('y', selection.y1);

        var path_start = selection.y1/2 + ' ' + selection.x1,
            path_end = '0, ' + selection.x1 / 2;

        nodes.append('path')
            .classed('within_path' + selection.id, true)
            .attr('stroke', selection.color)
            .attr('stroke-width', 5)
            .attr('d', 'M ' + block_width/2 + ' ' + block_width +
                        ' A ' + block_width/2 + ' ' + block_width/2 +
                        '0, 1, 1, 0, ' + block_width/2),
            // .attr('marker-end', 'url(#arrow_within' + selection.id + ')');

        var marker_within = nodes.append('defs')
            .append('svg:marker')
            .attr('id', 'arrow_within' + selection.id)
            .attr('markerHeight', 5)
            .attr('markerWidth', 5)
            .attr('markerUnits', 'strokeWidth')
            .attr('orient', 'auto')
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('viewBox', '-5 -5 10 10')
            .append('svg:path')
            .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
            .attr('fill', 'white');

    }
    else {

    }

    var arrow_width_scale = d3.scaleLinear()
        .domain([])
        .range([0, 30])
}
