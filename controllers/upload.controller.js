import cloudinary from '../config/cloudinary.js';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No file provided');
      error.statusCode = 400;
      throw error;
    }

    const folder = req.query.folder || 'hakia';
    console.log(`[upload] Uploading ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes) to folder: ${folder}`);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('[upload] Cloudinary error:', error.message);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });

    console.log(`[upload] Success: ${result.secure_url}`);

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error('[upload] Error:', error.message);
    next(error);
  }
};
