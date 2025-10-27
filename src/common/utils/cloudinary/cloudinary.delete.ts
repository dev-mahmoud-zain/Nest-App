import cloudinary from "./cloudinary.config"; 

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`❌ Error deleting image: ${publicId}`, error);
    throw error;
  }
};