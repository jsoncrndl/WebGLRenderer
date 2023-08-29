let scripts = [
    "utilities.js",
    "math.js",
    "assets/shaders.js",
    "assets/materials.js",
    "assets/models.js",
    "assets/textures.js",
    "assets/cubemap.js",
    "graphics.js",
    "ecs/components/component.js",
    "ecs/components/meshRenderer.js",
    "ecs/components/transform.js",
    "ecs/components/component.js",
    "ecs/components/spinner.js",
    "ecs/components/bobber.js",
    "ecs/components/pointLight.js",
    "ecs/systems/bobberSystem.js",
    "ecs/systems/spinningSystem.js",
    "ecs/systems/meshRenderer.js",
    "ecs/systems/camera.js",
    "ecs/systems/pointLight.js",
    "ecs/entity.js",
    "gameModel.js",
    "driver.js"
]

scripts.forEach((path) => {
    let script = document.createElement("script");
    script.src = `scripts/${path}`;
    script.async = false;
    document.body.appendChild(script);
});