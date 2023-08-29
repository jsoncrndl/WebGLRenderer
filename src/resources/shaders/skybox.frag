#version 300 es
precision lowp float;

in vec4 vPosition;
out vec4 outColor;
uniform samplerCube uSampler;

void main()
{
    outColor = vPosition;
    outColor = texture(uSampler, vPosition.xyz);
}