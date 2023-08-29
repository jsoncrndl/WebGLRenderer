Rendering.ecs.systems.SpinningSystem = function() {
    let spinners = [];

    function update(elapsedTime) {
        for (let spinner of spinners) {
            spinner.entity.transform.setRotation(spinner.entity.transform.rotation.multiply(Quaternion.fromAxisAngle(spinner.axis, spinner.speed * elapsedTime)));
        }
    }

    function addSpinner(spinner) {
        spinners.push(spinner);
    }

    return {
        update: update,
        addSpinner: addSpinner
    }
}();