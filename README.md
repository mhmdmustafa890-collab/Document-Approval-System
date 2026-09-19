# Document Approval System

A serverless document approval system built on AWS that allows employees to upload documents, managers to review and approve or reject them, and administrators to manage the system securely.

The system uses Amazon Cognito for authentication and role management, Amazon API Gateway for APIs, AWS Lambda for backend logic, Amazon DynamoDB for document metadata, Amazon S3 for file storage, and Amazon CloudFront for secure frontend delivery.

---

# 1. Project Overview

The **Document Approval System** provides a complete workflow for managing document submissions and approvals.

The system contains three main roles:

- **Admin**
- **Manager**
- **Employee**

Each role has different permissions and responsibilities.

The complete application is delivered through **Amazon CloudFront**, with the frontend hosted on **Amazon S3**.

## Application Preview

### Home / Login Page

![Home Page](https://github.com/user-attachments/assets/6024755b-0d72-4d60-8996-cca998dfb237)

### Employee Dashboard

![Employee Dashboard](https://github.com/user-attachments/assets/0c80bd76-0b4d-4c18-a347-c7043266bfcd)

### Manager Dashboard

![Manager Dashboard](https://github.com/user-attachments/assets/0955cad0-990d-452d-b77a-a97ab83d288c)



### Admin Dashboard

![Admin Dashboard](https://github.com/user-attachments/assets/4df39cac-f497-4bcd-8cf5-96403801e34b)

### Email Notification

After a manager approves or rejects a document, the system sends an email notification to the employee with the updated document status.

![Email Notification](https://github.com/user-attachments/assets/a3c3efeb-983f-4846-9776-c85cc858668e)


---

# 2. AWS Architecture

The project uses the following AWS services:

* **Amazon S3** – Stores frontend files and uploaded documents.
* **Amazon CloudFront** – Delivers the frontend securely.
* **Amazon Cognito** – Handles authentication and user roles.
* **Amazon API Gateway** – Provides REST API endpoints.
* **AWS Lambda** – Runs the backend application logic.
* **Amazon DynamoDB** – Stores document information and approval status.
* **IAM** – Controls permissions between AWS services.

### Architecture
![Architecture](https://github.com/user-attachments/assets/045e1085-8345-4e35-9126-829d3dd82ed1)

---

# 3. Amazon S3

Amazon S3 is used for storing the frontend application and uploaded documents.

## Frontend Bucket

The frontend files are stored in an S3 bucket.

Example files:

```text
index.html
login.html
employee.html
manager.html
admin.html
style.css
script.js
```

The S3 bucket is connected to Amazon CloudFront to deliver the website.

### Screenshot
![s3](https://github.com/user-attachments/assets/57dc2f3c-6817-4c9e-94de-e9e53483eaa9)

---

# 4. Amazon CloudFront

Amazon CloudFront is used to distribute the frontend application globally.

The CloudFront distribution provides the main URL used to access the application.

### Flow

```text
User
  │
  ▼
CloudFront
  │
  ▼
S3
  │
  ▼
Frontend Application
```

### Screenshot

![Cloud front](https://github.com/user-attachments/assets/3b7cba54-4660-4527-af25-d5c7106df75e)

---

# 5. Amazon Cognito

Amazon Cognito is used to authenticate users and control access to the application.

The system uses three user groups:

```text
Admin
Manager
Employee
```

Each user is assigned to a group according to their role.

### User Flow

```text
User
 │
 ▼
Cognito Login
 │
 ▼
Authentication
 │
 ▼
JWT Token
 │
 ▼
API Gateway
```

The JWT token is sent with API requests to identify the authenticated user.

### Cognito Groups

| Group    | Responsibility                       |
| -------- | ------------------------------------ |
| Admin    | Manage users and system data         |
| Manager  | Review, approve, or reject documents |
| Employee | Upload and track documents           |

### Screenshot
![Screenshot](https://github.com/user-attachments/assets/fd6d5140-c4ed-4a69-96e0-58c2f04f4f07)



### Groups Screenshot

![Groups Screenshot](https://github.com/user-attachments/assets/b95d3261-90e1-41a9-b923-63f8b8dd5436)


---

# 6. API Gateway

Amazon API Gateway provides the API endpoints used by the frontend.

The API receives requests from authenticated users and sends them to the appropriate Lambda function.

### Main API Structure

```text
API Gateway
│
├── Upload Document
│       └── Employee Lambda
│
├── Get Documents
│       └── Get Lambda
│
└── Admin Operations
        └── Admin Lambda
```

The API uses the Cognito authentication token to secure the requests.

### Screenshot

![Screenshot](https://github.com/user-attachments/assets/8144d696-cdf9-4cc5-85f4-ea5c34ad5c8a)
![Screenshot](https://github.com/user-attachments/assets/2a62fbf8-6a39-4e7a-9f0e-dea0f2779450)


---

# 7. AWS Lambda

The backend is divided into three Lambda functions.

## 7.1 Employee Lambda

The Employee Lambda handles document uploads.

Main responsibilities:

* Receive the uploaded document.
* Generate a unique document ID.
* Upload the document to Amazon S3.
* Store document metadata in DynamoDB.
* Set the initial document status.

Initial status:

```text
Pending
```

### Workflow

```text
Employee
   │
   ▼
API Gateway
   │
   ▼
Employee Lambda
   │
   ├──► S3
   │
   └──► DynamoDB
```

### Screenshot

![Screenshot](https://github.com/user-attachments/assets/c333abfa-4e6e-4469-9b43-b337b9ab4522)


---

# 8. Get Lambda

The Get Lambda retrieves document information from DynamoDB.

It is used to display documents to users according to their role.

### Employee

The employee can view their submitted documents and their current status.

### Manager

The manager can view documents waiting for approval.

### Workflow

```text
User
 │
 ▼
API Gateway
 │
 ▼
Get Lambda
 │
 ▼
DynamoDB
 │
 ▼
Document Information
```

### Screenshot
![Screenshot](https://github.com/user-attachments/assets/e27545a9-c095-40cb-a899-d7f2b60539fc)

---

# 9. Admin Lambda

The Admin Lambda handles administrator operations.

The Admin role is responsible for administrative actions inside the system.

The Admin Lambda communicates with the required AWS services to perform these operations securely.

### Workflow

```text
Admin
 │
 ▼
API Gateway
 │
 ▼
Admin Lambda
 │
 ├──► DynamoDB
 │
 └──► Other AWS Services
```

### Screenshot

![Screenshot](https://github.com/user-attachments/assets/2cdc3753-8e7d-435c-a817-256b76f41171)


---

# 10. Amazon DynamoDB

DynamoDB stores the metadata related to uploaded documents.

Example document information:

```text
document_id
employee_id
employee_name
file_name
file_key
upload_date
status
manager_id
review_date
comment
```

### Document Status

The document follows this workflow:

```text
Pending
   │
   ├──────────────► Approved
   │
   └──────────────► Rejected
```

### Screenshot
![Screenshot](https://github.com/user-attachments/assets/2b07a66d-e15b-41c7-a947-bd709572f510)

---

# 11. Amazon S3 Document Storage

Uploaded documents are stored in Amazon S3.

The application separates the stored files from their metadata.

### Example

```text
S3
│
└── documents/
      │
      ├── document-001.pdf
      ├── document-002.pdf
      └── document-003.pdf
```

![Screenshot](https://github.com/user-attachments/assets/1c9b0a06-943e-438f-a26c-ca66de8d12dd)


DynamoDB stores the information required to locate each file.


---

# 12. IAM Permissions

AWS IAM is used to control access between the AWS services.

Each Lambda function receives only the permissions required for its operations.

Examples:

```text
Lambda
   │
   ├── S3 permissions
   │
   └── DynamoDB permissions
```

This follows the principle of granting the required permissions to each AWS resource.

---

# 13. Complete Application Workflow

The complete system works as follows.

## Step 1 – User Authentication

The user opens the application through CloudFront.

```text
User
 ↓
CloudFront
 ↓
Frontend
 ↓
Cognito Login
```

The user authenticates using Amazon Cognito.

---

## Step 2 – Role Identification

After authentication, the user's Cognito group determines their role.

```text
Cognito
 │
 ├── Admin
 │
 ├── Manager
 │
 └── Employee
```

The appropriate dashboard is displayed.

---

## Step 3 – Employee Upload

The employee selects a document and uploads it.

```text
Employee
 ↓
Frontend
 ↓
API Gateway
 ↓
Employee Lambda
 ↓
S3 + DynamoDB
```

The document is stored in S3 and its metadata is stored in DynamoDB.

The initial status is:

```text
Pending
```

---

## Step 4 – Manager Review

The manager opens the manager dashboard.

The application retrieves pending documents.

```text
Manager
 ↓
API Gateway
 ↓
Get Lambda
 ↓
DynamoDB
```

The manager can review the submitted document.

---

## Step 5 – Approval or Rejection

The manager processes the document.

```text
Pending
   │
   ├──► Approved
   │
   └──► Rejected
```

The document status is updated in DynamoDB.

---

## Step 6 – Employee Tracks Status

The employee can access the dashboard and see the updated document status.

```text
Employee
 ↓
API Gateway
 ↓
Get Lambda
 ↓
DynamoDB
 ↓
Document Status
```

Example:

```text
Report.pdf
Status: Approved
```

---

## Step 7 – Admin Operations

The administrator can access the administration interface and perform authorized administrative operations.

```text
Admin
 ↓
Cognito
 ↓
API Gateway
 ↓
Admin Lambda
 ↓
AWS Services
```

---

# 14. Complete AWS Workflow

```text
                         USERS
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          Employee       Manager        Admin
             │             │             │
             └─────────────┼─────────────┘
                           │
                           ▼
                    Amazon Cognito
                           │
                        JWT Token
                           │
                           ▼
                    Amazon API Gateway
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
      Employee Lambda   Get Lambda   Admin Lambda
             │             │             │
             └──────┬──────┴──────┬──────┘
                    │             │
                    ▼             ▼
              Amazon S3       DynamoDB
                    │             │
                    │             │
                    └──────┬──────┘
                           │
                           ▼
                    Document Workflow

              Pending → Approved / Rejected
```

---

# 15. Security

The system uses several AWS security mechanisms:

* Amazon Cognito authentication.
* Cognito groups for role-based access.
* JWT authentication for API requests.
* IAM roles and policies.
* Private S3 storage for application data.
* API Gateway authorization.
* CloudFront for frontend delivery.

The application separates permissions between:

```text
Admin
Manager
Employee
```

to prevent unauthorized access to protected operations.

---

# 16. AWS Services Used

| AWS Service        | Purpose                        |
| ------------------ | ------------------------------ |
| Amazon S3          | Frontend and document storage  |
| Amazon CloudFront  | Frontend distribution          |
| Amazon Cognito     | Authentication and user groups |
| Amazon API Gateway | Backend API                    |
| AWS Lambda         | Serverless backend             |
| Amazon DynamoDB    | Document metadata              |
| AWS IAM            | Access control and permissions |

---

# 17. Project Structure

```text
Document-Approval-System/
│
├── index.html
├── login.html
├── employee.html
├── manager.html
├── admin.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── employee.js
│   ├── manager.js
│   └── admin.js
│
└── README.md
```


# 19. Final Result

The final system provides a complete serverless document approval workflow using AWS.
![Screenshot](https://github.com/user-attachments/assets/dbf76868-7708-4136-a396-ffa5deb22857)

![Screenshot](https://github.com/user-attachments/assets/518d3bd5-5bd1-4493-ab6a-ec9b482a8a74)


![Screenshot](https://github.com/user-attachments/assets/420bbe28-3c44-43b9-ae68-57054aeec064)


![Screenshot](https://github.com/user-attachments/assets/3e67901b-3908-4f0a-a7c3-a40944b0120d)


The project demonstrates the use of:

**Serverless Architecture + Authentication + Role-Based Access Control + API Development + Object Storage + NoSQL Database + AWS Security**

---

# 20. Conclusion

The **Document Approval System** demonstrates how multiple AWS services can be integrated to build a secure and scalable serverless application.

The system provides:

* Secure user authentication.
* Role-based access.
* Document upload.
* Document storage.
* Document metadata management.
* Manager approval and rejection.
* Employee status tracking.
* Administrative operations.
* Serverless backend architecture.
* Cloud-based frontend delivery.
