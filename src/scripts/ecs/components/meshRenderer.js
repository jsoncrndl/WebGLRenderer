// Creates a mesh renderer. Spec is 
// {
//    model: ""
//    material: ""
// }
Rendering.ecs.components.MeshRenderer = function(spec) {
    let that = Rendering.ecs.components.Component();
    that.name = "MeshRenderer";
    
    that.model = spec.model;
    that.material = spec.material;

    function setMaterial(material) {
        that.material = material;
        graphics.setObjectMaterial(that);
    }

    let api = {
        get model() { return Rendering.assets.models.getModel(that.model); },
        setMaterial: setMaterial,
        get material() { return Rendering.assets.materials.getMaterial(that.material); }
    };

    return api;
}