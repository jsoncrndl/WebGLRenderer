Rendering.assets.textures = function() {
    let textures = {};

    function addTextureForLoad(name) {
        textures[name] = {};
    }

    function addCubemapForLoad(name) {
        textures[`${name}_north`] = {};
        textures[`${name}_east`] = {};
        textures[`${name}_south`] = {};
        textures[`${name}_west`] = {};
        textures[`${name}_up`] = {};
        textures[`${name}_down`] = {};
    }

    function getTexture(name) {
        return textures[name];
    }

    async function loadTextures() {
        for (let texture in textures) {
            textures[texture] = await loadTextureFromServer(`resources/textures/${texture}.png`);
        }
        Rendering.graphics.loadTextures(textures);
    }

    let api = {
        addTextureForLoad: addTextureForLoad,
        addCubemapForLoad: addCubemapForLoad,
        getTexture: getTexture,
        loadTextures: loadTextures,
    };

    return api;
}();