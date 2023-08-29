#version 300 es

in vec4 aPosition;
out vec4 vPosition;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;

void main()
{
    vPosition = inverse(projectionMatrix * mat4(mat3(viewMatrix))) * aPosition;
    gl_Position = vec4(aPosition.xy, 1.0, 1.0);
}