#version 300 es

in vec4 aPosition;
in vec4 aColor;
in vec4 aNormal;
out vec4 vNormal;
out vec4 vColor;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main()
{
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * aPosition;
    vColor = aColor;
    vNormal = aNormal;
}