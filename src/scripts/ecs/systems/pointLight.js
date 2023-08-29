Rendering.ecs.systems.PointLight = function() {
    let pointLights = [];

    function initialize() {
        Rendering.graphics.setLights(pointLights);
    }

    function addPointLight(pointLight) {
        pointLights.push(pointLight);
    }

    return {
        initialize: initialize,
        addPointLight: addPointLight
    }
}();