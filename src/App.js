import logo from './logo.svg';
import './App.css';
import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";



function App() {

    const [faceShape, setFaceShape] = useState("No face detected");
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const connect = window.drawConnectors;
    var camera = null;

    function calculateDistance(landmark1, landmark2) {
      const x1 = landmark1['x']; // X-coordinate of landmark1
      const y1 = landmark1['y']; // Y-coordinate of landmark1
      const x2 = landmark2['x']; // X-coordinate of landmark2
      const y2 = landmark2['y']; // Y-coordinate of landmark2
      
      // Calculate Euclidean distance
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      return distance;
    }

    function onResults(results) {
        // const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;

        // Set canvas width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        if (results.multiFaceLandmarks) {
          
          const landmarksFaceShape = results.multiFaceLandmarks[0];
          
          if(results?.multiFaceLandmarks[0]){
            const cheekboneDistance = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[16]);
            const faceWidth = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[9]); 
            const faceLength = calculateDistance(landmarksFaceShape[27], landmarksFaceShape[8]);
        
            const jawlineDistance = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[16]);
            const cheekboneDistance2 = calculateDistance(landmarksFaceShape[2], landmarksFaceShape[13]);
  

            const foreheadWidth = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[16]); 
            const jawlineWidth = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[8]); 
            const chinToJawlineDistance = calculateDistance(landmarksFaceShape[9], landmarksFaceShape[8]); 

            const jawlineWidth2 = calculateDistance(landmarksFaceShape[0], landmarksFaceShape[16]);
            const foreheadWidth2 = calculateDistance(landmarksFaceShape[21], landmarksFaceShape[22]);


            if (cheekboneDistance > faceWidth && faceLength > faceWidth) {
              setFaceShape("Diamond");
            }
            else if (jawlineDistance > faceWidth && jawlineDistance > faceLength) {
              setFaceShape("Square");
            }
            else if (jawlineDistance < faceWidth && jawlineDistance < faceLength && cheekboneDistance2 > 1.2 * faceWidth) {
              setFaceShape("Oval");
            }
            else if (foreheadWidth > jawlineWidth && chinToJawlineDistance < 0.7 * jawlineWidth) {
              setFaceShape("Heart");
            }
            else if (jawlineDistance < 1.2 * faceWidth && faceWidth > 0.8 * faceLength && cheekboneDistance < 0.5 * faceWidth) {
              setFaceShape("Round");
            }
            else if (jawlineWidth2 > 1.2 * foreheadWidth2 && chinToJawlineDistance > 1.2 * foreheadWidth2) {
              setFaceShape("Triangle");
            }
            else{
              setFaceShape("Can not detect");
            }
          }
            
          for (const landmarks of results.multiFaceLandmarks) {
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_TESSELATION, {
              color: "#eae8fd",
              lineWidth: 1,
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYE, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_RIGHT_EYEBROW, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYE, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LEFT_EYEBROW, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_FACE_OVAL, {
              color: "#7367f0",
            });
            connect(canvasCtx, landmarks, Facemesh.FACEMESH_LIPS, {
              color: "#7367f0",
            });
          }
        }
        else {
          setFaceShape("No face detected");
        }
        canvasCtx.restore();
      }
      // }

      // setInterval(())
      // setInterval(() => {
      
      // }, 1000 * 5)
      useEffect(() => {
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResults);

        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null
        ) {
          camera = new cam.Camera(webcamRef.current.video, {
            onFrame: async () => {
              await faceMesh.send({ image: webcamRef.current.video });
            },
            width: 640,
            height: 480,
          });
          camera.start();
        }
      }, []);

  return (
    <div className="App">
      <header className="App-header">
            <center>
      <div className="App">
        <Webcam
          ref={webcamRef}
          style={{
            textAlign: "center",
            zindex: 9,
            width: '300px',
            height: 'auto',
            display:'none'
          }}
        />{" "}
        <canvas
          ref={canvasRef}
          className="output_canvas"
          style={{
            zindex: 9,
            width: '300px',
            height: 'auto',
          }}
        ></canvas>
      </div>
    </center>
        <p>
          My faceshape  <code className="App-link">{faceShape}</code>.
        </p>

      </header>
    </div>
  );
}

export default App;
