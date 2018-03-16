
function SelectionComponent(api) {
    var $selection_component = $('#selection_component');
    var Obj = this;

    this.Selections = {};

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
        var remove_id = id + '-remove';
        $child.append('<button id="' + remove_id + '" target="' + id + '" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>');
        
        // Add remove listener
        $('#' + remove_id).on('click', function() {
            Obj.removeSelection($(this).attr('target'));
        })
    }

    this.removeSelection = function(id) {
        api.deleteSelection(id);
        var $selection = $('#' + id_to_selection(id));
        $selection.remove();
    }

    var id_to_selection = function(id) {
        return 'sc-' + id;
    }
};
