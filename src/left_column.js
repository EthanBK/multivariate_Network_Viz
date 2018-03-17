function FilterComponent(api) {
    var $filter = $('#filter_component');
    var $latitude = $("#attr-latitude");
    var $longitude = $("#attr-longitude");

    this.clear = function() {
        $filter.empty();
    }

    this.addNav = function() {
        var ele = '<ul class="nav nav-tabs">';
        ele += '<li role="presentation" class="active"><a href="#">Nodes</a></li>';
        ele += '<li role="presentation"><a href="#">Edges</a></li>';
        ele += '</ul>';

        $filter.append(ele);
    }

    this.addSlider = function(config, callback) {
        var ele = '<div class="row-fluid top-10">';
        ele += '<h5>' + config.title + '</h5>';
        ele += '<input id="' + config.id + '" type="text" class="span2" value=""';
        ele += 'data-slider-min="10" data-slider-max="1000" data-slider-step="5"';
        ele += 'data-slider-value="[' + config.value[0] + ',' + config.value[1] + ']"/>';
        ele += '</div>';
        $filter.append(ele);
        $('#' + config.id).slider().on('slide', callback);
    }

    this.init = function(s) {
        this.clear();
        this.addNav();

        this.addSlider({
            title: 'Latitude',
            id: 'attr-latitude',
            value: [s.x1, s.x2]
        }, function(event) {
            s.x1 = event.value[0];
            s.x2 = event.value[1];
            api.buildSelection(s.x1, s.x2, s.y1, s.y2, s.color, s.id);
        });

        this.addSlider({
            title: 'Longitude',
            id: 'attr-longitude',
            value: [s.y1, s.y2]
        }, function(event) {
            s.y1 = event.value[0];
            s.y2 = event.value[1];
            api.buildSelection(s.x1, s.x2, s.y1, s.y2, s.color, s.id);
        });
    }
}

function SelectionComponent(api) {
    var FilterComponentObj = new FilterComponent(api);
    var $selection_component = $('#selection_component');
    var Obj = this;
    var Selected;

    this.HiddenSelections = {};

    this.addSelection = function(id, color) {
        var selection_id = id_to_selection(id);

        // Create the element
        $selection_component.append('<div id="' + selection_id + '"class="container-fluid sc-child bottom-10"></div>');

        // Retain a pointer to the element
        var $child = $('#' + selection_id);

        // Add color box
        $child.append('<div class="selection-color-box" style="background:' + color + '"></div>');

        // Add selection name
        $child.append('<p>' + selection_id + '</p>');

        $child.on('mouseover', function() {
            $(this).css('background', 'rgb(240,240,240)');
        });

        $child.on('mouseleave', function() {
            $(this).css('background', 'rgb(255,255,255)');
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
        FilterComponentObj.init(selection);

        // If child is selected, show filter options
        $child.on('click', function() {
            if($toggle.prop('checked'))
                FilterComponentObj.init(selection);
        });
    }

    this.removeSelection = function(id) {
        api.deleteSelection(id);
        var $selection = $('#' + id_to_selection(id));
        $selection.remove();
    }

    this.hide = function(id) {
        api.hideSelection(id);
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
