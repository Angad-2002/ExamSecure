import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import ConnectWallet from './ConnectWallet';
import cABI from './contracts/AttendanceSystem.json';

const contractAddress = cABI.networks[5777].address;
const contractABI = cABI.abi;

function FacultyPage({ onBack }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [contract, setContract] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [markedStudents, setMarkedStudents] = useState([]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchMarkedAttendance = useCallback(async () => {
    if (!contract || !selectedClassroom) return;
    try {
      const [addresses, regNos] = await contract.getMarkedAttendanceStudents(selectedClassroom);
      // Map the addresses and registration numbers into a list of students
      const studentDetails = addresses.map((address, index) => ({
        address: address,
        regNo: regNos[index],
      }));
      setMarkedStudents(studentDetails);
    } catch (error) {
      console.error("Error fetching marked attendance:", error);
    }
  }, [contract, selectedClassroom]);
  

  useEffect(() => {
    const setupContract = async () => {
      if (walletAddress) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);

        // Load classrooms from contract
        const count = await contractInstance.classroomCount();
        const loadedClassrooms = [];
        for (let i = 0; i < count; i++) {
          const classroom = await contractInstance.getClassroom(i);
          loadedClassrooms.push({ id: i, name: classroom[0] });
        }
        setClassrooms(loadedClassrooms);
      }
    };
    setupContract();
  }, [walletAddress]);

  // Fetch marked attendance whenever the selected classroom changes
  useEffect(() => {
    fetchMarkedAttendance();
  }, [fetchMarkedAttendance, selectedClassroom]);

  const handleWalletConnection = (address) => {
    setWalletAddress(address);
  };

  const startStreaming = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });
  };

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (!isStreaming) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(photoData);
  };

  const sendPhotoToBackend = () => {
    if (!capturedPhoto || !selectedClassroom) return;
    
    // Find the selected classroom name
    const classroomName = classrooms.find((cls) => cls.id.toString() === selectedClassroom)?.name;
  
    // Create a canvas and draw the captured photo (already in JPEG format)
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log(classroomName);
  
    // Convert the canvas to a Blob (JPG format)
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('classroomId', classroomName); // Add classroom name
      formData.append('frame', blob, 'captured_face.jpg'); // Append the image as a file
  
      try {
        const response = await fetch('http://localhost:5000/recognize-face', {
          method: 'POST',
          body: formData, // Send FormData
          mode: 'cors', // Ensures CORS is enabled
        });
        
        const data = await response.json();
        console.log('Recognition data:', data);
  
        if (data.faces && data.faces.length > 0) {
          const name = data.faces[0], regNo = data.faces[1];
          //console.log(name);
          //console.log(regNo);
  
          // Now call getStudentAddressByRegNo to get the address
          const address = await getStudentAddressByRegNo(regNo);
          //console.log("Student Address: ", address);

          if (address) {
            // Call the markAttendance function on the contract
            try {
              const tx = await contract.markAttendance(selectedClassroom, address);
              await tx.wait();  // Wait for the transaction to be mined
              console.log("Attendance marked for student:", regNo);
            } catch (error) {
              console.error("Error marking attendance:", error);
            }
          } else {
            console.log("Student address not found in the contract");
          }
        } else {
          console.log('No students detected in this frame');
        }
      } catch (error) {
        console.error('Error in attendance marking:', error);
      }
    }, 'image/jpeg'); // Convert to JPEG format
  };
  
  const getStudentAddressByRegNo = async (regNo) => {
    if (!contract) return null;
    try {
      // Assuming you have a smart contract method that gets the student address by regNo
      const address = await contract.getStudentAddressByRegNo(regNo);
      return address;
    } catch (error) {
      console.error('Error fetching student address:', error);
      return null;
    }
  };

  return (
    <div className="FacultyPage">
      <button className="back-button" onClick={onBack}>Back</button>
      <h1>Faculty Dashboard</h1>
      <ConnectWallet onConnect={handleWalletConnection} />
      {walletAddress && (
        <div className="content">
          {/* Select Classroom */}
          <div className="input-group">
            <h2>Select Classroom</h2>
            {classrooms.length > 0 ? (
              <select
                className="select-classroom"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                <option value="">Select a classroom</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>No classrooms available. Please connect to load classrooms.</p>
            )}
          </div>

          {/* Video Stream */}
          <div className="camera">
            <h2>Real-time Attendance Stream</h2>
            <video ref={videoRef} autoPlay className="video-stream"></video>
            {!isStreaming ? (
              <button className="button" onClick={startStreaming} disabled={!selectedClassroom}>
                Start Streaming
              </button>
            ) : (
              <button className="button" onClick={stopStreaming}>
                Stop Streaming
              </button>
            )}
            {isStreaming && (
              <button className="button" onClick={capturePhoto}>
                Capture Photo
              </button>
            )}
          </div>

          {/* Captured Photo Preview */}
          {capturedPhoto && (
            <div className="photo-preview">
              <h2>Captured Photo</h2>
              <img src={capturedPhoto} alt="Captured Preview" />
              <button className="button" onClick={sendPhotoToBackend}>
                Send to Backend
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default FacultyPage;
