Rendering.ecs.systems.Camera = function() {
    let graphics = Rendering.graphics;
    let cameraTransform;

    function setCamera(camera) {
        cameraTransform = camera.components["Transform"];
    }

    function update() {
        graphics.setViewMatrix(cameraTransform.position, cameraTransform.right, cameraTransform.up, cameraTransform.forward);
    }

    let api = {
        setCamera: setCamera,
        update: update
    }

    return api;
}();