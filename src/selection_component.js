var SelectionComponentObj = new SelectionComponent()

function SelectionComponent() {
    var $selection_component = $('#selection_component');

    this.Children = [];

    this.addSelection = function(color) {
        var child_count = Object.keys(this.Children).length;
        var id = 'sc-' + child_count;

        // Create the element
        $selection_component.append('<div id="' + id + '"class="container-fluid sc-child"></div>');

        // Retain a pointer to the element
        var $child = $('#' + id);

        // Add color box
        $child.append('<div class="selection-color-box bottom-10" style="background:' + color + '"></div>');

        // Add selection name
        $child.append('<p>' + id + '</p>')

        // Add remove button
        $child.append('<button class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>');

        this.Children.push({
            id: id,
            color: color,
            ref: $child
        });
    }
};
