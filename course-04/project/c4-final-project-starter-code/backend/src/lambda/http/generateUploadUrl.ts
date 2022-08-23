import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { updatePresignedUrlForTodoItem } from '../../businessLogic/todos'
import * as uuid from 'uuid'
import { createPresignedUrl } from '../../fileStorage/attachmentUtils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const userId = getUserId(event)
    const attachmentId = uuid.v4()
    const presignedUrl: string = await createPresignedUrl(attachmentId)

    try {
      await updatePresignedUrlForTodoItem(userId, todoId, attachmentId)

      return {
        statusCode: 200,
        body: JSON.stringify({
          'uploadUrl': presignedUrl
        })
      }

    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: e
        })
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
