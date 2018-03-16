
function SelectionComponent(api) {
    var $selection_component = $('#selection_component');
    var Obj = this;

    this.Selections = {};
    this.HiddenSelections = {};

    this.addSelection = function(id, color) {
        var selection_id = id_to_selection(id);

        // Create the element
        $selection_component.append('<div id="' + selection_id + '"class="container-fluid sc-child"></div>');

        // Retain a pointer to the element
        var $child = $('#' + selection_id);

        // Add color box
        $child.append('<div class="selection-color-box bottom-10" style="background:' + color + '"></div>');

        // Add selection name
        $child.append('<p>' + selection_id + '</p>')

        // Add remove button
        var remove_id = id_to_remove(id) ;
        $child.append('<button id="' + remove_id + '" target="' + id + '" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>');
        $('#' + remove_id).on('click', function() {
            Obj.removeSelection($(this).attr('target'));
        })
        
        // Add toggle
        var toggle_id = id_to_toggle(id);
        $child.append('<div class="checkbox"><label><input id="' + toggle_id + '" type="checkbox" data-toggle="toggle"></label></div>')
        $('#' + toggle_id).bootstrapToggle('on').change(function() {
            if($(this).prop('checked'))
                Obj.show(id);
            else
                Obj.hide(id);
        }); 
    }

    this.removeSelection = function(id) {
        api.deleteSelection(id);
        var $selection = $('#' + id_to_selection(id));
        $selection.remove();
    }

    this.hide = function(id) {
        this.HiddenSelections[id] = selections[id];
        api.deleteSelection(id);
    }

    this.show = function(id) {
        var s = this.HiddenSelections[id];
        selections.splice(id, 0 , s);
        api.buildSelection(s.x1, s.y1, s.x2, s.y2, s.color, s.id);
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
