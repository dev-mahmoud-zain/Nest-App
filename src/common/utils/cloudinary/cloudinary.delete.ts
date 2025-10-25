import cloudinary from "./cloudinary.config"; 

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Image deleted successfully: ${publicId}`);
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw error;
  }
};