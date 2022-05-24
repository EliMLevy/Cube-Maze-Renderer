import * as THREE from './three/build/three.module.js'
import shapes from './SimpleShapes.js'
import { OBJExporter } from './three/examples/jsm/exporters/OBJExporter.js'

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

scene.background = new THREE.Color("cyan");

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 2000, 100);
scene.add(directionalLight);

const aspectRatio = window.innerWidth / window.innerHeight;
const cameraWidth = 150;
const cameraHeight = cameraWidth / aspectRatio;

const camera = new THREE.PerspectiveCamera(45, aspectRatio, 1, 20000);
scene.add(camera);



camera.position.set(1000, 1000, 1000);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);


let length = 10;

const cellWidth = 50;
const wallHeight = 50;

let base = shapes.getCube(cellWidth * length, cellWidth * length, cellWidth * length, "rgb(255,255,255)");
scene.add(base);

renderer.render(scene, camera);

document.addEventListener("keypress", (e) => {
    console.log(e.key);
    if (e.key == " ") {
        // Instantiate an exporter
        const exporter = new OBJExporter();

        // Parse the input and generate the OBJ output
        const data = exporter.parse( scene );
        saveString( data, 'objfileoutput.obj' );
    }
})

function saveString(text, filename) {

    save(new Blob([text], { type: 'text/plain' }), filename);

}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}



let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.x;
    mouseY = e.y;
})



var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");


var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
};

fetch("http://localhost:8000/", requestOptions)
    .then(response => {
        // console.log(response.json());
        return response.json()
    })
    .then(result => {
        console.log(result)
        generateMaze(result);
    })
    .catch(error => console.log('error', error));

function generateMaze(maze) {
    for (let face = 0; face < 6; face++) {
        // Make a group for this face
        const group = new THREE.Group();
        group.position.x = 0;
        group.position.y = 0;
        group.position.z = 0;
        for (let i = 0; i < maze[face].length; i++) {
            let edge = maze[face][i];
            let pt1 = edge[0];
            let pt2 = edge[1];

            // Add walls to the group as if this face was centered at 0,0,0
            let wall;
            if (pt1.row < pt2.row) { // wall parralel to x axis
                let depth = 1;
                let offsetZ = 0;
                if (pt1.row == -1) {
                    depth = cellWidth;
                    offsetZ = -cellWidth / 2;
                }
                if (pt2.row == length) {
                    depth = cellWidth;
                    offsetZ = cellWidth / 2;
                }
                wall = shapes.getCube(cellWidth, wallHeight, depth, "rgb(0,255,0)");
                wall.position.x = pt1.col * cellWidth + cellWidth / 2 - (length / 2 * cellWidth);
                wall.position.y = wallHeight / 2;
                wall.position.z = (pt1.row + 1) * cellWidth - (length / 2 * cellWidth) + offsetZ;
            } else { // Wall parrallel to z axis
                let width = 1;
                let offsetX = 0;
                if (pt1.col == -1) {
                    width = cellWidth;
                    offsetX = -cellWidth / 2;
                }
                if (pt2.col == length) {
                    width = cellWidth;
                    offsetX = cellWidth / 2;
                }
                wall = shapes.getCube(width, wallHeight, cellWidth, "rgb(0,255,0)");
                wall.position.x = pt2.col * cellWidth - (length / 2 * cellWidth) + offsetX;
                wall.position.y = wallHeight / 2;
                wall.position.z = (pt1.row) * cellWidth + cellWidth / 2 - (length / 2 * cellWidth);

            }
            group.add(wall);
        }
        // Rotate/translate the whole group into place
        // group.position.y = cellWidth * length / 2;
        if (face == 0) {
            // group.rotation.x = -Math.PI / 2;
            // group.rotation.y = Math.PI;
            group.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
            group.position.z = -cellWidth * length / 2;
        } else if (face == 1) {
            group.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
            group.position.x = cellWidth * -length / 2;
        } else if (face == 2) {
            group.position.y = cellWidth * length / 2;
        } else if (face == 3) {
            group.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
            group.position.x = cellWidth * length / 2;
        } else if (face == 4) {
            group.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            group.position.z = cellWidth * length / 2;

        } else if (face == 5) {
            group.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI);

            group.position.y = -cellWidth * length / 2;
        }
        scene.add(group)
    }

}




let zoom = 1000;

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera)

    camera.position.set(zoom * Math.cos(mouseX / 100), zoom * Math.cos(mouseY / 100), zoom * Math.sin(mouseX / 100));
    // camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

}

animate();
