class Star {

    constructor(scene, pos) {
        this.obj = null;
        this.LoadModel(scene, pos);
    }

    IsLoaded() {
        return this.obj != null;
    }

    GetPos() {
        if (!this.IsLoaded()) return null;
        return this.obj.position;
    }

    LoadModel(scene, pos) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            "./../models/star.glb",
            // called when the resource is loaded
            (gltf) => {
                let light = new THREE.DirectionalLight(0xFFFFFF, 10);

                let group = new THREE.Object3D();
                group.add(gltf.scene);
                group.add(light);
                group.position.set(pos.x, pos.y, pos.z);
                group.rotation.z = Math.PI / 2;
                group.scale.set(0.04, 0.04, 0.04);
                scene.add(group);
                this.obj = group;
            },
            // called while loading is progressing
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% Star loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading star');
            }
        );
    }

    RemoveModel(scene) {
        if (!this.IsLoaded()) return false;
        scene.remove(this.obj);
        this.obj = null;
        return true;
    }
}