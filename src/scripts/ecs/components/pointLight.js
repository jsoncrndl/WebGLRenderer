// Creates a mesh renderer. Spec is 
// {
//      "diffuse": [],
//      "attenuation": 1,
// }
Rendering.ecs.components.PointLight = function(spec) {
    let that = Rendering.ecs.components.Component();
    that.name = "PointLight";
    
    that.diffuse = spec.diffuse;
    that.attenuation = spec.attenuation;

    that.setDiffuseColor = function(r, g, b) {
        diffuse[0] = r;
        diffuse[1] = g;
        diffuse[2] = b;
    }

    that.enable = function(on) {
        that.enabled = on;
    }
    
    return that;
}