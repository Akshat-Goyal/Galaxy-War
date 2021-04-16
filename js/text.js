const fontLoader = new THREE.FontLoader();

fontLoader.load(
    "./../fonts/helvetiker_regular.typeface.json",
    (font) => {
        const textGeometry = new THREE.TextGeometry('Hello three.js!', {
            font: font,
            size: 0.5,
            height: 0.2,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.83,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4
        });

        var textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        var text = new THREE.Mesh(textGeometry, textMaterial);
        // text.position.set(-10, 0, 0);
        // text.scale.set(0.1, 0.1, 0.1);
        scene.add(text);

        // var textLight = new THREE.PointLight(0x00ffff, 10);
        // textLight.position.set(0, 0, 0);
        // scene.add(textLight);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% Text loaded');
    },
    (error) => {
        console.log('An error happened in Text Loader');
    }
);