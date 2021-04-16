class Missile {

    constructor(scene, pos, lookAt, rotY) {
        this.obj = null;
        this.speed = 0.003;
        this.lookAt = lookAt;
        this.LoadModel(scene, pos, rotY);
    }

    IsLoaded() {
        return this.obj != null;
    }

    GetPos() {
        if (!this.IsLoaded()) return null;
        return this.obj.position;
    }

    Move(val) {
        if (!this.IsLoaded()) return;
        this.obj.position.x += val * this.speed * this.lookAt.x;
        this.obj.position.y += val * this.speed * this.lookAt.y;
        this.obj.position.z += val * this.speed * this.lookAt.z;
    }

    LoadModel(scene, pos, rotY) {
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
                scene.add(group);
                this.obj = group;
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

    RemoveModel(scene) {
        if (!this.IsLoaded()) return false;
        scene.remove(this.obj);
        this.obj = null;
        return true;
    }
}