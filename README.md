# ExamSecure: Blockchain-Integrated Smart Attendance with Facial Recognition

**ExamSecure** is a cutting-edge decentralized application (dApp) that integrates **blockchain technology** with **facial recognition** to provide a secure, automated, and efficient attendance management system. Designed to cater to educational institutions, corporates, and large-scale events, ExamSecure ensures transparency, accountability, and scalability.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Solidity Smart Contract](#solidity-smart-contract-simpleattendancesol)
3. [Practical Need for ExamSecure](#practical-need-for-examsecure)
4. [Technologies Used](#technologies-used)
5. [API Documentation](#api-documentation)
6. [Workflow](#workflow)
7. [Usage Instructions](#usage-instructions)
8. [Future Enhancements](#future-enhancements)
9. [Contributing](#contributing)
10. [License](#license)
11. [Contact](#contact)
12. [Contributors](#contributors)

---

## Key Features

1. **Blockchain Integration**  
   - Immutable and tamper-proof attendance records.  
   - Decentralized architecture ensures transparency and security.

2. **Facial Recognition Automation**  
   - Real-time and contactless attendance verification.  
   - Automated identification through advanced machine learning models.

3. **Comprehensive Classroom Management**  
   - Create, manage, and track attendance for multiple classrooms.  
   - User-friendly interfaces for administrators and faculty.

4. **Streamlined Data Management**  
   - Attendance data synchronized with blockchain for secure access.  
   - Scalable solution for hybrid or virtual environments.

5. **Administrative Tools**  
   - Dashboards for monitoring attendance patterns.  
   - Remote accessibility for hybrid working or learning models.

---

## Solidity Smart Contract: `SimpleAttendance.sol`

The smart contract forms the backbone of ExamSecure, enabling decentralized management of classrooms and attendance.

### Key Functions
- **`createClassroom(string memory _className)`**: Registers a new classroom.  
- **`addStudentToClass(uint256 _classId, string memory _name, string memory _regNo)`**: Adds student details to a classroom.  
- **`markAttendance(uint256 _classId, address _student)`**: Marks attendance for a student while preventing duplicate entries.  
- **`getMarkedAttendanceStudents(uint256 _classId)`**: Retrieves the list of students marked present for a specific session.

### Smart Contract Code
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Full Solidity code implementation goes here
```

---

## Practical Need for ExamSecure

Manual attendance systems are often prone to inefficiencies such as human error, proxy attendance, and high administrative effort. **ExamSecure** addresses these challenges with:

- **Accuracy and Reliability**: Eliminates manual errors through automated processes.  
- **Enhanced Security**: Blockchain's tamper-proof system ensures data integrity.  
- **Real-Time Processing**: Facilitates quick attendance marking using facial recognition.  
- **Scalability**: Adapts to varied environments, from small classrooms to large events.  
- **Seamless Integration**: Works with existing systems for grading or payroll processing.

---

## Technologies Used

- **HTML5, CSS, JavaScript, ReactJS**: Frontend development for seamless user experience.  
- **Flask, Node.js**: Backend development for API communication and system logic.  
- **FaceDB, OpenCV**: Facial recognition and image processing.  
- **Solidity, Ganache, Truffle, MetaMask**: Blockchain and smart contract development.

---

## API Documentation

### Key Endpoints
1. **Save Face (`/save-face`)**  
   - **Method**: `POST`  
   - **Description**: Saves the user's facial data for future recognition.  

2. **Recognize Face (`/recognize-face`)**  
   - **Method**: `POST`  
   - **Description**: Matches live facial data with existing records to mark attendance.

---

## Workflow

1. **Faculty Interface**  
   - Create a classroom and add student details.  
   - Start a live video stream to process attendance in real-time.  

2. **Facial Recognition**  
   - Students' faces are captured and matched against the database.  
   - Attendance is marked automatically in the blockchain.  

3. **Data Security**  
   - Records are stored immutably in the blockchain, accessible only by authorized personnel.  

---

## Usage Instructions

1. Clone the repository:  
   git clone https://github.com/Angad-2002/ExamSecure.git

2. Navigate to the project directory:  
   cd ExamSecure

3. Deploy the smart contract:  
   truffle compile
   truffle migrate

4. Set up the backend environment:
   - Navigate to the `Facev2` directory:
     cd Facev2
   - Create a virtual environment:
     python3 -m venv venv
   - Activate the virtual environment:
     - On macOS/Linux:
       source venv/bin/activate
     - On Windows:
       venv\Scripts\activate
   - Install the backend dependencies (Look for different internet sources (stackoverflow etc.) if encountering errors):
     pip install facedb, numpy, cv2 etc.

5. Install frontend dependencies:  
   cd frontend
   npm install # For frontend

6. Run the application:  
   - Start the frontend:
     npm start # Start frontend
   - Start the backend:
     python main.py # Start backend

7. Connect to MetaMask and upload the Test Ethers into it.

8. Test the Web DApp.

---

## Future Enhancements

- **Advanced Analytics**: Attendance patterns and compliance tracking using data visualization tools.  
- **IoT Integration**: Incorporating smart devices for enhanced real-time attendance tracking.  
- **Cross-System Compatibility**: Automatic integration with payroll or grading systems for seamless operations.

---

## Contributing

We welcome contributions to improve ExamSecure! Feel free to submit a pull request or open an issue in the [GitHub repository](https://github.com/Angad-2002/ExamSecure).

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact

For queries or suggestions, feel free to reach out via [GitHub](https://github.com/Angad-2002).

## Contributors

Angad Singh – 
GitHub: [Angad-2002](https://github.com/Angad-2002)
Ashish Benny –
GitHub: [Angad-2002](https://github.com/Angad-2002)
Akhand Pratap Singh Chauhan –
GitHub: [Angad-2002](https://github.com/Angad-2002)
