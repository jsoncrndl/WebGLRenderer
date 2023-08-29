Rendering.assets.shaders = function() {
    let shaders = {};

    function addShaderForLoad(name) {
        shaders[name] = {};
    }

    function getShaderProgram(name) {
        return shaders[name].program;
    }

    async function compile() {
        return Rendering.graphics.compileShaders(shaders);
    }

    let api = {
        addShaderForLoad: addShaderForLoad,
        getShaderProgram: getShaderProgram,
        compile: compile
    };

    return api;
}();