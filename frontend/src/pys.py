from web3 import Web3

# Connect to local Ganache blockchain
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))

# Contract ABI and address
contract_address = "0x472dD472E7bB103b92E5e7836CA8451D0a68930d"  # Replace with your contract's deployed address
with open(r"C:\Users\angad\attendance-verification-sol\frontend\src\contracts\AttendanceSystem.json") as f:
    contract_abi = f.read()
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Function to print all students in a classroom
def print_students_in_class(class_id):
    try:
        # Fetch class details and student addresses
        class_name, student_addresses = contract.functions.getClassroom(class_id).call()
        print(f"Classroom Name: {class_name}")

        # Loop through student addresses and print their details
        for address in student_addresses:
            student = contract.functions.classrooms(class_id).students(address).call()
            name, reg_no, last_attendance, is_verified = student
            print(f"Student Name: {name}, Reg No: {reg_no}, Last Attendance: {last_attendance}, Verified: {is_verified}")
    except Exception as e:
        print("Error:", e)

# Call the function
print_students_in_class(0)  # Example for class ID 0
