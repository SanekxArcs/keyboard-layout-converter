# Keyboard Layout Converter

A Chrome extension that allows you to convert text between English and Ukrainian keyboard layouts.

## Features

- Automatically detects the source layout and converts to the opposite layout
- Works in text fields, content editable areas, and regular web page text
- Simple right-click operation
- No need to copy and paste - converts text directly in place
- Visual language indicator shows current keyboard layout (EN/UA) when hovering over input fields

## Installation Instructions

Since this extension is not published on the Chrome Web Store, you need to install it manually:

1. Download or clone this repository to your computer
2. Open Chrome browser
3. Navigate to `chrome://extensions/` in your address bar
4. Enable "Developer mode" by toggling the switch in the top-right corner
5. Click the "Load unpacked" button
6. Select the folder containing the extension files (the folder with manifest.json)
7. The extension should now appear in your extensions list and be ready to use

## How to Use

1. Select any text on a webpage
2. Right-click on the selected text
3. Choose "Convert Keyboard Layout (Auto)" from the context menu
4. The text will be automatically converted between English and Ukrainian layouts

The extension automatically detects whether the selected text is in English or Ukrainian layout and converts it to the other layout.

When hovering over any text input field, a small indicator will appear near your cursor showing "EN" or "UA" to indicate the current keyboard layout detected in the field.

## Files Included

- `manifest.json`: Extension configuration
- `background.js`: Handles context menu and background processes
- `content.js`: Performs the actual text conversion on web pages
- `mappings.js`: Contains character mapping between layouts

## Troubleshooting

If the extension doesn't work:
- Make sure it's enabled in the extensions page
- Try refreshing the page you're working on
- Check the browser console for any error messages

## License

This project is open source and available for personal use.
