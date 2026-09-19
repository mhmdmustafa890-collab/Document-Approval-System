import json
import os
import uuid
import boto3
from datetime import datetime, timezone

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]
BUCKET_NAME = os.environ["BUCKET_NAME"]

table = dynamodb.Table(TABLE_NAME)


def response(status_code, body):

    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        "body": json.dumps(body)
    }


def lambda_handler(event, context):

    try:

        body = json.loads(event.get("body", "{}"))

        title = body.get("title")
        description = body.get("description", "")
        file_name = body.get("fileName")
        file_type = body.get(
            "fileType",
            "application/octet-stream"
        )
        employee_email = body.get("employeeEmail")

        if not title:
            return response(
                400,
                {"message": "Title is required"}
            )

        if not file_name:
            return response(
                400,
                {"message": "File name is required"}
            )

        if not employee_email:
            return response(
                400,
                {"message": "Employee email is required"}
            )

        # Generate unique document ID
        document_id = "DOC-" + uuid.uuid4().hex[:10].upper()

        # S3 object key
        s3_key = (
            f"documents/{document_id}-{file_name}"
        )

        created_at = datetime.now(
            timezone.utc
        ).isoformat()

        # Save metadata in DynamoDB
        item = {

            "documentId": document_id,

            "title": title,

            "description": description,

            "fileName": file_name,

            "fileType": file_type,

            "s3Key": s3_key,

            "employeeEmail": employee_email,

            "status": "PENDING",

            "createdAt": created_at
        }

        table.put_item(
            Item=item
        )

        # Generate Presigned URL
        upload_url = s3.generate_presigned_url(
            "put_object",

            Params={
                "Bucket": BUCKET_NAME,
                "Key": s3_key,
                "ContentType": file_type
            },

            ExpiresIn=300
        )

        return response(
            200,
            {
                "message": "Document created successfully",

                "uploadUrl": upload_url,

                "document": item
            }
        )

    except Exception as e:

        print("ERROR:", str(e))

        return response(
            500,
            {
                "message": "Internal server error"
            }
        )