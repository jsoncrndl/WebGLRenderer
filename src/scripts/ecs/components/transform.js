Rendering.ecs.components.Transform = function() {

    let that = Rendering.ecs.components.Component();
    that.name = "Transform";

    let scale = Vector3(1, 1, 1);
    let position = Vector3(0, 0, 0);
    let rotation = Quaternion(1, 0, 0, 0 );

    let up = Vector3.up;
    let right = Vector3.right;
    let forward = Vector3.forward;

    that.setScale = function(newScale) {
        scale = newScale;
    }

    that.setPosition = function(newPosition) {
        position = newPosition;
    }

    that.setRotation = function(newRotation) {
        rotation = newRotation;

        up = rotation.multiplyVector(Vector3.up);
        right = rotation.multiplyVector(Vector3.right);
        forward = rotation.multiplyVector(Vector3.forward);

        up.normalize();
        right.normalize();
        forward.normalize();
    }

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'rotation', {
        get: () => rotation
    });

    Object.defineProperty(that, 'scale', {
        get: () => scale
    });

    Object.defineProperty(that, 'up', {
        get: () => up
    });

    Object.defineProperty(that, 'right', {
        get: () => right
    });

    Object.defineProperty(that, 'forward', {
        get: () => forward
    });

    return that;
};