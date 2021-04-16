let scene = new THREE.Scene();
// scene.background = new THREE.Color(0xFFFFFF);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// check when the browser size has changed and adjust the camera accordingly
window.addEventListener('resize', () => {
    let WIDTH = window.innerWidth;
    let HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
});

controls = new THREE.OrbitControls(camera, renderer.domElement);

let plane = new Plane(scene);
let stars = new Set([new Star(scene, new THREE.Vector3(2, 0, 0)), new Star(scene, new THREE.Vector3(5, 0, 0)), new Star(scene, new THREE.Vector3(-2, 0, 0))]);
let enemies = new Set([new Enemy(scene, new THREE.Vector3(0, 0, -5))]);

camera.position.y = 7;
camera.lookAt(0, 0, 0);

let prevTime = new Date().getTime();
let dt = 0;

// keydown event listener
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowUp":
            plane.Up(dt, camera);
            break;
        case "ArrowDown":
            plane.Down(dt, camera);
            break;
        case "ArrowLeft":
            plane.Left(dt, camera);
            break;
        case "ArrowRight":
            plane.Right(dt, camera);
            break;
        case "r":
        case "R":
            plane.Front(dt, camera);
            break;
        case "f":
        case "F":
            plane.Back(dt, camera);
            break;
        // case "a":
        // case "A":
        //     plane.Roll(dt);
        //     break;
        // case "d":
        // case "D":
        //     plane.Roll(-dt);
        //     break;
        // case "w":
        // case "W":
        //     plane.Pitch(-dt);
        //     break;
        // case "s":
        // case "S":
        //     plane.Pitch(dt);
        //     break;
        case "q":
        case "Q":
            plane.Yaw(dt);
            break;
        case "e":
        case "E":
            plane.Yaw(-dt);
            break;
        case "p":
        case "P":
            plane.LaunchMissile(scene);
            break;

    }
});

// move enemies
let MoveEnemies = () => {
    for (let enemy of enemies) {
        enemy.Move(dt, plane.GetPos());
    }
};

// check collision of enemies
let CheckEnemies = () => {
    for (let enemy of enemies) {
        if (plane.CheckCollisionWithEnemy(enemy, scene) || enemy.CheckCollisionWithMissiles(plane.missiles, scene)) {
            enemies.delete(enemy);
        }
    }
};

// remove object outside frustum
let InsideFrustum = () => {
    let frustum = new THREE.Frustum();
    let cameraViewProjectionMatrix = new THREE.Matrix4();

    // every time the camera or objects change position (or every frame)
    // camera.updateMatrix();
    camera.updateMatrixWorld(); // make sure the camera matrix is updated
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    
    // frustum is now ready to check all the objects you need
    for (let missile of plane.missiles) {
        if (!missile.IsLoaded()) continue;
        if (!frustum.containsPoint(missile.GetPos())) {
            missile.RemoveModel(scene);
            plane.missiles.delete(missile);
        }
    }
};

// game logic
let update = () => {
    let curTime = new Date().getTime();
    dt = curTime - prevTime;
    prevTime = curTime;

    // move objects
    plane.MoveMissiles(dt);
    MoveEnemies();

    // check collision
    CheckEnemies();
    plane.CheckCollisionWithStars(stars, scene);

    // remove object outside frustum
    InsideFrustum();
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

// returns visible dimensions at a distance dist from camera
let VisibleDim = (dist) => {
    let vFOV = THREE.MathUtils.degToRad(camera.fov); // convert vertical fov to radians
    let height = 2 * Math.tan(vFOV / 2) * dist; // visible height
    let width = height * camera.aspect;  // visible width
    return [height, width];
};