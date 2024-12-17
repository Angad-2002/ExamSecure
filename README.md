# ExamSecure: Blockchain-Integrated Smart Attendance with Facial Recognition

**ExamSecure** is a cutting-edge decentralized application (dApp) that integrates **blockchain technology** with **facial recognition** to provide a secure, automated, and efficient attendance management system. Designed to cater to educational institutions, corporates, and large-scale events, ExamSecure ensures transparency, accountability, and scalability.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Practical Need for ExamSecure](#practical-need-for-examsecure)
3. [Technologies Used](#technologies-used)
4. [Solidity Smart Contract](#solidity-smart-contract-simpleattendancesol)
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

## Solidity Smart Contract

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

contract AttendanceSystem {
    struct Student {
        string name;
        string regNo;
        uint256 lastAttendanceTime;
        bool isVerified;
    }

    struct Classroom {
        string className;
        mapping(address => Student) students;
        address[] studentAddresses;
        uint256 attendanceCount;
    }

    mapping(uint256 => Classroom) public classrooms;
    mapping(string => address) public regNoToAddress; // Mapping to store student address by regNo
    uint256 public classroomCount;

    event ClassroomCreated(uint256 classId, string className);
    event StudentAdded(uint256 classId, address studentAddress, string name, string regNo);
    event AttendanceMarked(uint256 classId, address studentAddress, uint256 timestamp);

    // Create Classroom
    function createClassroom(string memory _className) public {
        classrooms[classroomCount].className = _className;
        classroomCount++;
        emit ClassroomCreated(classroomCount - 1, _className);
    }

    // Add student to classroom
    function addStudentToClass(uint256 _classId, string memory _name, string memory _regNo) public {
        require(_classId < classroomCount, "Classroom does not exist");
        require(bytes(_name).length > 0 && bytes(_regNo).length > 0, "Invalid student details");
        
        Classroom storage classroom = classrooms[_classId];

        // Ensure that the registration number is unique within the classroom
        for (uint256 i = 0; i < classroom.studentAddresses.length; i++) {
            if (keccak256(bytes(classroom.students[classroom.studentAddresses[i]].regNo)) == keccak256(bytes(_regNo))) {
                revert("Student with this registration number already exists in this classroom");
            }
        }

        address studentAddress = msg.sender;  // Use msg.sender as the student's unique address

        // Store the student data
        classroom.students[studentAddress] = Student(_name, _regNo, 0, false);
        classroom.studentAddresses.push(studentAddress);

        // Map the registration number to the student's address
        regNoToAddress[_regNo] = studentAddress;

        emit StudentAdded(_classId, studentAddress, _name, _regNo);
    }

    // Get student address by registration number
    function getStudentAddressByRegNo(string memory _regNo) public view returns (address) {
        return regNoToAddress[_regNo];
    }

    // Mark attendance for student
    function markAttendance(uint256 _classId, address _student) public {
        require(_classId < classroomCount, "Classroom does not exist");
        Classroom storage classroom = classrooms[_classId];
        Student storage student = classroom.students[_student];
        
        require(student.lastAttendanceTime == 0 || block.timestamp - student.lastAttendanceTime >= 1 days, "Attendance already marked within 24 hours");
        student.lastAttendanceTime = block.timestamp;
        student.isVerified = true;
        
        classroom.attendanceCount++;
        emit AttendanceMarked(_classId, _student, block.timestamp);
    }

    // Get attendance count for classroom
    function getAttendanceCount(uint256 _classId) public view returns (uint256) {
        require(_classId < classroomCount, "Classroom does not exist");
        return classrooms[_classId].attendanceCount;
    }

    // Get last attendance time for student
    function getLastAttendanceTime(uint256 _classId, address _student) public view returns (uint256) {
        require(_classId < classroomCount, "Classroom does not exist");
        return classrooms[_classId].students[_student].lastAttendanceTime;
    }

    // Get Classroom details
    function getClassroom(uint256 _classId) public view returns (string memory, address[] memory) {
        require(_classId < classroomCount, "Classroom does not exist");
        Classroom storage classroom = classrooms[_classId];
        return (classroom.className, classroom.studentAddresses);
    }

    // Get marked attendance students for classroom (including regNo)
    function getMarkedAttendanceStudents(uint256 _classId) public view returns (address[] memory, string[] memory) {
        require(_classId < classroomCount, "Classroom does not exist");
        Classroom storage classroom = classrooms[_classId];

        uint256 count = 0;
        for (uint256 i = 0; i < classroom.studentAddresses.length; i++) {
            if (classroom.students[classroom.studentAddresses[i]].isVerified) {
                count++;
            }
        }

        address[] memory markedStudents = new address[](count);
        string[] memory regNos = new string[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < classroom.studentAddresses.length; i++) {
            if (classroom.students[classroom.studentAddresses[i]].isVerified) {
                markedStudents[index] = classroom.studentAddresses[i];
                regNos[index] = classroom.students[classroom.studentAddresses[i]].regNo;
                index++;
            }
        }
        return (markedStudents, regNos);
    }
}
```

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

1. **Clone the repository**:  
   Run the following command in your terminal:  
   ```bash
   git clone https://github.com/Angad-2002/ExamSecure.git
   ```

2. **Navigate to the project directory**:  
   ```bash
   cd ExamSecure
   ```

3. **Deploy the smart contract**:  
   ```bash
   truffle compile
   truffle migrate
   ```

4. **Set up the backend environment**:  
   - Navigate to the `Facev2` directory:  
     ```bash
     cd Facev2
     ```
   - Create a virtual environment:  
     ```bash
     python3 -m venv venv
     ```
   - Activate the virtual environment:  
     - On macOS/Linux:  
       ```bash
       source venv/bin/activate
       ```
     - On Windows:  
       ```bash
       venv\Scripts\activate
       ```
   - Install the backend dependencies (e.g., `facedb`, `numpy`, `opencv`):  
     ```bash
     pip install facedb numpy opencv-python
     ```

5. **Install frontend dependencies**:  
   ```bash
   cd frontend
   npm install
   ```

6. **Run the application**:  
   - Start the frontend:  
     ```bash
     npm start
     ```
   - Start the backend:  
     ```bash
     python main.py
     ```

7. **Connect to MetaMask** and upload the test ethers to your wallet.

8. **Test the Web DApp**.

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

---

## Contributors

- **Angad Singh**  
  GitHub: [Angad-2002](https://github.com/Angad-2002)

- **Ashish Benny**  
  GitHub: [Ashish-Benny](https://github.com/AshishBenny)

- **Akhand Pratap Singh Chauhan**  
  GitHub: [Akhand-Pratap-Singh](https://github.com/akhandchauhan)

---
