const USER_POOL_ID = "us-east-1_FudWmf7R5";
const CLIENT_ID = "53tr68gnkkr6kb1tf7mmdknbs0";

const API_BASE_URL =
    "https://y2dxldw4d2.execute-api.us-east-1.amazonaws.com/prod";


// ======================================================
// HELPERS
// ======================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.clear();

    window.location.href = "index.html";
}


// ======================================================
// LOGIN
// ======================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const emailElement =
                document.getElementById("email");

            const passwordElement =
                document.getElementById("password");

            if (
                !emailElement ||
                !passwordElement
            ) {

                alert(
                    "Login fields not found."
                );

                return;
            }

            const email =
                emailElement.value.trim();

            const password =
                passwordElement.value;

            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "https://cognito-idp.us-east-1.amazonaws.com/",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/x-amz-json-1.1",

                                "X-Amz-Target":
                                    "AWSCognitoIdentityProviderService.InitiateAuth"
                            },

                            body: JSON.stringify({

                                AuthFlow:
                                    "USER_PASSWORD_AUTH",

                                ClientId:
                                    CLIENT_ID,

                                AuthParameters: {

                                    USERNAME:
                                        email,

                                    PASSWORD:
                                        password

                                }

                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "LOGIN RESPONSE:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Login failed."
                    );

                }


                const auth =
                    data.AuthenticationResult;


                if (!auth) {

                    throw new Error(
                        "Authentication failed."
                    );

                }


                localStorage.setItem(
                    "idToken",
                    auth.IdToken
                );


                localStorage.setItem(
                    "accessToken",
                    auth.AccessToken
                );


                localStorage.setItem(
                    "userEmail",
                    email
                );


                // ==================================================
                // GET COGNITO GROUPS
                // ==================================================

                const tokenParts =
                    auth.IdToken.split(".");


                const payload =
                    JSON.parse(
                        atob(
                            tokenParts[1]
                                .replace(/-/g, "+")
                                .replace(/_/g, "/")
                        )
                    );


                const groups =
                    payload["cognito:groups"] || [];


                console.log(
                    "COGNITO GROUPS:",
                    groups
                );


                let role = "";


                if (groups.includes("Admin")) {

                    role = "admin";

                }

                else if (groups.includes("Manager")) {

                    role = "manager";

                }

                else if (groups.includes("Employee")) {

                    role = "employee";

                }


                if (!role) {

                    alert(
                        "User has no Admin, Manager, or Employee group."
                    );

                    return;
                }


                localStorage.setItem(
                    "userRole",
                    role
                );


                localStorage.setItem(
                    "userGroups",
                    JSON.stringify(groups)
                );


                // ==================================================
                // REDIRECT
                // ==================================================

                if (role === "admin") {

                    window.location.href =
                        "admin.html";

                }

                else if (role === "manager") {

                    window.location.href =
                        "manager.html";

                }

                else if (role === "employee") {

                    window.location.href =
                        "employee.html";

                }

            }

            catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Login failed."
                );

            }

        }
    );

}


// ======================================================
// EMPLOYEE PAGE
// ======================================================

if (
    window.location.pathname.endsWith(
        "employee.html"
    )
) {

    const role =
        localStorage.getItem(
            "userRole"
        );


    const email =
        localStorage.getItem(
            "userEmail"
        );


    if (!role || !email) {

        window.location.href =
            "index.html";

    }

    else if (role !== "employee") {

        alert(
            "Access denied."
        );

        logout();

    }

    else {

        const emailElement =
            document.getElementById(
                "userEmail"
            );


        if (emailElement) {

            emailElement.textContent =
                email;

        }


        loadEmployeeDocuments();

    }

}


// ======================================================
// EMPLOYEE UPLOAD
// ======================================================

const uploadForm =
    document.getElementById(
        "uploadForm"
    );


if (uploadForm) {

    uploadForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const titleElement =
                document.getElementById(
                    "title"
                );


            const descriptionElement =
                document.getElementById(
                    "description"
                );


            const fileElement =
                document.getElementById(
                    "file"
                );


            if (
                !titleElement ||
                !descriptionElement ||
                !fileElement
            ) {

                alert(
                    "Upload form fields not found."
                );

                return;
            }


            const title =
                titleElement.value.trim();


            const description =
                descriptionElement.value.trim();


            const file =
                fileElement.files[0];


            const employeeEmail =
                localStorage.getItem(
                    "userEmail"
                );


            if (!title) {

                alert(
                    "Please enter document title."
                );

                return;
            }


            if (!file) {

                alert(
                    "Please select a file."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        API_BASE_URL +
                        "/employee",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                title:
                                    title,

                                description:
                                    description,

                                fileName:
                                    file.name,

                                fileType:
                                    file.type ||
                                    "application/octet-stream",

                                employeeEmail:
                                    employeeEmail

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to create document."
                    );

                }


                if (!data.uploadUrl) {

                    throw new Error(
                        "Upload URL was not returned by the server."
                    );

                }


                const uploadResponse =
                    await fetch(
                        data.uploadUrl,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    file.type ||
                                    "application/octet-stream"
                            },

                            body:
                                file

                        }
                    );


                if (!uploadResponse.ok) {

                    throw new Error(
                        "Failed to upload file to S3."
                    );

                }


                alert(
                    "Document uploaded successfully."
                );


                uploadForm.reset();


                await loadEmployeeDocuments();

            }

            catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Upload failed."
                );

            }

        }
    );

}


// ======================================================
// LOAD EMPLOYEE DOCUMENTS
// ======================================================

async function loadEmployeeDocuments() {

    const tableBody =
        document.getElementById(
            "docs"
        );


    if (!tableBody) {
        return;
    }


    const email =
        localStorage.getItem(
            "userEmail"
        );


    if (!email) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="4">
                Loading documents...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/employee?employeeEmail=" +
                encodeURIComponent(email)
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load documents."
            );

        }


        const documents =
            data.documents || [];


        let pending = 0;
        let approved = 0;
        let rejected = 0;


        documents.forEach(
            function (doc) {

                const status =
                    String(
                        doc.status ||
                        "PENDING"
                    ).toUpperCase();


                if (status === "PENDING") {
                    pending++;
                }

                else if (status === "APPROVED") {
                    approved++;
                }

                else if (status === "REJECTED") {
                    rejected++;
                }

            }
        );


        const totalElement =
            document.getElementById("total");

        const pendingElement =
            document.getElementById("pending");

        const approvedElement =
            document.getElementById("approved");

        const rejectedElement =
            document.getElementById("rejected");


        if (totalElement) {
            totalElement.textContent =
                documents.length;
        }

        if (pendingElement) {
            pendingElement.textContent =
                pending;
        }

        if (approvedElement) {
            approvedElement.textContent =
                approved;
        }

        if (rejectedElement) {
            rejectedElement.textContent =
                rejected;
        }


        if (documents.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        No documents found.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML = "";


        documents.forEach(
            function (doc) {

                const row =
                    document.createElement("tr");


                const status =
                    String(
                        doc.status ||
                        "PENDING"
                    ).toUpperCase();


                const reviewer =
                    doc.reviewer ||
                    doc.managerEmail ||
                    "-";


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            doc.title ||
                            doc.fileName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            formatDate(
                                doc.createdAt
                            )
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(status)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(reviewer)}
                    </td>

                `;


                tableBody.appendChild(row);

            }
        );

    }

    catch (error) {

        console.error(
            "EMPLOYEE DOCUMENT ERROR:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Failed to load documents.
                </td>
            </tr>
        `;

    }

}


// ======================================================
// MANAGER PAGE
// ======================================================

if (
    window.location.pathname.endsWith(
        "manager.html"
    )
) {

    const role =
        localStorage.getItem(
            "userRole"
        );


    const email =
        localStorage.getItem(
            "userEmail"
        );


    if (!role || !email) {

        window.location.href =
            "index.html";

    }

    else if (role !== "manager") {

        alert(
            "Access denied."
        );

        logout();

    }

    else {

        const emailElement =
            document.getElementById(
                "userEmail"
            );


        if (emailElement) {

            emailElement.textContent =
                email;

        }


        loadManagerDocuments();

    }

}


// ======================================================
// LOAD MANAGER DOCUMENTS
// ======================================================

async function loadManagerDocuments() {

    const tableBody =
        document.getElementById(
            "managerDocs"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="5">
                Loading documents...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/manager",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({})
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load documents."
            );

        }


        const documents =
            data.documents || [];


        tableBody.innerHTML = "";


        if (documents.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No documents found.
                    </td>
                </tr>
            `;

            return;

        }


        documents.forEach(
            function (doc) {

                const row =
                    document.createElement("tr");


                const documentId =
                    doc.documentId ||
                    doc.message_id ||
                    "";


                const status =
                    String(
                        doc.status ||
                        "PENDING"
                    ).toUpperCase();


                let actionHTML = "";


                if (status === "PENDING") {

                    actionHTML = `

                        <button
                            type="button"
                            class="approveButton"
                        >
                            Approve
                        </button>

                        <button
                            type="button"
                            class="rejectButton"
                        >
                            Reject
                        </button>

                    `;

                }

                else {

                    actionHTML = `
                        <strong>
                            ${escapeHtml(status)}
                        </strong>
                    `;

                }


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            doc.title ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            doc.employeeEmail ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            formatDate(
                                doc.createdAt
                            )
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(status)}
                        </strong>
                    </td>

                    <td>
                        ${actionHTML}
                    </td>

                `;


                const approveButton =
                    row.querySelector(
                        ".approveButton"
                    );


                if (approveButton) {

                    approveButton.addEventListener(
                        "click",
                        function () {

                            reviewDocument(
                                documentId,
                                "APPROVED"
                            );

                        }
                    );

                }


                const rejectButton =
                    row.querySelector(
                        ".rejectButton"
                    );


                if (rejectButton) {

                    rejectButton.addEventListener(
                        "click",
                        function () {

                            reviewDocument(
                                documentId,
                                "REJECTED"
                            );

                        }
                    );

                }


                tableBody.appendChild(row);

            }
        );

    }

    catch (error) {

        console.error(
            "MANAGER ERROR:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load documents.
                </td>
            </tr>
        `;

    }

}


// ======================================================
// APPROVE / REJECT
// ======================================================

async function reviewDocument(
    documentId,
    action
) {

    if (!documentId) {

        alert(
            "Document ID not found."
        );

        return;

    }


    const actionName =
        action === "APPROVED"
            ? "approve"
            : "reject";


    const confirmed =
        confirm(
            `Are you sure you want to ${actionName} this document?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/manager",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        action:
                            action,

                        documentId:
                            documentId

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update document."
            );

        }


        alert(
            action === "APPROVED"
                ? "Document approved successfully."
                : "Document rejected successfully."
        );


        await loadManagerDocuments();

    }

    catch (error) {

        console.error(
            "REVIEW ERROR:",
            error
        );


        alert(
            error.message ||
            "Failed to update document."
        );

    }

}


// ======================================================
// ADMIN PAGE - VIEW ONLY
// ======================================================

if (
    window.location.pathname.endsWith(
        "admin.html"
    )
) {

    const role =
        localStorage.getItem(
            "userRole"
        );


    const email =
        localStorage.getItem(
            "userEmail"
        );


    if (!role || !email) {

        window.location.href =
            "index.html";

    }

    else if (role !== "admin") {

        alert(
            "Access denied."
        );

        logout();

    }

    else {

        const emailElement =
            document.getElementById(
                "userEmail"
            );


        if (emailElement) {

            emailElement.textContent =
                email;

        }


        loadAdminDocuments();

    }

}


// ======================================================
// LOAD ADMIN DOCUMENTS
// ADMIN = VIEW ONLY
// ======================================================

async function loadAdminDocuments() {

    const tableBody =
        document.getElementById(
            "adminDocs"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td colspan="5">
                Loading documents...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                API_BASE_URL +
                "/admin",
                {
                    method: "GET"
                }
            );


        const data =
            await response.json();


        console.log(
            "ADMIN DOCUMENTS:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load admin documents."
            );

        }


        const documents =
            data.documents || [];


        // ==================================================
        // DISPLAY DOCUMENTS
        // ==================================================

        tableBody.innerHTML = "";


        if (documents.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No documents found.
                    </td>
                </tr>
            `;

            return;

        }


        documents.forEach(
            function (doc) {

                const row =
                    document.createElement("tr");


                const status =
                    String(
                        doc.status ||
                        "PENDING"
                    ).toUpperCase();


                const reviewer =
                    doc.reviewer ||
                    doc.managerEmail ||
                    "-";


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            doc.title ||
                            doc.fileName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            doc.employeeEmail ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            formatDate(
                                doc.createdAt
                            )
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escapeHtml(status)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(reviewer)}
                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        console.error(
            "ADMIN ERROR:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load documents.
                </td>
            </tr>
        `;

    }

}