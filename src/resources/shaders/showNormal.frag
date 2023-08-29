#version 300 es
precision lowp float;

in vec4 vColor;
in vec4 vNormal;
out vec4 outColor;

void main()
{
    outColor = vNormal / 2.0;
    outColor.x += 0.5;
    outColor.y += 0.5;
    outColor.z += 0.5;
}