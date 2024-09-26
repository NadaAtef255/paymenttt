const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadToCloudinary = async (dataString, cloudinaryFolder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: cloudinaryFolder }, (error, result) => {
            if (result) {
                resolve(result);
            } else if (error) {
                console.error(error);

                reject('Error uploading file to Cloudinary');
            }
        });
        uploadStream.end(dataString);
    });
};
exports.removeFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);

        return result;
    } catch (err) {
        return err;
    }
};
