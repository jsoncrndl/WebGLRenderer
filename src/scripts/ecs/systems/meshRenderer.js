Rendering.ecs.systems.MeshRenderer = function() {
    let graphics = Rendering.graphics;
    let meshRenderers = [];

    function addMeshRenderer(renderer) {
        meshRenderers.push(renderer);
    }
    
    function renderEntity(meshRenderer) {
        let transform = meshRenderer.entity.transform;
        graphics.drawModel(meshRenderer.model, meshRenderer.material, transform.position, transform.rotation, transform.scale);
    }

    function render() {
        for (renderer of meshRenderers) {
            renderEntity(renderer);
        }
    }

    let api = {
        render: render,
        addMeshRenderer: addMeshRenderer
    }

    return api;
}();