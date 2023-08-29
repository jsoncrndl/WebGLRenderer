Rendering.assets.Cubemap = function(texture) {
    let textures = {
        "north": `${texture}_north`,
        "east": `${texture}_east`,
        "south": `${texture}_south`,
        "west": `${texture}_west`,
        "up": `${texture}_up`,
        "down": `${texture}_down`,
    };

    let api = {
        get north() { return Rendering.assets.textures.getTexture(textures.north); },
        get east() { return Rendering.assets.textures.getTexture(textures.east); },
        get south() { return Rendering.assets.textures.getTexture(textures.south); },
        get west() { return Rendering.assets.textures.getTexture(textures.west); },
        get up() { return Rendering.assets.textures.getTexture(textures.up); },
        get down() { return Rendering.assets.textures.getTexture(textures.down); }
    };

    return api;
}