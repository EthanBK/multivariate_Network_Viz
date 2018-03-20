function FilterComponent(api) {
    var Obj = this;
    var $filter = $('#filter_component');

    var LATITUDE_SLIDER_ID = 'attr-latitude';
    var LONGITUDE_SLIDER_ID = 'attr-longitude';

    this.clear = function() {
        $filter.empty();
    }

    this.addNav = function(active, s) {
        var tabs = {
            'Nodes': {
                id: 'left-col-nodes'
            },
            'Edges': {
                id: 'left-col-edges'
            }
        };

        // For each tab, generate HTML
        var ele = '<ul class="nav nav-tabs">';
        for(var key in tabs) {
            var tab = tabs[key];
            ele += '<li id="' + tab.id + '" role="presentation"><a href="#">' + key + '</a></li>';
        }
        ele += '</ul>';
        $filter.append(ele);
        for(var key in tabs) {
            var tab = tabs[key];
            tab.ref = $('#' + tab.id);
        }

        // Add listener to tab
        switch(active) {
            case 'Edges':
                tabs['Nodes'].ref.on('click', function() {
                    Obj.init_nodes(s);
                });
                tabs[active].ref.addClass('active');
                break;
            case 'Nodes':
                tabs['Edges'].ref.on('click', function() {
                    Obj.init_edges(s);
                });
                tabs[active].ref.addClass('active');
                break;
        }
    }

    this.addSlider = function(config, callback) {
        var axisScale = d3.scaleLinear()
            .domain(config.domain)
            .range(config.range);

        // Scale values
        config.value[0] = axisScale(config.value[0]);
        config.value[1] = axisScale(config.value[1]);

        var ele = '<div class="row-fluid top-10">';
        ele += '<h5>' + config.title + '</h5>';
        ele += '<input id="' + config.id + '" type="text" class="span2" value=""';
        ele += 'data-slider-min="' + config.range[0] + '" data-slider-max="' + config.range[1] + '" data-slider-step="1"';
        ele += 'data-slider-value="[' + config.value[0] + ',' + config.value[1] + ']"/>';
        ele += '</div>';
        $filter.append(ele);
        $('#' + config.id).slider().on('slide', function(event) {
            var scale = d3.scaleLinear()
                .domain(config.range)
                .range(config.domain)
            callback(event, scale);
        });
    }

    this.addToggle = function(config, on_callback, off_callback) {
        var ele = '<div class="row-fluid top-10">';
        ele += '<h5>' + config.title + '</h5>';
        ele += '<div class="checkbox"><label><input id="' + config.id + '" type="checkbox" data-toggle="toggle"></label></div>';
        ele += '</div>';
        $filter.append(ele);

        var $toggle = $('#' + config.id);
        $toggle.bootstrapToggle('on').change(function() {
            if($toggle.prop('checked'))
                on_callback();
            else
                off_callback();
        });
    }

    this.init_edges = function(s) {
        function c_wrap(callback) { return function() { callback(s.id)};}

        this.clear();
        this.addNav('Edges', s);
        this.addToggle({
            title: 'Within',
            id: 'attr-within'
        }, c_wrap(api.showWithinLinks), c_wrap(api.hideWithinLinks))
        this.addToggle({
            title: 'Between In',
            id: 'attr-between-in'
        }, c_wrap(api.showBetweenInLinks), c_wrap(api.hideBetweenInLinks));
        this.addToggle({
            title: 'Between Out',
            id: 'attr-between-out'
        }, c_wrap(api.showBetweenOutLinks), c_wrap(api.hideBetweenOutLinks));
        this.addToggle({
            title: 'Background In',
            id: 'attr-background-in',
        }, c_wrap(api.showBackgroundInLinks), c_wrap(api.hideBackgroundInLinks));
        this.addToggle({
            title: 'Background Out',
            id: 'attr-background-out'
        }, c_wrap(api.showBackgroundOutLinks), c_wrap(api.hideBackgroundOutLinks));
    }

    this.updateSlider = function(x1, y1, x2, y2) {
        var xAxisScale = d3.scaleLinear()
            .domain([0, 1500])
            .range([-180, 180]);
        var yAxisScale = d3.scaleLinear()
            .domain([0, 750])
            .range([-90, 90])
        $('#' + LONGITUDE_SLIDER_ID).slider('setValue', [
            xAxisScale(x1), xAxisScale(x2)
        ]);
        $('#' + LATITUDE_SLIDER_ID).slider('setValue', [
            yAxisScale(y1), yAxisScale(y2)
        ]);
    }

    this.init_nodes = function(s) {
        this.clear();
        this.addNav('Nodes', s);

        function redrawSelection(s) {
            var $selection_box = $('#sel_group' + s.id);
            // Delete existing links
            api.deleteLinks(s.id);
            api.deleteDot(s.id);

            // Re-draw links with resized box
            api.buildSelection(s.x1, s.y1, s.x2, s.y2, s.color, s.id);

            // Adjust box to new dimensions
            $selection_box.attr('x', s.x1);
            $selection_box.attr('y', s.y1);
            $selection_box.attr('width', s.x2 - s.x1);
            $selection_box.attr('height', s.y2 - s.y1);
            var $rect_box = $selection_box.find('rect');
            $rect_box.attr('x', s.x1);
            $rect_box.attr('y', s.y1);
            $rect_box.attr('width', s.x2 - s.x1);
            $rect_box.attr('height', s.y2 - s.y1);
        }

        var SlideTimeout;
        this.addSlider({
            title: 'Latitude',
            id: LATITUDE_SLIDER_ID,
            value: [s.y1, s.y2],
            domain: [0, 750],
            range: [-90, 90]
        }, function(event, scale) {
            clearTimeout(SlideTimeout);
            SlideTimeout = setTimeout(function() {
                s.y1 = scale(event.value[0]);
                s.y2 = scale(event.value[1]);
                redrawSelection(s);
            }, 250);
        });

        this.addSlider({
            title: 'Longitude',
            id: LONGITUDE_SLIDER_ID,
            value: [s.x1, s.x2],
            domain: [0, 1500],
            range: [-180, 180]
        }, function(event, scale) {
            clearTimeout(SlideTimeout);
            SlideTimeout = setTimeout(function() {
                s.x1 = scale(event.value[0]);
                s.x2 = scale(event.value[1]);
                redrawSelection(s);
            }, 250);
        });
    }
}

function SelectionComponent(api) {
    var FilterComponentObj = new FilterComponent(api);
    var $selection_component = $('#selection_component');
    var Obj = this;
    var Selected;

    this.Filter = FilterComponentObj;
    this.HiddenSelections = {};

    this.getActive = function() {
        return $('.selection-active').attr('selection');
    }

    this.addSelection = function(id, color) {
        var selection_id = id_to_selection(id);

        // Create the element
        $selection_component.append('<div id="' + selection_id + '"class="container-fluid sc-child bottom-10" selection="' + id + '"></div>');

        // Retain a pointer to the element
        var $child = $('#' + selection_id);
        Obj.selectSelection($child);

        // Add color box
        $child.append('<div class="selection-color-box" style="background:' + color + '"></div>');

        // Add selection name
        $child.append('<p>' + selection_id + '</p>');

        $child.on('mouseover', function() {
            $(this).addClass('selection-hover');
        });

        $child.on('mouseleave', function() {
            $(this).removeClass('selection-hover');
        });

        /* Add subcomponents */

        // Add remove button
        var remove_id = id_to_remove(id) ;
        $child.append('<button id="' + remove_id + '" target="' + id + '" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>');
        $('#' + remove_id).on('click', function() {
            Obj.removeSelection($(this).attr('target'));
        })

        // Add toggle
        var toggle_id = id_to_toggle(id);
        $child.append('<div class="checkbox"><label><input id="' + toggle_id + '" type="checkbox" data-toggle="toggle"></label></div>')
        var $toggle = $('#' + toggle_id);
        $toggle.bootstrapToggle('on').change(function() {
            if($toggle.prop('checked'))
                Obj.show(id);
            else
                Obj.hide(id);
        });

        var selection = find_selection(id);
        FilterComponentObj.init_nodes(selection);

        // If child is selected, show filter options
        $child.on('click', function() {
            if($toggle.prop('checked'))
                FilterComponentObj.init_nodes(selection);
            Obj.selectSelection($(this));
        });
    }

    this.selectSelection = function(ele) {
        $('.sc-child').each(function() {
            $(this).removeClass('selection-active');
        });
        ele.addClass('selection-active');
    }

    this.removeSelection = function(id) {
        api.deleteSelection(id);
        var $selection = $('#' + id_to_selection(id));
        $selection.remove();
        this.makeActive(0);
    }

    this.makeActive = function(index) {
        var $nth_child = $('.sc-child')[index]
        if($nth_child)
            $($nth_child).trigger('click');
    }

    this.hide = function(id) {
        api.hideSelection(id);

        if(api.selections.length > 0) {
            var next_selection = 0;
            if(id == 0)
                next_selection = 1;
            this.makeActive(next_selection)
        }
    }

    this.show = function(id) {
        api.showSelection(id);
    }

    var find_selection = function(id) {
        var len = api.selections.length;

        for(var i = 0; i < len; ++i) {
            var selection = api.selections[i];
            if(selection && selection.id == id)
                return selection;
        }
    }

    var id_to_remove = function(id) {
        return 'remove-' + id_to_selection(id);
    }

    var id_to_toggle = function(id) {
        return 'toggle-' + id_to_selection(id);
    }

    var id_to_selection = function(id) {
        return 'sc-' + id;
    }
};
