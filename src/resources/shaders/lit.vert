#version 300 es
precision lowp float;

in vec4 aPosition;
in vec4 aNormal;
in vec4 aTangent;
in vec2 aTexCoords;

out vec4 vPosition;
out vec4 vNormal;
out vec2 vTexCoords;
out mat4 vBTN;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec2 uv_offset;
uniform vec2 uv_scale;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * aPosition;

    vec4 viewNormal = normalize(normalMatrix * aNormal);
    
    vPosition = vPosition;
    vNormal = viewNormal;
    vTexCoords = aTexCoords * uv_scale + uv_offset;
}