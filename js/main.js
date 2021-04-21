let scene = new THREE.Scene();
// scene.background = new THREE.Color(0xFFFFFF);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 7;
camera.lookAt(0, 0, 0);

// returns visible dimensions at a distance dist from camera
let VisibleDim = (dist) => {
    let vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
    let height = 2 * Math.tan(vFOV / 2) * dist; // visible height
    let width = height * camera.aspect;  // visible width
    return [width / 2, height / 2];
};

let visibleDim = VisibleDim(camera.position.y);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let bgDepth = 500;
let bgDim = VisibleDim(bgDepth + camera.position.y);

let BackGroundScene = (pos, img = 'down', rot = 0) => {
    const geometry = new THREE.PlaneGeometry(2 * bgDim[0], 2 * bgDim[1]);
    const material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/skybox_' + img + '.png'), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.rotation.x = Math.PI / 2 + rot;
    scene.add(mesh);
    return mesh;
};

let bgScenes = [BackGroundScene(new THREE.Vector3(0, -bgDepth, 0), 'down'), BackGroundScene(new THREE.Vector3(0, -bgDepth, -2 * bgDim[1]), 'down', Math.PI)];

let CreateFrustum = () => {
    let frustum = new THREE.Frustum();
    let cameraViewProjectionMatrix = new THREE.Matrix4();

    // every time the camera or objects change position (or every frame)
    // camera.updateMatrix();
    camera.updateMatrixWorld(); // make sure the camera matrix is updated
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    // frustum is now ready to check all the objects you need
    return frustum;
};

let frustum = CreateFrustum();

// check when the browser size has changed and adjust the camera accordingly
window.addEventListener('resize', () => {
    let WIDTH = window.innerWidth;
    let HEIGHT = window.innerHeight;

    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();

    visibleDim = VisibleDim(camera.position.y);
    let newBgdim = VisibleDim(bgDepth + camera.position.y);
    for (let bgScene of bgScenes) {
        bgScene.scale.x *= newBgdim[0] / bgDim[0];
        bgScene.scale.z *= newBgdim[1] / bgDim[1];
    }
    bgDim = newBgdim;

    frustum = CreateFrustum();
});

controls = new THREE.OrbitControls(camera, renderer.domElement);

let frameSpeed = 0.001, frameZ = 0, frameCnt = 0;
let stars = new Set();
let enemies = new Set();

let generateRandomFloat = (min, max, p = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(p));
};

let generateStars = (posZ, num = 10) => {
    for (let i = 0; i < num; i++) {
        Star.LoadModel(scene, stars, new THREE.Vector3(generateRandomFloat(-visibleDim[0], visibleDim[0]), 0, posZ + generateRandomFloat(-visibleDim[1], visibleDim[1])));
    }
};

let generateEnemies = (posZ, num = 2, maxEnemies = 3) => {
    num = Math.min(num, maxEnemies - enemies.size);
    for (let i = 0; i < num; i++) {
        Enemy.LoadModel(scene, enemies, new THREE.Vector3(generateRandomFloat(-visibleDim[0], visibleDim[0]), 0, posZ + generateRandomFloat(-visibleDim[1], visibleDim[1])));
    }
};

let generateFrame = (posZ, sNum, eNum) => {
    generateStars(posZ, sNum);
    generateEnemies(posZ, eNum);
};

frameCnt = 2;
generateFrame(0, 10, 0);
generateFrame(-2 * visibleDim[1]);

let plane = new Plane(scene);

let bossEnemyFrame = 4;
let bossEnemy = new BossEnemy(-visibleDim[1] + 0.6);

let startTime = new Date().getTime(), maxTime = 100;
let gameState = "GAME_ACTIVE";

let TimeLeft = (delta = 700) => {
    let curTime = new Date().getTime();
    let timeLeft = Math.max(maxTime - Math.floor((curTime - startTime) / delta), 0);
    if (timeLeft == 0) gameState = "GAME_OVER";
    return timeLeft;
};

let TextBox = (textLine, pos, size = [200, 20], color = "blue", fontSize = 20) => {
    let text = document.createElement('div');
    text.style.position = 'absolute';
    //text.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
    text.style.width = size[0];
    text.style.height = size[1];
    // text.style.backgroundColor = "blue";
    text.style.color = color;
    text.innerHTML = textLine;
    text.style.left = pos[0] + 'px';
    text.style.top = pos[1] + 'px';
    text.style.fontSize = fontSize + 'px';
    document.body.appendChild(text);
    return text;
};

let texts = new Map();
texts["time"] = TextBox("Time: " + TimeLeft(), [0, 0]);
texts["health"] = TextBox("Health: " + plane.GetHealth(), [0, 24]);
texts["eHealth"] = TextBox("Enemy Health: " + + bossEnemy.GetHealth(), [0, 48]);
texts["score"] = TextBox("Score: " + plane.GetScore(), [0, 72]);

let prevTime = new Date().getTime();
let dt = 0;

// keydown event listener
window.addEventListener('keydown', (event) => {
    if (gameState != "GAME_ACTIVE") return;
    switch (event.key) {
        case "ArrowUp": plane.Up(dt, frustum); break;
        case "ArrowDown": plane.Down(dt, frustum); break;
        case "ArrowLeft": plane.Left(dt, frustum); break;
        case "ArrowRight": plane.Right(dt, frustum); break;
        case "r":
        case "R": plane.Front(dt, frustum); break;
        case "f":
        case "F": plane.Back(dt, frustum); break;
        // case "a":
        // case "A": plane.Roll(dt); break;
        // case "d":
        // case "D": plane.Roll(-dt); break;
        // case "w":
        // case "W": plane.Pitch(-dt); break;
        // case "s":
        // case "S": plane.Pitch(dt); break;
        case "q":
        case "Q": plane.Yaw(dt); break;
        case "e":
        case "E": plane.Yaw(-dt); break;
        case "p":
        case "P": plane.LaunchMissile(scene); break;
    }
});

// remove object outside frustum
let InsideFrustum = () => {
    for (let star of stars) {
        if (star.position.z > visibleDim[1]) {
            scene.remove(star);
            stars.delete(star);
        }
    }
    for (let missile of plane.missiles) {
        if (!frustum.containsPoint(missile.position)) {
            scene.remove(missile);
            plane.missiles.delete(missile);
        }
    }
    for (let missile of bossEnemy.missiles) {
        if (!frustum.containsPoint(missile.position)) {
            scene.remove(missile);
            bossEnemy.missiles.delete(missile);
        }
    }
};

let MoveFrame = () => {
    let moveZ = dt * frameSpeed;
    frameZ += moveZ;
    for (let bgScene of bgScenes) {
        bgScene.position.z += moveZ * (bgDim[0] / visibleDim[0]);
    }
    if (frameZ >= 2 * visibleDim[1]) {
        frameZ -= 2 * visibleDim[1];
        frameCnt += 1;
        if (frameCnt == bossEnemyFrame) {
            bossEnemy.LoadModel(scene, new THREE.Vector3(0, 0, -visibleDim[1] - 2 * visibleDim[1]));
        }
        bgScenes[0].position.set(0, -bgDepth, bgScenes[1].position.z - 2 * bgDim[1]);
        bgScenes.push(bgScenes.shift());
        generateFrame(-2 * visibleDim[1]);
    }
    Star.MoveStars(moveZ, stars);
    Enemy.MoveEnemies(moveZ, -2 * visibleDim[1], dt, plane.GetPos(), enemies);
};

// game logic
let update = () => {
    if (gameState == "GAME_ACTIVE") {
        let curTime = new Date().getTime();
        dt = curTime - prevTime;
        prevTime = curTime;

        // move objects
        MoveFrame();
        plane.MoveMissiles(dt);
        bossEnemy.Move(dt * frameSpeed, dt, plane.GetPos());

        bossEnemy.LaunchMissile(scene);
        bossEnemy.MoveMissiles(dt);

        // check collision
        Enemy.CheckCollisionWithMissiles(enemies, plane.missiles, scene, plane);
        plane.CheckCollision(scene, stars, bossEnemy.missiles, enemies);
        bossEnemy.CheckCollisionWithMissiles(plane.missiles, scene, plane);
        if (plane.GetHealth() <= 0) {
            gameState = "GAME_LOST";
        }
        else if (bossEnemy.GetHealth() <= 0) {
            plane.UpdateScore(100);
            gameState = "GAME_WON";
        }

        texts["time"].innerHTML = "Time: " + TimeLeft();
        texts["health"].innerHTML = "Health: " + plane.GetHealth();
        texts["eHealth"].innerHTML = "Enemy Health: " + + bossEnemy.GetHealth();
        texts["score"].innerHTML = "Score: " + + plane.GetScore();

        // remove object outside frustum
        InsideFrustum();
    }
    else if (gameState == "GAME_OVER") {
        texts["result"] = TextBox("GAME OVER", [window.innerWidth / 2 - 100, window.innerHeight / 2 - 50], [250, 30], "red", 40);
        gameState = "EXIT";
    }
    else if (gameState == "GAME_LOST") {
        texts["result"] = TextBox("GAME LOST", [window.innerWidth / 2 - 100, window.innerHeight / 2 - 50], [250, 30], "red", 40);
        gameState = "EXIT";
    }
    else if (gameState == "GAME_WON") {
        texts["result"] = TextBox("GAME WON", [window.innerWidth / 2 - 100, window.innerHeight / 2 - 50], [250, 30], "green", 40);
        gameState = "EXIT";
    }
};

// draw scene
let render = () => {
    renderer.render(scene, camera);
};

// run game loop (update, render, repeat)
let GameLoop = () => {
    requestAnimationFrame(GameLoop);

    update();
    render();
};

GameLoop();
