class Text {

    static LoadModel(scene, pos, textLine) {
        // Instantiate a loader
        const loader = new THREE.FontLoader();

        loader.load(
            "./../fonts/helvetiker_regular.typeface.json",
            (font) => {
                const textGeometry = new THREE.TextGeometry(textLine, {
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

                let textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                let text = new THREE.Mesh(textGeometry, textMaterial);
                text.position.set(pos.x, pos.y, pos.z);
                text.scale.set(0.2, 0.2, 0.2);
                scene.add(text);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% Text loaded');
            },
            (error) => {
                console.log('An error happened in Text Loader');
            }
        );
    }
}

