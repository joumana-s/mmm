# **App Name**: Image Resizer and Placeholder Generator

## Core Features:

- Image Selection: Allows users to select an existing image from a local 'images' folder for resizing.
- Size Parameter Input: Allows users to set the desired height and width parameters and click a button that returns a URL for the API image generator that can be used for placeholder images.
- Image Upload: Allows users to upload new .jpg images to the 'images' folder and displays them on the page so they can be selected for placeholder image generation.
- Placeholder Image Generator: The image generator API endpoint will generate images with the size set via URL parameters. This will allow you to place images into your frontend for rapid prototyping.
- Cached Image Library: The API will store the resized images as you create them. When an image request is sent, your code will check to see if the image already exists in the library. If it has been created, the API will return a link to that image. If it hasn't, a new image will be created and stored, and the link to the newly created image will be returned.

## Style Guidelines:

- Primary color: Neutral white or light gray for a clean and modern feel.
- Secondary color: Light blue or teal for interactive elements and highlights.
- Body font: 'Roboto' or 'Open Sans' for readability and clean appearance.
- Headline font: 'Montserrat' or similar bold sans-serif font for headings.
- Simple, modern icons for image selection, upload, and settings.
- Clear, structured layout with image gallery, input form, and API URL display.
- Subtle animations or transitions when images are selected or uploaded.