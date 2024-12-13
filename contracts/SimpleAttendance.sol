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
