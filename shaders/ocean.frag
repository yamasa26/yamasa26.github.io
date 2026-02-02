varying vec2 vUv;
varying vec3 vWorldPosition;
uniform sampler2D uNormalMapA;
uniform sampler2D uNormalMapB;
uniform float uLerp;
uniform samplerCube uEnvMap;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

void main() {
    // 視線方向の計算
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(vec3(1.5, 0.5, -1.0));
    
    // 法線の取得と補間
    vec3 nA = texture2D(uNormalMapA, vUv).rgb * 2.0 - 1.0;
    vec3 nB = texture2D(uNormalMapB, vUv).rgb * 2.0 - 1.0;
    vec3 rawNormal = normalize(mix(nA, nB, uLerp));
    
    // 法線マップの座標を世界座標（Y-up）に変換
    // ベイカーの出力 (-dx, -dy, 1.0) に合わせ、R=>X, B=>Y, G=>Zに変換
    vec3 normal = normalize(vec3(rawNormal.x, rawNormal.z, rawNormal.y)); 
    
    // 反射（空の映り込み）
    vec3 reflectDir = reflect(-viewDir, normal);
    // 反射ベクトルを少し補正して、より空の明るい部分を拾いやすくする
    vec3 envColor = textureCube(uEnvMap, reflectDir).rgb;
    
    // フレネル効果（斜めから見るほど反射を強くする）
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 1.5);
    
    // 水の色定義（明るく調整）
    vec3 deepWater = vec3(0.002, 0.05, 0.15);
    vec3 shallowWater = vec3(0.0, 0.2, 0.35);
    
    // 基本の色（環境光を少し足して黒つぶれを防ぐ）
    float facing = dot(normal, viewDir);
    vec3 baseColor = mix(deepWater, shallowWater, fresnel);
    vec3 waterColor = baseColor * (0.5 + 0.5 * facing);
    
    // 反射色と水の色をフレネルで合成
    vec3 finalColor = mix(waterColor, envColor, fresnel * 0.6 + 0.1);
    
    // スペキュラ
    float spec = pow(max(dot(reflectDir, sunDir), 0.0), 200.0) * 5.0;
    finalColor += vec3(spec);

    float dist = length(vWorldPosition.xyz - cameraPosition);
    
    // フォグ（色）の適用
    float fogFactor = smoothstep(fogNear, fogFar, dist);
    vec3 finalWithFog = mix(finalColor, fogColor, fogFactor * 0.3);
    finalWithFog.rgb *= 1.2; 
    finalWithFog.rgb += vec3(0.05); // 全体的に白を足す

    // 透明度の適用（メッシュの端を消す）
    float alpha = 1.0 - smoothstep(fogNear + 20.0, fogFar, dist);

    gl_FragColor = vec4(finalWithFog, alpha);
}