# Image Upload Refactoring Summary

## Overview

The backend has been refactored to use Cloudinary for all image uploads instead of base64 strings, resulting in smaller payloads and better performance.

## Key Changes

### 1. Cloudinary Helper Utility (`src/utils/cloudinaryHelper.js`)

- Created a centralized utility for handling Cloudinary uploads and deletions
- Supports both file uploads (from multer) and base64 strings
- Handles automatic cleanup of old images when updating

### 2. Updated Multer Middleware (`src/middleware/multer.js`)

- Changed to use memory storage for better Cloudinary integration
- Added file size limits (5MB)
- Added image file type validation

### 3. Updated Models

All models with images now include:

- `image`: Cloudinary secure_url (string)
- `imagePublicId`: Cloudinary public_id for deletion (string)

**Updated Models:**

- `Service` - Service images
- `Story` - Story images
- `Event` - Event images
- `AboutTestimonials` (testimonial schema) - Testimonial images
- `TeamSection` (member schema) - Team member images
- `TestimonialSection` (testimonial schema) - Testimonial images
- `Gallery` - Already had proper structure

### 4. Updated Controllers

All controllers now:

- Import the cloudinaryHelper utility
- Handle both file uploads and base64 strings
- Upload images to organized Cloudinary folders
- Delete old images when updating/deleting records
- Return only image URLs in responses (no base64)

**Updated Controllers:**

- `serviceController.js`
- `storyController.js`
- `eventController.js`
- `aboutTestimonialsController.js`
- `teamSectionController.js`
- `testimonialController.js`

### 5. Updated Routes

All routes with image uploads now include:

- `upload.single('image')` middleware for file uploads
- Support for both file and JSON body image data

**Updated Routes:**

- `/api/services` - POST, PUT
- `/api/stories` - POST, PUT
- `/api/events` - POST, PUT
- `/api/about/testimonials/testimonial` - POST, PUT
- `/api/team-members/member` - POST
- `/api/testimonials/testimonial` - POST, PUT

## Cloudinary Folder Structure

- `divinecare/services/` - Service images
- `divinecare/stories/` - Story images
- `divinecare/events/` - Event images
- `divinecare/testimonials/` - Testimonial images (both About and Home sections)
- `divinecare/team/` - Team member images

## API Usage

### File Upload (Form Data)

```javascript
// Using FormData
const formData = new FormData();
formData.append("title", "Service Title");
formData.append("image", fileObject);
```

### Base64 Upload (JSON)

```javascript
// Using JSON with base64
{
  "title": "Service Title",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

### URL Upload (JSON)

```javascript
// Using JSON with existing URL
{
  "title": "Service Title",
  "image": "https://res.cloudinary.com/yourcloud/image/upload/v123/sample.jpg"
}
```

## Benefits

1. **Smaller API Responses** - No more base64 strings in responses
2. **Better Performance** - Images served from Cloudinary CDN
3. **Automatic Cleanup** - Old images deleted when updated/removed
4. **Organized Storage** - Images stored in logical Cloudinary folders
5. **Flexible Input** - Supports file uploads, base64, and existing URLs
6. **Error Handling** - Proper error handling for upload failures

## Environment Variables Required

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
