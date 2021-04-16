class Enemy {

    constructor(scene, pos) {
        this.obj = null;
        this.speed = 0.001;
        this.LoadModel(scene, pos);

        // yaw, pitch, roll
        this.roll = new THREE.Vector3(0, 0, -1).normalize();
        this.yaw = new THREE.Vector3(0, 1, 0).normalize();
    }

    IsLoaded() {
        return this.obj != null;
    }

    GetPos() {
        if (!this.IsLoaded()) return null;
        return this.obj.position;
    }

    Yaw(lookAt) {
        if (!this.IsLoaded()) return;
        let angle = lookAt.angleTo(this.roll);
        let cross = new THREE.Vector3().crossVectors(this.roll, lookAt);
        if (cross.y < 0) angle = -angle;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(this.yaw, angle);
        this.roll.applyQuaternion(q).normalize();
        this.obj.rotateOnAxis(this.yaw, angle);
    }

    Move(val, pos) {
        if (!this.IsLoaded() || pos == null) return;
        let lookAt = new THREE.Vector3().subVectors(pos, this.obj.position).normalize();
        this.Yaw(lookAt);
        this.obj.position.x += val * this.speed * lookAt.x;
        this.obj.position.y += val * this.speed * lookAt.y;
        this.obj.position.z += val * this.speed * lookAt.z;
        return;
    }

    CheckCollisionWithMissiles(missiles, scene) {
        if (!this.IsLoaded() || !missiles.size) return false;
        let toRemove = false;
        let ebox = new THREE.Box3().setFromObject(this.obj);
        for (let missile of missiles) {
            if (!missile.IsLoaded()) continue;
            let mbox = new THREE.Box3().setFromObject(missile.obj);
            if (ebox.intersectsBox(mbox)) {
                missile.RemoveModel(scene);
                missiles.delete(missile);
                toRemove = true;
            }
        }
        if (toRemove) return this.RemoveModel(scene);
        return false;
    }

    LoadModel(scene, pos) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            "./../models/plane.glb",
            // called when the resource is loaded
            (gltf) => {
                let light = new THREE.DirectionalLight(0xFFFFFF, 10);

                let group = new THREE.Object3D();
                group.add(gltf.scene);
                group.add(light);
                group.position.set(pos.x, pos.y, pos.z);
                group.rotation.y = Math.PI;
                group.scale.set(0.01, 0.01, 0.01);

                scene.add(group);
                this.obj = group;
            },
            // called while loading is progressing
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% Enemy Plane loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading enemy plane');
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