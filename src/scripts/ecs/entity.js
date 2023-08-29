// Entity based on ecs snake demo
Rendering.ecs.Entity = function() {
    'use strict';

    let nextID = 1;

    function entity() {
        let components = {};

        let that = { 
            get components() { return components; }
        }

        function addComponent(component) {
            components[component.name] = component;
            component.entity = that;
        }
        
        function removeComponent(component) {
            delete components[component.name];
        } 

        addComponent(Rendering.ecs.components.Transform());
        that.transform = components["Transform"];
        that.id = nextID++;
        that.addComponent = addComponent;
        that.removeComponent = removeComponent;
        
        return that;
    }

    return entity;
}();

Rendering.ecs.Entity.makeLight = function(r, g, b) {
    let entity = Rendering.ecs.Entity();
    let light = Rendering.ecs.components.PointLight({
        "diffuse": [r, g, b, 1],
        "attenuation": 1000
    });
    
    entity.addComponent(light);
    Rendering.ecs.systems.PointLight.addPointLight(light);
    
    return entity;
}

Rendering.ecs.Entity.makeAttenuatedLight = function(r, g, b, attenuation) {
    let entity = Rendering.ecs.Entity();
    let light = Rendering.ecs.components.PointLight({
        "diffuse": [r, g, b, 1],
        "attenuation": attenuation
    });

    let bobber = Rendering.ecs.components.Bobber({
        "distance": 1,
        "speed": 5
    });
    Rendering.ecs.systems.BobbingSystem.addBobber(bobber);
    entity.addComponent(bobber);
    entity.addComponent(light);
    Rendering.ecs.systems.PointLight.addPointLight(light);
    
    return entity;
}

Rendering.ecs.Entity.makeCube = function() {
    let entity = Rendering.ecs.Entity();
    let renderer = Rendering.ecs.components.MeshRenderer({
        model: "cube",
        material: "stone"
    });
    console.log(renderer.material);
    entity.addComponent(renderer);
    Rendering.graphics.setObjectMaterial(renderer);
    Rendering.ecs.systems.MeshRenderer.addMeshRenderer(renderer);

    let spinner = Rendering.ecs.components.Spinner({
        axis: Vector3(0, 1, 0),
        speed: -30
    });
    entity.addComponent(spinner);
    Rendering.ecs.systems.SpinningSystem.addSpinner(spinner);

    return entity;
}