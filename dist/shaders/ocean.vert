varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormal;

uniform sampler2D uHeightMapA;
uniform sampler2D uHeightMapB;
uniform float uLerp;
uniform float uHeightScale;

void main() {
    vUv = uv;
    // 2枚の高さマップを補間して滑らかな動きを作る
    float hA = texture2D(uHeightMapA, uv).r;
    float hB = texture2D(uHeightMapB, uv).r;
    float h = mix(hA, hB, uLerp);
    
    vec3 newPos = position + vec3(0.0, h * uHeightScale, 0.0);
    vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
}