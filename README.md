# Document Approval System

A serverless document approval system built on AWS that allows employees to upload documents, managers to review and approve or reject them, and administrators to manage the system securely.

The system uses Amazon Cognito for authentication and role management, Amazon API Gateway for APIs, AWS Lambda for backend logic, Amazon DynamoDB for document metadata, Amazon S3 for file storage, and Amazon CloudFront for secure frontend delivery.

---

# 1. Project Overview

The **Document Approval System** provides a complete workflow for managing document submissions and approvals.

The system contains three main roles:

* **Admin**
* **Manager**
* **Employee**

Each role has different permissions and responsibilities.

### Main Workflow

```text
Employee
   │
   │ Upload Document
   ▼
API Gateway
   │
   ▼
Employee Lambda
   │
   ├──────────────► Amazon S3
   │                  │
   │                  └── Document File
   │
   └──────────────► DynamoDB
                      │
                      └── Document Metadata
                               │
                               ▼
                            Manager
                               │
                     Approve / Reject
                               │
                               ▼
                         DynamoDB
                               │
                               ▼
                            Employee
```

The complete application is delivered through **Amazon CloudFront** with the frontend hosted on **Amazon S3**.

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

Add your S3 bucket screenshot here.

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

Add your CloudFront distribution screenshot here.

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

### Groups Screenshot


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

```text
[ Get Lambda Screenshot ]
```

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

```text
[ Admin Lambda Screenshot ]
```

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

```text
[ DynamoDB Table Screenshot ]
```

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

```text
Employee
   │
   │ Upload
   ▼
S3 + DynamoDB
   │
   │ Pending
   ▼
Manager
   │
   ├── Approve
   │
   └── Reject
   │
   ▼
DynamoDB
   │
   ▼
Employee
   │
   ▼
View Final Status
```

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
