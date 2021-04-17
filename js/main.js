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

// check when the browser size has changed and adjust the camera accordingly
window.addEventListener('resize', () => {
    let WIDTH = window.innerWidth;
    let HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    visibleDim = VisibleDim(camera.position.y);
});

// let geometry = new THREE.BoxGeometry(1000, 1000, 1000);
// let boxMaterials =
//     [
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/front.png'), side: THREE.DoubleSide }), // Right side
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/back.png'), side: THREE.DoubleSide }), // Left side
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/up.png'), side: THREE.DoubleSide }), // Top side
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/down.png'), side: THREE.DoubleSide }), // Bottom side
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/right.png'), side: THREE.DoubleSide }), // Front side
//         new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('./../img/left.png'), side: THREE.DoubleSide }) // Back side
//     ];
// // Create a MeshFaceMaterial, which allows the cube to have different materials on each face
// let boxMaterial = new THREE.MeshFaceMaterial(boxMaterials);
// let box = new THREE.Mesh(geometry, boxMaterial);
// scene.add(box);

controls = new THREE.OrbitControls(camera, renderer.domElement);

let frameSpeed = 0.001, frameZ = 0;
let stars = new Set();
let enemies = new Set();

let generateRandomFloat = (min, max, p = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(p));
};

let generateStars = (posZ, num = 5) => {
    for (let i = 0; i < num; i++) {
        Star.LoadModel(scene, stars, new THREE.Vector3(generateRandomFloat(-visibleDim[0], visibleDim[0]), 0, posZ + generateRandomFloat(-visibleDim[1], visibleDim[1])));
    }
};

let generateEnemies = (posZ, num = 2) => {
    for (let i = 0; i < num; i++) {
        Enemy.LoadModel(scene, enemies, new THREE.Vector3(generateRandomFloat(-visibleDim[0], visibleDim[0]), 0, posZ + generateRandomFloat(-visibleDim[1], visibleDim[1])));
    }
};

let generateFrame = (posZ, sNum, eNum) => {
    generateStars(posZ, sNum);
    generateEnemies(posZ, eNum);
};

generateFrame(0, 5, 0);
generateFrame(-2 * visibleDim[1], 5, 2);
let plane = new Plane(scene);

let prevTime = new Date().getTime();
let dt = 0;

// keydown event listener
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case "ArrowUp": plane.Up(dt, camera); break;
        case "ArrowDown": plane.Down(dt, camera); break;
        case "ArrowLeft": plane.Left(dt, camera); break;
        case "ArrowRight": plane.Right(dt, camera); break;
        case "r":
        case "R": plane.Front(dt, camera); break;
        case "f":
        case "F": plane.Back(dt, camera); break;
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

let startTime = new Date().getTime(), maxTime = 100;
let gameState = "GAME_ACTIVE";

let TimeLeft = (delta = 700) => {
    let curTime = new Date().getTime();
    let timeLeft = Math.max(maxTime - Math.floor((curTime - startTime) / delta), 0);
    if (timeLeft == 0) gameState = "GAME_OVER";
    return timeLeft;
};

let TextBox = (textLine, pos, size = [100, 20], color = "blue", fontSize = 20) => {
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
    console.log(text.style.fontSize);
    text.style.fontSize = fontSize + 'px';
    document.body.appendChild(text);
    return text;
};

let texts = new Map();
texts["time"] = TextBox("Time: " + TimeLeft(), [0, 0]);
texts["health"] = TextBox("Health: " + plane.GetHealth(), [0, 24]);
texts["score"] = TextBox("Score: " + + plane.GetScore(), [0, 48]);

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
};

let MoveFrame = () => {
    let moveZ = dt * frameSpeed;
    frameZ += moveZ;
    if (frameZ >= 2 * visibleDim[1]) {
        frameZ = 0;
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

        // check collision
        plane.CheckCollisionWithEnemies(enemies, scene);
        plane.CheckCollisionWithStars(stars, scene);
        Enemy.CheckCollisionWithMissiles(enemies, plane.missiles, scene, plane);
        if (plane.GetHealth() <= 0) {
            gameState = "GAME_LOST";
        }

        texts["time"].innerHTML = "Time: " + TimeLeft();
        texts["health"].innerHTML = "Health: " + plane.GetHealth();
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
