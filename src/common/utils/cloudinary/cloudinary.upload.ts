import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import cloudinary from './cloudinary.config';

export async function uploadToCloudinary(
  file: Express.Multer.File,
  folder:string = "E_Commerce"
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve(result);
      },
    );
    upload.end(file.buffer);
  });
}
