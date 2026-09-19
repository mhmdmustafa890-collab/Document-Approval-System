import json
import os
import boto3
from datetime import datetime, timezone


dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]

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

        # Get document ID from API Gateway path
        path_parameters = (
            event.get("pathParameters")
            or {}
        )

        document_id = path_parameters.get(
            "documentId"
        )

        if not document_id:

            return response(
                400,
                {
                    "message":
                    "Document ID is required"
                }
            )

        # Get request body
        body = json.loads(
            event.get("body", "{}")
        )

        decision = body.get(
            "decision"
        )

        reviewer_email = body.get(
            "reviewerEmail"
        )

        comment = body.get(
            "comment",
            ""
        )

        # Validate decision
        allowed_decisions = [
            "APPROVED",
            "REJECTED",
            "CHANGES_REQUESTED"
        ]

        if decision not in allowed_decisions:

            return response(
                400,
                {
                    "message":
                    "Invalid decision"
                }
            )

        if not reviewer_email:

            return response(
                400,
                {
                    "message":
                    "Reviewer email is required"
                }
            )

        reviewed_at = datetime.now(
            timezone.utc
        ).isoformat()

        # Update DynamoDB
        result = table.update_item(

            Key={
                "documentId": document_id
            },

            UpdateExpression="""
                SET #status = :status,
                    reviewerEmail = :reviewerEmail,
                    reviewerComment = :comment,
                    reviewedAt = :reviewedAt
            """,

            ExpressionAttributeNames={
                "#status": "status"
            },

            ExpressionAttributeValues={

                ":status": decision,

                ":reviewerEmail":
                    reviewer_email,

                ":comment":
                    comment,

                ":reviewedAt":
                    reviewed_at
            },

            ReturnValues="ALL_NEW"
        )

        return response(
            200,
            {
                "message":
                    "Document decision updated successfully",

                "document":
                    result.get(
                        "Attributes",
                        {}
                    )
            }
        )

    except Exception as e:

        print("ERROR:", str(e))

        return response(
            500,
            {
                "message":
                "Failed to update document"
            }
        )