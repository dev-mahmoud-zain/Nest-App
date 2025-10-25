import { IResponse } from "src/common/interfaces";

export const response = <T = any>(
    {
        message = "done",
        statusCode = 200,
        data
    }: IResponse<T>
        = {}): IResponse<T> => {
    return { message, statusCode, data };
}