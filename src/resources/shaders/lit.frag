#version 300 es
precision mediump float;

in vec4 vPosition;
in vec4 vNormal;
in vec2 vTexCoords;

struct light 
{
    float intensity;
    vec4 diffuse;
    vec4 specular;
    vec4 position;
    float attenuation;
    bool isEnabled;
};

uniform int numLights;
uniform light lights[5];

uniform vec4 mat_baseColor;
uniform float mat_diffuse;
uniform float mat_ambient;
uniform float mat_specular;
uniform float mat_shine;

uniform vec4 ambientColor;
uniform vec4 viewPos;

// Texture sampling
uniform sampler2D sampler_baseColor;
uniform sampler2D sampler_normal;
uniform bool useTexture_baseColor;
uniform bool useTexture_normal;

out vec4 outColor;

void main()
{
    vec4 texColor = mat_baseColor;
    if (useTexture_baseColor) {
        texColor *= texture(sampler_baseColor, vTexCoords);
    }

    vec4 normal = vNormal;
    // if (useTexture_normal) {
    //     normal = texture(sampler_normal, vTexCoords);
    // }

    vec4 color = ambientColor * mat_ambient;

    for (int i = 0; i < numLights; i++) {
        if (lights[i].isEnabled) {
            //Difuse lighting
            vec4 lightDirection = lights[i].position - vPosition;
            float lightDistance = length(lightDirection);
            float attenuation = clamp(lights[i].attenuation / lightDistance, 0.0, 1.0);

            lightDirection = normalize(lightDirection);
            color += lights[i].diffuse * max(dot(lightDirection, normal), 0.0) * mat_diffuse * attenuation;

            //Specular lighting
            vec4 reflectedLight = reflect(-lightDirection, normal);
            vec4 viewVector = normalize(viewPos - vPosition);
            color += vec4(1,1,1,1) * pow(max(dot(viewVector, reflectedLight), 0.0), mat_shine), 0.0, 1.0 * mat_specular * attenuation;
        }
    }

    outColor = clamp(color * texColor, 0.0, 1.0);
}