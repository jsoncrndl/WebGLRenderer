Rendering.ecs.systems.BobbingSystem = function() {
    let bobbers = [];

    let currentTime = 0;

    function initialize() {
        for (let bobber of bobbers) {
            bobber.setStartLocation(bobber.entity.transform.position);
        }
    }

    function update(elapsedTime) {
        currentTime += elapsedTime;
        if (currentTime >= 2 * Math.PI) {
            currentTime -= 2 * Math.PI;
        }

        for (let bobber of bobbers) {
            bobber.entity.transform.setPosition(bobber.startLocation.add(Vector3.up.multiply(bobber.distance * Math.sin(currentTime * bobber.speed))));
        }
    }

    function addBobber(bobber) {
        bobbers.push(bobber);
    }

    return {
        initialize: initialize,
        update: update,
        addBobber: addBobber
    }
}();