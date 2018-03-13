
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

    var block_width = 200,
        block_height = 200;

    var square_width = 100;



    if (isNew) {
        // Create New Block
        var nodes = block_svg.append('g')
            .attr('id', selection.id)
            .attr('width', block_width)
            .attr('height', block_height);

        var rect = nodes.append('rect')
            .attr('width', square_width)
            .attr('height', square_width)
            .attr('stroke', selection.color)
            .attr('stroke-width', 3)
            .attr('fill', '#1f201c')
            .attr('x', selection.x1)
            .attr('y', selection.y1)



    }
    else {

    }
}
