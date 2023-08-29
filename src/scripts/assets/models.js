Rendering.assets.models = function() {
    let unloadedModels = {};
    let models = {}

    function addModelForLoad(modelName, scale) {
        unloadedModels[modelName] = scale;
    }

    function addModelForLoad(modelName) {
        unloadedModels[modelName] = 1;
    }

    function getModel(name) {
        return models[name];
    }

    async function loadModels() {
        for (let name in unloadedModels) {
            let text = await loadFileFromServer(`resources/models/${name}.ply`);
            models[name] = importPLY(name, text, unloadedModels[name]);
        }

        Rendering.graphics.loadModels(models);
    }

    let api = {
        addModelForLoad:addModelForLoad,
        loadModels:loadModels,
        getModel:getModel
    };

    return api;
}();