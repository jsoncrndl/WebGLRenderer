Rendering.ecs.components.Spinner = function(spec) {
    let that = Rendering.ecs.components.Component(spec);
    that.speed = spec.speed;
    that.axis = spec.axis;
    let api = {
        get speed() { return that.speed; },
        get axis() { return that.axis; }
    };
    return api;
}