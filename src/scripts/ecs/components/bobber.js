Rendering.ecs.components.Bobber = function(spec) {
    let that = Rendering.ecs.components.Component(spec);
    that.startLocation = spec.startLocation;
    that.speed = spec.speed;
    that.distance = spec.distance;

    function setStartLocation(start) {
        that.startLocation = start;
    }

    let api = {
        get speed() { return that.speed; },
        get distance() { return that.distance; },
        get startLocation() {return that.startLocation; },
        setStartLocation: setStartLocation
    };
    return api;
}