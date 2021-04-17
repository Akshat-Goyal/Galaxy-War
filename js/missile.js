class Missile {

    static speed = 0.003;

    static Move(missile, val) {
        missile.position.x += val * Missile.speed * missile.userData.lookAt.x;
        missile.position.y += val * Missile.speed * missile.userData.lookAt.y;
        missile.position.z += val * Missile.speed * missile.userData.lookAt.z;
    }

    static LoadModel(scene, missiles, pos, lookAt, rotY) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            "./../models/missile.glb",
            // called when the resource is loaded
            (gltf) => {
                let light = new THREE.DirectionalLight(0xFFFFFF, 10);

                let group = new THREE.Object3D();
                group.add(gltf.scene);
                group.add(light);
                group.position.set(pos.x, pos.y, pos.z);
                group.rotation.y = Math.PI + rotY;
                group.scale.set(0.05, 0.05, 0.05);
                group.userData = { "lookAt": lookAt };
                scene.add(group);
                missiles.add(group);
            },
            // called while loading is progressing
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% Missile loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading missile');
            }
        );
    }
}