class Enemy {

    static speed = 0.001;
    // yaw
    static yaw = new THREE.Vector3(0, 1, 0).normalize();

    static Yaw(enemy, lookAt) {
        lookAt.y = 0;
        lookAt.normalize();
        let angle = lookAt.angleTo(enemy.userData.roll);
        let cross = new THREE.Vector3().crossVectors(enemy.userData.roll, lookAt);
        if (cross.y < 0) angle = -angle;
        const q = new THREE.Quaternion();
        q.setFromAxisAngle(Enemy.yaw, angle);
        enemy.userData.roll.applyQuaternion(q).normalize();
        enemy.rotateOnAxis(Enemy.yaw, angle);
    }

    static Move(dt, pos, enemy) {
        if (pos == null) return;
        let lookAt = new THREE.Vector3().subVectors(pos, enemy.position).normalize();
        enemy.position.x += dt * Enemy.speed * lookAt.x;
        enemy.position.y += dt * Enemy.speed * lookAt.y;
        enemy.position.z += dt * Enemy.speed * lookAt.z;
        Enemy.Yaw(enemy, lookAt);
        return;
    }

    // move enemies
    static MoveEnemies(frameSpeed, startZ, dt, pos, enemies) {
        for (let enemy of enemies) {
            if (enemy.position.z < startZ) {
                enemy.position.z += frameSpeed;
            }
            else {
                Enemy.Move(dt, pos, enemy);
            }
        }
    }

    static CheckCollisionWithMissiles(enemies, missiles, scene, plane) {
        for (let enemy of enemies) {
            let toRemove = false;
            let ebox = new THREE.Box3().setFromObject(enemy);
            for (let missile of missiles) {
                let mbox = new THREE.Box3().setFromObject(missile);
                if (ebox.intersectsBox(mbox)) {
                    scene.remove(missile);
                    missiles.delete(missile);
                    toRemove = true;
                }
            }
            if (toRemove) {
                enemies.delete(enemy);
                scene.remove(enemy);
                plane.UpdateScore(5);
            }
        }
    }

    static LoadModel(scene, enemies, pos) {
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
                group.userData = { "roll": new THREE.Vector3(0, 0, -1).normalize() };
                scene.add(group);
                enemies.add(group);
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
}