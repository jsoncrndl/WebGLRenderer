Rendering.graphics = (function(pixelsX, pixelsY) {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let gl = canvas.getContext('webgl2', { alpha: false });


    let vertexBuffer;
    let vertexColorBuffer;
    let indexBuffer;
    let texCoordBuffer;
    let normalBuffer;
    let texturesLookup = {};
    let lights = [];
    let ambientColor = new Float32Array([1, 1, 1, 1]);

    let viewMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    let viewPos = [0, 0, 0];

    let projectionMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    function loadModels(models) {
        let vertices = [];
        let texCoords = [];
        let vertexColors = [];
        let indices = [];
        let normals = [];
        let tangents = [];
        let bitangents = [];

        for (let modelIndex in models) {
            let model = models[modelIndex];
            model.indexOffset = indices.length;
            model.vertexOffset = vertices.length / 3;
            for (let index of model.vertices) {
                vertices.push(index);
            }
            for (let index of model.uvs) {
                texCoords.push(index);
            }
            for (let index of model.vertexColors) {
                vertexColors.push(index);
            }
            for (let index of model.normals) {
                normals.push(index);
            }

            for (let index of model.indices) {
                indices.push(index + model.vertexOffset);
            }
        }

        indices = new Uint32Array(indices);
        vertices = new Float32Array(vertices);
        vertexColors = new Float32Array(vertexColors);
        normals = new Float32Array(normals);
        tangents = new Float32Array(tangents);
        bitangents = new Float32Array(bitangents);
        texCoords = new Float32Array(texCoords);

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        vertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    async function compileShaders(shaders) {
        for (let shaderName in shaders) {
            let source = await loadFileFromServer(`resources/shaders/${shaderName}.vert`)
            let vertexShader;
            let fragmentShader;

            vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, source);
            gl.compileShader(vertexShader);
    
            source = await loadFileFromServer(`resources/shaders/${shaderName}.frag`);
            fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, source);
            gl.compileShader(fragmentShader);
            
            let shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                const info = gl.getProgramInfoLog(shaderProgram);
                throw new Error(`Could not compile WebGL program. \n\n${info}`);
              }

            shaders[shaderName].vertex = vertexShader;
            shaders[shaderName].fragment = fragmentShader;
            shaders[shaderName].program = shaderProgram;
        }
    }

    function loadTextures(textures) {
        for (let texture in textures) {
            let newTexture = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, newTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //Flip the texture y coordinate
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[texture]);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //Clamp texture x
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT); //Clamp texture y
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //Linear filtering for stretch
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //Lineary filter for shrink

            texturesLookup[texture] = newTexture;
        }
        console.log(textures);
    }

    function setLights(lightList) {
        lights = lightList;
    }

    function setObjectMaterial(meshRenderer) {
        let vertexOffset = meshRenderer.model.vertexOffset;
        let material = meshRenderer.material;
        let shader = material.shader;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        let position = gl.getAttribLocation(shader, 'aPosition');
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, indexBuffer.BYTES_PER_ELEMENT * 3, vertexOffset * 3 * indexBuffer.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(position);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        let color = gl.getAttribLocation(shader, 'aColor');
        if (color != -1) {
            gl.enableVertexAttribArray(color);
            gl.vertexAttribPointer(color, 3, gl.FLOAT, false, vertexColorBuffer.BYTES_PER_ELEMENT * 3, vertexOffset * 3 * vertexColorBuffer.BYTES_PER_ELEMENT);    
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        let texCoord = gl.getAttribLocation(shader, 'aTexCoords');
        if (texCoord != -1) {
            gl.enableVertexAttribArray(texCoord);
            gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, texCoordBuffer.BYTES_PER_ELEMENT * 2, vertexOffset * 2 * texCoordBuffer.BYTES_PER_ELEMENT);    
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        let normal = gl.getAttribLocation(shader, 'aNormal');
        if (normal != -1) {
            gl.enableVertexAttribArray(normal);
            gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, normalBuffer.BYTES_PER_ELEMENT * 3, vertexOffset * 3 * normalBuffer.BYTES_PER_ELEMENT);    
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    let initialize = function() {
        gl.clearColor(0.3921, 0.5294, 0.9294, 1.0);
        gl.clearDepth(1.0);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.DEPTH_TEST);
        gl.cullFace(gl.FRONT);
        gl.enable(gl.CULL_FACE);
    }();

    function setAmbientColor(r, g, b) {
        ambientColor[0] = r;
        ambientColor[1] = g;
        ambientColor[2] = b;
        ambientColor[3] = 1;
    }

    function drawModel(model, material, position, rotation, scale) {
        gl.useProgram(material.shader);

        let xy = rotation.x * rotation.y;
        let xz = rotation.x * rotation.z;
        let yz = rotation.y * rotation.z;
        let xw = rotation.x * rotation.w;
        let yw = rotation.y * rotation.w;
        let zw = rotation.z * rotation.w;
        let x2 = rotation.x * rotation.x;
        let y2 = rotation.y * rotation.y;
        let z2 = rotation.z * rotation.z;

        let modelMatrix = multiplyMatrix4x4([
            (1-2 * (y2 + z2)), 2 * (xy - zw), 2 * (xz + yw), position.x,
            2 * (xy + zw), (1 - 2 * (x2 + z2)), 2 * (yz - xw), position.y,
            2 * (xz - yw), 2 * (yz + xw), (1 - 2 * (x2 + y2)), position.z,
            0, 0, 0, 1
        ], 
        [
            scale.x, 0, 0, 0,
            0, scale.y, 0, 0,
            0, 0, scale.z, 0,
            0, 0, 0, 1
        ]);

        let normalMatrix = [
            (1-2 * (y2 + z2)), 2 * (xy - zw), 2 * (xz + yw), 0,
            2 * (xy + zw), (1 - 2 * (x2 + z2)), 2 * (yz - xw), 0,
            2 * (xz - yw), 2 * (yz + xw), (1 - 2 * (x2 + y2)), 0,
            0, 0, 0, 0
        ]

        let location = gl.getUniformLocation(material.shader, 'modelMatrix');
        gl.uniformMatrix4fv(location, false, transposeMatrix4x4(modelMatrix));

        location = gl.getUniformLocation(material.shader, 'viewMatrix');
        gl.uniformMatrix4fv(location, false, transposeMatrix4x4(viewMatrix));

        location = gl.getUniformLocation(material.shader, 'projectionMatrix');
        gl.uniformMatrix4fv(location, false, transposeMatrix4x4(projectionMatrix));

        location = gl.getUniformLocation(material.shader, 'normalMatrix');
        gl.uniformMatrix4fv(location, false, transposeMatrix4x4(normalMatrix));

        location = gl.getUniformLocation(material.shader, 'viewPos');
        if (location != -1) {
            gl.uniform4fv(location, viewPos);
        }

        location = gl.getUniformLocation(material.shader, 'ambientColor');
        if (location != -1) {
            gl.uniform4fv(location, ambientColor);
        }

        location = gl.getUniformLocation(material.shader, 'numLights');
        if (location != -1) {
            gl.uniform1i(location, lights.length);
        }
        for (let i = 0; i < lights.length; i++) {
            location = gl.getUniformLocation(material.shader, `lights[${i}].attenuation`);
            gl.uniform1f(location, lights[i].attenuation);

            location = gl.getUniformLocation(material.shader, `lights[${i}].diffuse`);
            gl.uniform4fv(location, lights[i].diffuse);

            location = gl.getUniformLocation(material.shader, `lights[${i}].position`);
            let pos = lights[i].entity.transform.position.toArray();
            pos.push(0);
            gl.uniform4fv(location, pos);

            location = gl.getUniformLocation(material.shader, `lights[${i}].isEnabled`);
            gl.uniform1i(location, lights[i].enabled);
        }

        // Send material properties to the shader
        for (let property in material.properties["vec4"]) {
            let propertyLocation = gl.getUniformLocation(material.shader, property);
            if (propertyLocation != -1) {
                gl.uniform4fv(propertyLocation, material.properties["vec4"][property]);
            } else {
                console.log(`Couldn't find property ${property}`);
            }
        }
        
        for (let property in material.properties["vec2"]) {
            let propertyLocation = gl.getUniformLocation(material.shader, property);
            if (propertyLocation != -1) {
                gl.uniform2fv(propertyLocation, material.properties["vec2"][property]);
            } else {
                console.log(`Couldn't find property ${property}`);
            }
        }

        for (let property in material.properties["float"]) {
            let propertyLocation = gl.getUniformLocation(material.shader, property);
            if (propertyLocation != -1) {
                gl.uniform1f(propertyLocation, material.properties["float"][property]);
            } else {
                console.log(`Couldn't find property ${property}`);
            }
        }

        let imageIndex = 0;
        for (let property in material.properties["tex2D"]) {
            let propertyLocation = gl.getUniformLocation(material.shader, `sampler_${property}`);

            if (propertyLocation != -1) {
                gl.activeTexture(gl[`TEXTURE${imageIndex}`]);
                gl.bindTexture(gl.TEXTURE_2D, texturesLookup[material.properties["tex2D"][property]]);
                gl.uniform1i(propertyLocation, imageIndex);

                propertyLocation = gl.getUniformLocation(material.shader, `useTexture_${property}`);
                gl.uniform1i(propertyLocation, true);
            } else {
                console.log(`Couldn't find property ${property}`);
            }

            imageIndex++;
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_INT, model.indexOffset * Uint32Array.BYTES_PER_ELEMENT);
    }

    function setViewMatrix(position, right, up, forward) {
        viewMatrix[0] = right.x;
        viewMatrix[1] = right.y;
        viewMatrix[2] = right.z;
        viewMatrix[3] = -position.dot(right);
        viewMatrix[4] = up.x;
        viewMatrix[5] = up.y;
        viewMatrix[6] = up.z;
        viewMatrix[7] = -position.dot(up);
        viewMatrix[8] = -forward.x;
        viewMatrix[9] = -forward.y;
        viewMatrix[10] = -forward.z;
        viewMatrix[11] = -position.dot(forward.multiply(-1));

        viewPos[0] = position.x;
        viewPos[1] = position.y;
        viewPos[2] = position.z;
        viewPos[3] = 0;
    }

    function setFrustum(near, far, fovX, fovY) {
        let sizeX = Math.tan(fovX * Math.PI / 360) * near;
        let sizeY = Math.tan(fovY * Math.PI / 360) * near;

        projectionMatrix = [
            near / sizeX, 0, 0, 0,
            0, near / sizeY, 0, 0,
            0, 0, -(far + near)/(far - near), -2 * far * near / (far - near),
            0, 0, -1, 0
        ];
    }

    function setParallelClippingPlanes(near, far, width, height) {
        projectionMatrix = [
            2 / width, 0, 0, 0,
            0, 2 / height, 0, 0,
            0, 0, -2 / (far - near), -(far + near) / (far - near),
            0, 0, 0, 1
        ];
    }

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawModel: drawModel,
        loadModels: loadModels,
        loadTextures: loadTextures,
        compileShaders: compileShaders,
        setObjectMaterial: setObjectMaterial,
        setViewMatrix: setViewMatrix,
        setFrustum: setFrustum,
        setParallelClippingPlanes: setParallelClippingPlanes,
        setLights: setLights,
        setAmbientColor: setAmbientColor,
        get shadersLoaded() { return shadersLoaded; }
    };

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    });
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    });

    return api;
}(1000, 1000));
