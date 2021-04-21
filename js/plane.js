class Plane {

    constructor(scene, speed = 0.01, rollSpeed = 0.01) {
        this.obj = null;
        this.speed = speed;
        this.health = 100;
        this.score = 0;
        this.missiles = new Set();
        this.LoadModel(scene, new THREE.Vector3(0, 0, 0));

        // yaw, pitch, roll
        this.rollSpeed = rollSpeed;
        this.rotationY = 0;
        this.roll = new THREE.Vector3(0, 0, -1).normalize();
        this.pitch = new THREE.Vector3(-1, 0, 0).normalize();
        this.yaw = new THREE.Vector3(0, 1, 0).normalize();
    }

    IsLoaded() {
        return this.obj != null;
    }

    GetHealth() {
        return this.health;
    }

    GetScore() {
        return this.score;
    }

    UpdateHealth(val = -5) {
        this.health = Math.max(0, this.health + val);
    }

    UpdateScore(val = 2) {
        this.score += val;
    }

    GetPos() {
        if (!this.IsLoaded()) return null;
        return this.obj.position;
    }

    LaunchMissile(scene) {
        if (!this.IsLoaded()) return;
        Missile.LoadModel(scene, this.missiles, this.obj.position, this.roll.clone(), this.rotationY);
    }

    Roll(dt) {
        if (!this.IsLoaded()) return;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(this.roll, dt * this.rollSpeed);
        this.pitch.applyQuaternion(q).normalize();
        this.yaw.applyQuaternion(q).normalize();
        this.obj.rotateOnAxis(this.roll, dt * this.rollSpeed);
    }

    Pitch(dt) {
        if (!this.IsLoaded()) return;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(this.pitch, dt * this.rollSpeed);
        this.roll.applyQuaternion(q).normalize();
        this.yaw.applyQuaternion(q).normalize();
        this.obj.rotateOnAxis(this.pitch, dt * this.rollSpeed);
    }

    Yaw(dt) {
        if (!this.IsLoaded()) return;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(this.yaw, dt * this.rollSpeed);
        this.rotationY += dt * this.rollSpeed;
        this.roll.applyQuaternion(q).normalize();
        this.pitch.applyQuaternion(q).normalize();
        this.obj.rotateOnAxis(this.yaw, dt * this.rollSpeed);
    }

    Front(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.y -= dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.y += dt * this.speed;
        }
    }

    Back(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.y += dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.y -= dt * this.speed;
        }
    }

    Up(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.z -= dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.z += dt * this.speed;
        }
    }

    Down(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.z += dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.z -= dt * this.speed;
        }
    }

    Left(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.x -= dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.x += dt * this.speed;
        }
    }

    Right(dt, frustum) {
        if (!this.IsLoaded()) return;
        this.obj.position.x += dt * this.speed;
        if (!this.InsideFrustum(frustum)) {
            this.obj.position.x -= dt * this.speed;
        }
    }

    MoveMissiles(dt) {
        for (let missile of this.missiles) {
            Missile.Move(missile, dt);
        }
    }

    CheckCollision(scene, stars, missiles, enemies, eh = -10, mh = -5, ss = 5) {
        if (!this.IsLoaded()) return;
        let pbox = new THREE.Box3().setFromObject(this.obj);

        for (let enemy of enemies) {
            let ebox = new THREE.Box3().setFromObject(enemy);
            if (pbox.intersectsBox(ebox)) {
                enemies.delete(enemy);
                scene.remove(enemy);
                this.UpdateHealth(eh);
            }
        }

        for (let star of stars) {
            let sbox = new THREE.Box3().setFromObject(star);
            if (pbox.intersectsBox(sbox)) {
                stars.delete(star);
                scene.remove(star);
                this.UpdateScore(ss);
            }
        }

        for (let missile of missiles) {
            let mbox = new THREE.Box3().setFromObject(missile);
            if (pbox.intersectsBox(mbox)) {
                scene.remove(missile);
                missiles.delete(missile);
                this.UpdateHealth(mh);
            }
        }
    }

    InsideFrustum(frustum) {
        // return frustum.intersectsObject(this.obj)
        // let box = new THREE.Box3().setFromObject(this.obj);
        // return frustum.intersectsBox(box);
        return frustum.containsPoint(this.obj.position);
    }

    LoadModel(scene, pos, scale = new THREE.Vector3(0.02, 0.02, 0.02)) {
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
                group.scale.set(scale.x, scale.y, scale.z);
                scene.add(group);
                this.obj = group;
            },
            // called while loading is progressing
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% Plane loaded');
            },
            // called when loading has errors
            (error) => {
                console.log('An error happened while loading plane');
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