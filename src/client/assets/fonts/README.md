# Font Assets

## Avenir Next

Avenir Next is a licensed font family. This directory is prepared to hold the font files once you have obtained the proper license.

### How to add Avenir Next to the application:

1. Purchase a license for the Avenir Next font family from [Linotype](https://www.linotype.com/1245/avenir-next-family.html), or other authorized vendors.

2. Once purchased, download the web font files (preferably WOFF2 format for modern browsers).

3. Place the font files in the `avenir-next` directory with names matching those referenced in `src/client/styles/fonts.css`.

4. Uncomment the `src` lines in the `@font-face` declarations in `src/client/styles/fonts.css`.

### Alternative approaches:

1. **Use a web font service**: If you have a subscription to services like Adobe Fonts (Typekit) or Cloud.typography that includes Avenir Next, follow their instructions for adding the font to your project.

2. **System fonts fallback**: If users don't have Avenir Next installed locally and you don't provide web font files, the application will fall back to system fonts as defined in the Tailwind configuration.

## Legal Notice

Please ensure you have the appropriate licenses for any fonts you use in your application, especially for commercial purposes. Using fonts without proper licensing can lead to legal issues. 