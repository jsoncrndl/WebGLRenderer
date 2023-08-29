Rendering.assets.materials = function() {
    let materials = {};
    let unloadedMaterials = [];

    async function loadMaterials() {
        console.log(unloadedMaterials);

        for (let materialName of unloadedMaterials) {
            if (materials[materialName] != undefined) {
                console.warn("Trying to load duplicate material!");
            }
    
            material = await loadJSONFromServer(`resources/materials/${materialName}.json`);
            materials[materialName] = makeMaterial(material);
        }
    }

    function makeMaterial(spec) {
        return {
            get properties() { return spec.properties; },
            get shader() { return Rendering.assets.shaders.getShaderProgram(material.shader); }
        }
    }

    function getMaterial(name) {
        return materials[name];
    }

    function addMaterialForLoad(name) {
        unloadedMaterials.push(name);
    }

    let api = {
        loadMaterials: loadMaterials,
        getMaterial: getMaterial,
        addMaterialForLoad: addMaterialForLoad
    };

    return api;
}();