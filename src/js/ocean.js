import * as THREE from 'three';
import '../styles/style.css';

// --- Webpackにファイルの場所を教える設定 ---
const shaderContext = require.context('../shaders', false, /\.(vert|frag)$/);
const getShader = (name) => {
    const module = shaderContext(`./${name}`);
    return module.default || module;
};

// 2. ベイク済みテクスチャをまとめて読み込む
const bakedTextures = require.context('../../public/textures/baked', false, /\.png$/);

// --- マテリアルの作成 ---
const material = new THREE.ShaderMaterial({
    vertexShader: getShader('ocean.vert'),
    fragmentShader: getShader('ocean.frag'),
    uniforms: {
        uHeightMapA: { value: null },
        uHeightMapB: { value: null },
        uNormalMapA: { value: null },
        uNormalMapB: { value: null },
        uFoamMapA: { value: null },
        uFoamMapB: { value: null },
        uLerp: { value: 0.0 },
        uHeightScale: { value: 3.5 },
        uEnvMap: { value: null },
        uWorldPos: { value: new THREE.Vector3() },
        fogColor: { value: new THREE.Color(0x001e32) },
        fogNear: { value: 10.0 },
        fogFar: { value: 100.0 }
    },
    transparent: true,
    side: THREE.DoubleSide
});

export function initOcean() {
    const container = document.getElementById('ocean-bg-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(29, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, -40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    const cubeLoader = new THREE.CubeTextureLoader();
    const envMap = cubeLoader
        .setPath('/textures/cube/sunset-sky/')
        .load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'],
            (texture) => {
                scene.background = texture;
                // マテリアルのuniformに環境マップを明示的にセット
                material.uniforms.uEnvMap.value = texture;
                console.log("Environment map loaded successfully.");
            },
            undefined,
            (err) => {
                console.error("Environment map loaded failed.", err);
            }
        );


    material.uniforms.uEnvMap.value = envMap;
    const totalFrames = 60;
    const heightTextures = [], normalTextures = [], foamTextures = [];

    // --- テクスチャ読み込みループ ---
    for (let i = 1; i <= totalFrames; i++) {
        const h = textureLoader.load(`./textures/baked/height_${i}.png`);
        const n = textureLoader.load(`./textures/baked/normal_${i}.png`);
        const f = textureLoader.load(`./textures/baked/foam_${i}.png`);
        heightTextures.push(h);
        normalTextures.push(n);
        foamTextures.push(f);
    }

    const geometry = new THREE.PlaneGeometry(120, 120, 512, 512);
    const ocean = new THREE.Mesh(geometry, material);
    ocean.rotateX(-Math.PI / 2);
    scene.add(ocean);

    const frameDuration = 100;

    function animate(time) {
        requestAnimationFrame(animate);
        const continuousIndex = (time / frameDuration) % totalFrames;
        const indexA = Math.floor(continuousIndex);
        const indexB = (indexA + 1) % totalFrames;
        const lerp = continuousIndex - indexA;

        material.uniforms.uHeightMapA.value = heightTextures[indexA];
        material.uniforms.uHeightMapB.value = heightTextures[indexB];
        material.uniforms.uNormalMapA.value = normalTextures[indexA];
        material.uniforms.uNormalMapB.value = normalTextures[indexB];
        material.uniforms.uFoamMapA.value = foamTextures[indexA];
        material.uniforms.uFoamMapB.value = foamTextures[indexB];
        material.uniforms.uLerp.value = lerp;

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}