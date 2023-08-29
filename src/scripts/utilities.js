

//------------------------------------------------------------------
//
// Helper function used to load a file from the server
//
//------------------------------------------------------------------
function loadFileFromServer(filename) {
    return fetch(filename)
        .then(res => res.text());
}

async function loadJSONFromServer(filename) {
    return fetch(filename)
        .then(res => res.json());
}

function loadTextureFromServer(filename) {
    return new Promise((resolve, reject) => {
        fetch(filename).then(res => res.blob()).then(image => {
            let asset = new Image();
            asset.onload = function () {
                URL.revokeObjectURL(asset.src);
                resolve(asset);
            }
            asset.src = URL.createObjectURL(image);
        }).catch(err => {
            reject(err);
        });
    });
}

//------------------------------------------------------------------
//
// Helper function to multiply two 4x4 matrices.
//
//------------------------------------------------------------------
function multiplyMatrix4x4(m1, m2) {
    let r = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0];

    // Iterative multiplication
    // for (let i = 0; i < 4; i++) {
    //     for (let j = 0; j < 4; j++) {
    //         for (let k = 0; k < 4; k++) {
    //             r[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
    //         }
    //     }
    // }

    // "Optimized" manual multiplication
    r[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
    r[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
    r[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
    r[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];

    r[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
    r[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
    r[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
    r[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];

    r[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
    r[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
    r[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
    r[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];

    r[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
    r[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
    r[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    r[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

    return r;
}

//------------------------------------------------------------------
//
// Transpose a matrix.
// Reference: https://jsperf.com/transpose-2d-array
//
//------------------------------------------------------------------
function transposeMatrix4x4(m) {
    let t = [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
    return t;
}

// Model format:
// {
//    name: "file_name",
//    vertices: [],
//    normals: [],
//    uvs: [],
//    vertexColors: [],
//    indices: []
// }

function importPLY(fileName, text, scale) {
    let lines = text.split("\n");
    
    let elements = {};

    let autoGenerateNormals = true;

    //Read each element and its properties from the header
    function addElement(lineIndex) {
        let line = lines[lineIndex].trim().split(" ");
        let elementName = line[1];
        let elementCount = parseInt(line[2]);
        let properties = [];

        let propertyIndex = lineIndex + 1;
        while (!lines[propertyIndex].trim().startsWith("element") && !lines[propertyIndex].trim().startsWith("end_header")) {
            let property = lines[propertyIndex];

            let splitProperty = property.split(" ");
            let propertyName = splitProperty[splitProperty.length-1];

            if (propertyName === "nx" || propertyName === "normal_x") {
                autoGenerateNormals = false;
            }

            properties[propertyIndex - lineIndex - 1] = propertyName;
            propertyIndex++;
        }

        elements[elementName] = {
            count:elementCount,
            properties:properties
        };

        return propertyIndex - 1;
    }

    let curLine;

    //Read the header
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("element")) {
            i = addElement(i);
        } else if (lines[i].trim().startsWith("end_header")) {
            curLine = i + 1;
            break;
        }
    }

    let vertexCount = elements.vertex.count;
    let indexCount = elements.face.count;

    let mesh = {
        name: fileName,
        vertices: new Array(vertexCount * 3),
        indices: new Array(indexCount * 3),
        normals: new Array(vertexCount * 3),
        vertexColors: new Array(vertexCount * 3),
        uvs: new Array(vertexCount * 2)
    }

    let triangleLookup = [];
    let normalLookup = [];

    //Read the elements
    for (let elementName in elements) {
        let element = elements[elementName];

        for (let i = 0; i < element.count; i++, curLine++) {
            let line = lines[curLine];
            let splitLine = line.trim().split(" ");
            if (elementName == "vertex") {
                for (let propertyIndex in element.properties) {
                    let property = element.properties[propertyIndex];
    
                    switch (property) {
                        case "x":
                            mesh.vertices[3*i] = parseFloat(splitLine[propertyIndex]) * scale;
                            break;
                        case "y":
                            mesh.vertices[3*i+1] = parseFloat(splitLine[propertyIndex]) * scale;
                            break;
                        case "z":
                            mesh.vertices[3*i+2] = parseFloat(splitLine[propertyIndex]) * scale;
                            break;
                        case "nx":
                        case "normal_x":
                            mesh.normals[3*i] = parseFloat(splitLine[propertyIndex]);
                            break;
                        case "ny":
                        case "normal_y":
                            mesh.normals[3*i+1] = parseFloat(splitLine[propertyIndex]);
                            break;
                        case "nz":
                        case "normal_z":
                            mesh.normals[3*i+2] = parseFloat(splitLine[propertyIndex]);
                            break;
                        case "s":
                        case "u":
                        case "texture_u":
                            mesh.uvs[2*i] = parseFloat(splitLine[propertyIndex]);
                            break;
                        case "t":
                        case "v":
                        case "texture_v":
                            mesh.uvs[2*i+1] = parseFloat(splitLine[propertyIndex]);
                            break;
                        case "red":
                            mesh.vertexColors[3*i] = parseFloat(splitLine[propertyIndex]) / 255;
                        case "green":
                            mesh.vertexColors[3*i+1] = parseFloat(splitLine[propertyIndex]) / 255;
                        case "blue":
                            mesh.vertexColors[3*i+2] = parseFloat(splitLine[propertyIndex]) / 255;
                    }
                }
            } else if (elementName == "face") {
                let v1 = parseFloat(splitLine[1]);
                let v2 = parseFloat(splitLine[2]);
                let v3 = parseFloat(splitLine[3]);

                mesh.indices[3*i] = v1;
                mesh.indices[3*i+1] = v2;
                mesh.indices[3*i+2] = v3;

                //Calculate the triangle normal

                if (autoGenerateNormals) {
                    if (triangleLookup[v1] === undefined) {
                        triangleLookup[v1] = [i];
                    } else {
                        triangleLookup[v1].push(i);
                    }
                    if (triangleLookup[v2] === undefined) {
                        triangleLookup[v2] = [i];
                    } else {
                        triangleLookup[v2].push(i);
                    }
                    if (triangleLookup[v3] === undefined) {
                        triangleLookup[v3] = [i];
                    } else {
                        triangleLookup[v3].push(i);
                    }


                    let x1 = mesh.vertices[3 * v1];
                    let y1 = mesh.vertices[3 * v1 + 1];
                    let z1 = mesh.vertices[3 * v1 + 2]

                    let x2 = mesh.vertices[3 * v2];
                    let y2 = mesh.vertices[3 * v2 + 1];
                    let z2 = mesh.vertices[3 * v2 + 2]
    
                    let x3 = mesh.vertices[3 * v3];
                    let y3 = mesh.vertices[3 * v3 + 1];
                    let z3 = mesh.vertices[3 * v3 + 2]

                    let x12 = x2 - x1;
                    let y12 = y2 - y1;
                    let z12 = z2 - z1;
    
                    let x13 = x3 - x1;
                    let y13 = y3 - y1;
                    let z13 = z3 - z1;

                    let nx = y12 * z13 - y13 * z12;
                    let ny = x13 * z12 - x12 * z13;
                    let nz = x12 * y13 - x13 * y12;

                    let d = Math.sqrt(nx * nx + ny * ny + nz * nz);

                    normalLookup[i] = [nx / d, ny / d, nz / d]
                }
            }
        }
    }
    if (autoGenerateNormals) {
        for (let i = 0; i < triangleLookup.length; i++) {
            let xTotal = 0;
            let yTotal = 0;
            let zTotal = 0;

            if (triangleLookup[i] !== undefined) {
                for (let j = 0; j < triangleLookup[i].length; j++) {
                    xTotal += normalLookup[triangleLookup[i][j]][0];
                    yTotal += normalLookup[triangleLookup[i][j]][1];
                    zTotal += normalLookup[triangleLookup[i][j]][2];
                }

                xTotal /= triangleLookup[i].length;
                yTotal /= triangleLookup[i].length;
                zTotal /= triangleLookup[i].length;

                let nx = xTotal / triangleLookup[i].length;
                let ny = yTotal / triangleLookup[i].length;
                let nz = zTotal / triangleLookup[i].length;

                let d = Math.sqrt(nx * nx + ny * ny + nz * nz);

                mesh.normals[3 * i] = nx / d;
                mesh.normals[3 * i + 1] = ny / d;
                mesh.normals[3 * i + 2] = nz / d;
            }
        }
    }

    return mesh;
}