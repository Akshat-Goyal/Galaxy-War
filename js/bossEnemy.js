class BossEnemy {

    constructor(startZ, speed = 0.001, launchMaxCnt = 80) {
        this.obj = null;
        this.speed = speed;
        this.health = 100;
        this.startZ = startZ;
        this.launchCnt = 0;
        this.launchMaxCnt = launchMaxCnt;
        this.missiles = new Set();

        // yaw, roll
        this.rotationY = 0;
        this.roll = new THREE.Vector3(0, 0, 1).normalize();
        this.yaw = new THREE.Vector3(0, 1, 0).normalize();
    }

    IsLoaded() {
        return this.obj != null;
    }

    GetHealth() {
        return this.health;
    }

    UpdateHealth(val = -10) {
        this.health = Math.max(0, this.health + val);
    }

    GetPos() {
        if (!this.IsLoaded()) return null;
        return this.obj.position;
    }

    LaunchMissile(scene) {
        if (!this.IsLoaded() || this.obj.position.z < this.startZ) return;
        this.launchCnt += 1;
        if (this.launchCnt == this.launchMaxCnt) {
            this.launchCnt = 0;
            Missile.LoadModel(scene, this.missiles, this.obj.position, this.roll.clone(), this.rotationY);
        }
    }

    Yaw(lookAt) {
        lookAt.y = 0;
        lookAt.normalize();
        let angle = lookAt.angleTo(this.roll);
        let cross = new THREE.Vector3().crossVectors(this.roll, lookAt);
        if (cross.y < 0) angle = -angle;
        this.rotationY += angle;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(this.yaw, angle);
        this.roll.applyQuaternion(q).normalize();
        this.obj.rotateOnAxis(this.yaw, angle);
    }

    Move(frameSpeed, dt, pos) {
        if (!this.IsLoaded()) return;
        if (this.obj.position.z < this.startZ) {
            this.obj.position.z += frameSpeed;
        }
        else {
            if (pos == null) return;
            let lookAt = new THREE.Vector3().subVectors(pos, this.obj.position).normalize();
            console.log(lookAt);
            lookAt.z = 0;
            lookAt.normalize();
            this.obj.position.x += dt * this.speed * lookAt.x;
            this.obj.position.y += dt * this.speed * lookAt.y;
            lookAt = new THREE.Vector3().subVectors(pos, this.obj.position).normalize();
            this.Yaw(lookAt);
        }
    }

    MoveMissiles(dt) {
        for (let missile of this.missiles) {
            Missile.Move(missile, dt);
        }
    }

    CheckCollisionWithMissiles(missiles, scene, plane, ms = 5, mh = -5) {
        if (!this.IsLoaded()) return;
        let jbox = new THREE.Box3().setFromObject(this.obj);
        for (let missile of missiles) {
            let mbox = new THREE.Box3().setFromObject(missile);
            if (jbox.intersectsBox(mbox)) {
                scene.remove(missile);
                missiles.delete(missile);
                plane.UpdateScore(ms);
                this.UpdateHealth(mh);
            }
        }
    }

    LoadModel(scene, pos, scale = new THREE.Vector3(0.022, 0.022, 0.022)) {
        // Instantiate a loader
        const loader = new THREE.GLTFLoader();

        // Load a glTF resource
        loader.load(
            // resource URL
            "./../models/bossEnemy.glb",
            // called when the resource is loaded
            (gltf) => {
                gltf.scene.position.set(pos.x, pos.y, pos.z);
                gltf.scene.scale.set(scale.x, scale.y, scale.z);
                scene.add(gltf.scene);
                this.obj = gltf.scene;
            },
            // called while loading is progressing
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% Jet loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading jet');
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