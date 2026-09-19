import json
import os
import boto3
from decimal import Decimal


dynamodb = boto3.resource("dynamodb")

TABLE_NAME = os.environ["TABLE_NAME"]

table = dynamodb.Table(TABLE_NAME)


class DecimalEncoder(json.JSONEncoder):

    def default(self, obj):

        if isinstance(obj, Decimal):
            return float(obj)

        return super(
            DecimalEncoder,
            self
        ).default(obj)


def response(status_code, body):

    return {

        "statusCode": status_code,

        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },

        "body": json.dumps(
            body,
            cls=DecimalEncoder
        )
    }


def lambda_handler(event, context):

    try:

        result = table.scan()

        documents = result.get(
            "Items",
            []
        )

        # Handle DynamoDB pagination
        while "LastEvaluatedKey" in result:

            result = table.scan(
                ExclusiveStartKey=
                result["LastEvaluatedKey"]
            )

            documents.extend(
                result.get(
                    "Items",
                    []
                )
            )

        return response(
            200,
            {
                "documents": documents
            }
        )

    except Exception as e:

        print("ERROR:", str(e))

        return response(
            500,
            {
                "message":
                "Failed to retrieve documents"
            }
        )