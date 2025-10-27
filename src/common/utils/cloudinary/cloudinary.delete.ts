import cloudinary from "./cloudinary.config"; 

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`❌ Error deleting image: ${publicId}`, error);
    throw error;
  }
};

export async function deleteFolderFromCloudinary(folderPath) {
  
  try {
    // Step 1: Delete all files under this folder
    await cloudinary.api.delete_resources_by_prefix(folderPath);

    // Step 2: List and delete subfolders recursively
    const { folders } = await cloudinary.api.sub_folders(folderPath);
    for (const sub of folders) {
      await deleteFolderFromCloudinary(sub.path);
    }

    // Step 3: Check if folder is empty now
    const remaining = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath,
      max_results: 1,
    });

    if (remaining.resources.length === 0) {
      // Step 4: Delete the folder itself
      await cloudinary.api.delete_folder(folderPath);
    }
  } catch (error) {
    if (error.http_code !== 404) {
      console.error(`❌ Error deleting folder "${folderPath}":`, error.message || error);
    }
  }
}