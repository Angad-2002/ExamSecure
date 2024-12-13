// AdminPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import ConnectWallet from './ConnectWallet';
import cABI from './contracts/AttendanceSystem.json';
import { ConnectionCloseError } from 'web3';

const contractAddress = cABI.networks[5777].address;
const contractABI = cABI.abi;

function AdminPage({ onBack }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [classroomName, setClassroomName] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const loadClassrooms = useCallback(async () => {
    if (contract) {
      try {
        const count = await contract.classroomCount();
        const loadedClassrooms = [];
        for (let i = 0; i < count; i++) {
          const classroom = await contract.getClassroom(i);
          loadedClassrooms.push({ id: i, name: classroom[0], students: classroom[1] });
        }
        setClassrooms(loadedClassrooms);
      } catch (error) {
        console.error('Error loading classrooms:', error);
      }
    }
  }, [contract]);

  useEffect(() => {
    const setupContract = async () => {
      if (walletAddress) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        await loadClassrooms();
      }
    };
    setupContract();
  }, [walletAddress, loadClassrooms]);

  const handleWalletConnection = (address) => {
    setWalletAddress(address);
  };

  const handleCreateClassroom = async () => {
    setIsLoading(true);
    try {
      if (contract) {
        const isDuplicate = classrooms.some((classroom) => classroom.name === classroomName);
        if (isDuplicate) {
          alert('Classroom with this name already exists!');
          setIsLoading(false);
          return;
        }

        const tx = await contract.createClassroom(classroomName);
        await tx.wait();
        alert('Classroom created successfully!');
        setClassroomName('');
        loadClassrooms();
      }
    } catch (error) {
      console.error('Error creating classroom:', error);
      alert(`Failed to create classroom: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudentToClassroom = async () => {
    try {
      if (contract && selectedClassroom) {
        const classroom = classrooms.find((c) => c.id === parseInt(selectedClassroom));

        const isDuplicateStudent = classroom.students.some((student) => student.regNo === studentRegNo);
        if (isDuplicateStudent) {
          alert('Student with this registration number already exists in the classroom!');
          return;
        }

        const tx = await contract.addStudentToClass(parseInt(selectedClassroom), studentName, studentRegNo);
        await tx.wait();
        alert('Student added successfully!');
        setStudentName('');
        setStudentRegNo('');
        loadClassrooms();
      } else {
        alert('Please select a classroom.');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert(`Failed to add student: ${error.message}`);
    }
  };

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error('Error accessing webcam: ', err);
      });
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    console.log (studentName);
    canvas.toBlob((blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("image", blob, "captured_face.jpg"); // Append the image as a file
        formData.append("name", studentName);
        formData.append("reg_no", studentRegNo);

        fetch("http://localhost:5000/save-face", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error saving face data:", error));
      }
    }, "image/jpeg"); // Specify JPEG format
  };

  return (
    <div className="AdminPage">
      <button className="back-button" onClick={onBack}>Back</button>
      <h1>Admin Dashboard</h1>
      <ConnectWallet onConnect={handleWalletConnection} />
      {walletAddress && (
        <div className="content">
          {/* Create Classroom */}
          <div className="input-group">
            <h2>Create Classroom</h2>
            <input
              type="text"
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              placeholder="Classroom Name"
            />
            <button className="button" onClick={handleCreateClassroom} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>

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
              <p>No classrooms available. Please create one.</p>
            )}
          </div>

          {/* Add Student */}
          {selectedClassroom && (
            <div className="input-group">
              <h2>Add Student to Classroom</h2>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Student Name"
              />
              <input
                type="text"
                value={studentRegNo}
                onChange={(e) => setStudentRegNo(e.target.value)}
                placeholder="Registration Number"
              />
              <button className="button" onClick={handleAddStudentToClassroom}>
                Add Student
              </button>
            </div>
          )}

          {/* Camera Functionality */}
          <div className="camera">
            <h2>Capture Photo</h2>
            <video ref={videoRef} autoPlay className="video-stream"></video>
            <button className="button" onClick={startCamera}>Start Camera</button>
            <button className="button" onClick={capturePhoto}>Capture Photo</button>
          </div>

          {photoCaptured && (
            <div className="photo-preview">
              <h2>Captured Photo:</h2>
              <img src={photoCaptured} alt="Captured" />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
