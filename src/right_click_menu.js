function contextMenu(selector) {

    var height = 25,
        width = 150,
        items = ['Create Selection'],
        margin = 20,
        font_size = 13;

    function menu(x, y) {

        var svg = d3.select(selector);

        var menu_entry = svg.append('g')
            .attr('id', 'menu_group')
            .selectAll('g')
            .data(items).enter()
            .append('g').attr('class', 'menu-entry')
            .style('cursor', 'pointer')
            .attr('mouseover', mouseover_f)
            .attr('mouseout', mouseout_f)
            .on('click', function() {
                var x1 = x,
                    y1 = y,
                    x2 = x1 + 100,
                    y2 = y1 + 100;
                low_level.rightClickCreateSel(x1, y1, x2, y2)
            });

        menu_entry
            .append('rect')
            .attr('x', x)
            .attr('y', function (d, i) {
                return y + i * height;
            })
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'white');

        menu_entry
            .append('text')
            .text(function(d) { return d; })
            .attr('x', x)
            .attr('y', function(d, i) { return y + i * height; })
            .attr('dx', margin)
            .attr('dy', (height + font_size)/2)
            .attr('fill', '#141411')
            .attr('fill-opacity', 0.7)
            .attr('font-size', font_size);
    }

    function mouseover_f() {

    }
    function mouseout_f() {

    }
    return menu;
}
