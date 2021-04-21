class Missile {

    static speed = 0.003;

    static Move(missile, dt) {
        missile.position.x += dt * Missile.speed * missile.userData.lookAt.x;
        missile.position.y += dt * Missile.speed * missile.userData.lookAt.y;
        missile.position.z += dt * Missile.speed * missile.userData.lookAt.z;
    }

    static LoadModel(scene, missiles, pos, lookAt, rotY, scale = new THREE.Vector3(0.02, 0.02, 0.02)) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            "./../models/missile.glb",
            // called when the resource is loaded
            (gltf) => {
                gltf.scene.position.set(pos.x, pos.y, pos.z);
                gltf.scene.rotation.y = Math.PI + rotY;
                gltf.scene.scale.set(scale.x, scale.y, scale.z);
                gltf.scene.userData = { "lookAt": lookAt };
                scene.add(gltf.scene);
                missiles.add(gltf.scene);
            },
            // called while loading is progressing
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% Missile loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading missile');
            }
        );
    }
}