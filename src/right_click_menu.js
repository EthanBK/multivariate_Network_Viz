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
            .attr('fill', 'gray');

        menu_entry
            .append('text')
            .text(function(d) { return d; })
            .attr('x', x)
            .attr('y', function(d, i) { return y + i * height; })
            .attr('dx', margin)
            .attr('dy', (height + font_size)/2)
            .attr('fill', '#efefef')
            .attr('fill-opacity', 0.7)
            .attr('font-size', font_size);
    }

    function mouseover_f() {

    }
    function mouseout_f() {

    }
    return menu;

    // var height,
    //     width,
    //     margin = 0.1, // fraction of width
    //     items = [],
    //     rescale = false,
    //     style = {
    //         'rect': {
    //             'mouseout': {
    //                 'fill': 'rgb(244,244,244)',
    //                 'stroke': 'white',
    //                 'stroke-width': '1px'
    //             },
    //             'mouseover': {
    //                 'fill': 'rgb(200,200,200)'
    //             }
    //         },
    //         'text': {
    //             'fill': 'steelblue',
    //             'font-size': '13'
    //         }
    //     };
    // function menu(x, y) {
    //     d3.select('.context-menu').remove();
    //     scaleItems();
    //
    //     // Draw the menu
    //     d3.select('#low_svg')
    //         .append('g').attr('class', 'context-menu')
    //         .selectAll('tmp')
    //         .data(items).enter()
    //         .append('g').attr('class', 'menu-entry')
    //         .style({'cursor': 'pointer'})
    //         .on('mouseover', function(){
    //             d3.select(this).select('rect').style(style.rect.mouseover) })
    //         .on('mouseout', function(){
    //             d3.select(this).select('rect').style(style.rect.mouseout) });
    //
    //     d3.selectAll('.menu-entry')
    //         .append('rect')
    //         .attr('x', x)
    //         .attr('y', function(d, i){ return y + (i * height); })
    //         .attr('width', width)
    //         .attr('height', height)
    //         .style(style.rect.mouseout);
    //
    //     d3.selectAll('.menu-entry')
    //         .append('text')
    //         .text(function(d){ return d; })
    //         .attr('x', x)
    //         .attr('y', function(d, i){ return y + (i * height); })
    //         .attr('dy', height - margin / 2)
    //         .attr('dx', margin)
    //         .style(style.text);
    //
    //     // Other interactions
    //     d3.select('body')
    //         .on('click', function() {
    //             d3.select('.context-menu').remove();
    //         });
    //
    // }
    //
    // menu.items = function(e) {
    //     if (!arguments.length) return items;
    //     for (var i in arguments) items.push(arguments[i]);
    //     rescale = true;
    //     return menu;
    // };
    //
    // // Automatically set width, height, and margin;
    // function scaleItems() {
    //     if (rescale) {
    //         d3.select('svg').selectAll('tmp')
    //             .data(items).enter()
    //             .append('text')
    //             .text(function(d){ return d; })
    //             .style(style.text)
    //             .attr('x', -1000)
    //             .attr('y', -1000)
    //             .attr('class', 'tmp');
    //         var z = d3.selectAll('.tmp')[0]
    //             .map(function(x){ return x.getBBox(); });
    //         width = d3.max(z.map(function(x){ return x.width; }));
    //         margin = margin * width;
    //         width =  width + 2 * margin;
    //         height = d3.max(z.map(function(x){ return x.height + margin / 2; }));
    //
    //         // cleanup
    //         d3.selectAll('.tmp').remove();
    //         rescale = false;
    //     }
    // }
    //
    // return menu;
}
