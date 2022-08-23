import * as uuid from 'uuid';
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { TodoAccess } from "../dataLayer/todoAcess";
import { createAttachmentUrl } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'

const toDoAccess = new TodoAccess();
const logger = createLogger('todos')

export async function getTodosForUser(userId: string) {
    return await toDoAccess.getUserTodos(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string) {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()

    const toDoItem: TodoItem = {
        todoId: todoId,
        userId: userId,
        createdAt: createdAt,
        done: false,
        ...createTodoRequest
    }

    // Loging infor new item
    logger.info('New Todo item: ' + toDoItem)
    return await toDoAccess.createTodo(toDoItem)
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string) {
    // Do not need  createdAt here
    // const createdAt = new Date().toISOString()
    // Login infor update item
    logger.info('Update item: ', { todoId: todoId, userId: userId, updateTodoRequest: updateTodoRequest })
    return await toDoAccess.updateTodo(
        {
            name: updateTodoRequest.name,
            dueDate: updateTodoRequest.dueDate,
            done: updateTodoRequest.done,
            description: updateTodoRequest.description,
            point: updateTodoRequest.point
        },
        userId,
        todoId
    )
}

export async function updatePresignedUrlForTodoItem(userId: string, todoId: string, attachmentId: string) {
    const todoItem = await toDoAccess.getTodoByIdForUser(userId, todoId)
    const attachmentUrl = await createAttachmentUrl(attachmentId)
    return await toDoAccess.updatePresignedUrlForTodoItem(
        {
            name: todoItem.name,
            dueDate: todoItem.dueDate,
            done: todoItem.done,
            attachmentUrl: attachmentUrl,
            description: todoItem.description,
            point: todoItem.point
        },
        userId,
        todoId
    )
}

export async function deleteTodo(todoId: string, userId: string) {
    logger.info('Delete Todo: ', { todoId: todoId, userId: userId })
    return await toDoAccess.deleteTodo(todoId, userId)
}
