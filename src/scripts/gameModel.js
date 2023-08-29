Rendering.gameModel = function() {
    let graphics = Rendering.graphics;
    let shaders = Rendering.assets.shaders;
    let materials = Rendering.assets.materials;
    let models = Rendering.assets.models;
    let textures = Rendering.assets.textures;
    let Entity = Rendering.ecs.Entity;

    let camera;
    let pointLight;
    let pointLight2;
    let pointLight3;
    let pointLight4;
    let skybox;

    async function loadContent() {
        models.addModelForLoad("cube");
        await models.loadModels();

        shaders.addShaderForLoad("lit");
        await shaders.compile();

        textures.addTextureForLoad("Wall_Stone_Basecolor");
        await textures.loadTextures();

        materials.addMaterialForLoad("stone");

        await materials.loadMaterials();
    }
    
    function initialize() {
        let cube = Rendering.ecs.Entity.makeCube();
        cube.transform.setScale(Vector3(2, 2, 2));
        cube.transform.setPosition(Vector3(0, 0, 8));
        pointLight = Rendering.ecs.Entity.makeLight(1, 1, 1);
        pointLight.transform.setPosition(Vector3(0, 0, -4));

        //Camera setup;
        camera = Entity();
        camera.transform.setPosition(Vector3(0, 5, 0));
        camera.transform.setRotation(Quaternion.fromEuler(30, 0, 0));
        Rendering.ecs.systems.Camera.setCamera(camera);

        Rendering.ecs.systems.BobbingSystem.initialize();
        Rendering.ecs.systems.PointLight.initialize();

        graphics.setFrustum(0.1, 1000, 60, 60);
        graphics.setAmbientColor(0.5, 0.5, 0.5);
    }
    
    let timer = 0;

    function update(elapsedTime) {
        timer += elapsedTime;

        if (timer >= 12) {
            timer -= 12;
        }

        Rendering.ecs.systems.SpinningSystem.update(elapsedTime);
        Rendering.ecs.systems.Camera.update(elapsedTime);
        Rendering.ecs.systems.BobbingSystem.update(elapsedTime);
    }

    function render() {
        graphics.clear();
        Rendering.ecs.systems.MeshRenderer.render();
    }

    api = {
        loadContent: loadContent,
        initialize: initialize,
        update: update,
        render: render
    };

    return api;
}();