## SignPad jQuery Plugin

![signpad](https://github.com/user-attachments/assets/743f514a-2271-4128-827a-6455c227c5fe)

SignPad is a jQuery signature pad plugin that can be integrated into websites. It allows users to sign in to accept a contract. This plugin comes with features like undo functionality and the ability to send signature data in JSON format to the server. It offers dynamic sizing, styling options, and ease of use.

### Demo
Check [https://burakdursun.com/SignPad-jQuery-Plugin/](https://burakdursun.com/SignPad-jQuery-Plugin/) for demo.

#### Features

- Visual signature can be downloaded or signature data can be posted to a remote server after signing.
- Undo and Clear functions improve the user experience, and the mobile version uses full screen.
- Signature Data is sent to the server in dataPNG (toDataURL) format with additional details (timestamp, user identifiers).
- Customizable and responsive with dynamic width, height and style parameters.
- Event triggers can be used for all operations.
- With the signing operation, a checkbox can be checked or data can be added to an input.

#### Installation

**Load jQuery**: To use the plugin, you need to include jQuery in your project. You can add it to your HTML page with the following script tag:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

**Include SignPad Plugin**: Add the SignPad JavaScript file to your project or directly use the following JavaScript code.

```javascript
(function($) {
    $.fn.SignPad = function(options) {
        // Plugin code goes here (latest version code)
    };
}(jQuery));
```
Create a signature area in HTML: To apply the plugin, create a `div`.

```html
<div id="signpad"></div>
```
#### Usage

To initialize the plugin, call the SignPad function as shown in the example below:

```javascript
$('#signpad').SignPad({
    width   : 400,    // Canvas width
    height  : 200,    // Canvas height
    userId  : 123,    // User ID (optional)
    canvasId: 'signature-pad-canvas',  // Canvas ID
    styles  : {
        clearBtn    : "btn btn-sm",    // CSS class for the Clear button
        undoBtn     : "btn btn-sm",    // CSS class for the Undo button
        saveBtn     : "btn btn-sm"     // CSS class for the Save button
    },
    onSave  : async (postData) => {
        // Actions after the signature is saved
        console.log("Signature saved with data:", postData);
    }
});
```

#### Parameters

| Parameter | Description | Default Value |
|:---|:---|---:|
| width | Canvas width in pixels | 400 |
| height | Canvas height in pixels | 200 |
| lineColor | Line color in hex format | #0000FF |
| lineWidth | Line thickness in pixels | 2 |
| userId | User ID for tracking the user who signed | null |
| canvasId | ID of the canvas element | 'signature-pad' |
| styles | Styling parameters for buttons (`clearBtn`, `undoBtn`, `saveBtn`) | {} |

#### Event Triggers
| Parameter | Description | Default Value |
|:---|:---|---:|
| onInit | Function to execute when the signature pad is initialized. This function is triggered once the pad is ready. | Empty function |
| onSave | Function to execute when the signature is saved. It receives the signature data in JSON format. | Empty function |
| onError | Function to execute when an error occurs during the signature process. It receives error details in JSON format. | Empty function |
| onStartDrawing | Function to execute when the user starts drawing a signature. | Empty function |
| onEndDrawing | Function to execute when the user stops drawing. | Empty function |
| onReachedMinStroke | Function to execute when the signature reaches the minimum stroke length. | Empty function |
| onClear | Function to execute when the clear button is pressed, erasing the signature. | Empty function |
| onUndo | Function to execute when the undo button is pressed, reversing the last drawn line. | Empty function |
| onOrientationChange | Function to execute when the device's orientation changes (e.g., switching between portrait and landscape). | Empty function |
| onDrawing | Function to execute continuously while the user is drawing on the signature pad. | Empty function |
| onDrawingonDownload | Function to execute when the signature is downloaded. It handles the process of downloading the signature as an image. | Empty function |

#### Example Save and Send Function

```javascript
onSave  : async (postData) => {
    console.log("Signature saved with data:", postData);

    // Example of sending the signature to the server
    await fetch('/save-signature', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: { 'Content-Type': 'application/json' }
    });
}
```
#### Data Structure Sent to the Server

The plugin sends a JSON object to the server with the following structure:

```javascript
{
    "userId": 123,
    "signature": "data:image/png;base64,...",  // Signature in PNG format as base64
    "timestamp": "2024-09-25 12:34:56"         // Date and time when the signature was made
}
```

#### Contributing
Feel free to open pull requests; we welcome contributions! However, for significant changes, it's best to open an issue beforehand.

#### License
Copyright 2019 Anthony Burak DURSUN

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this project except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

> By Badursun (c) 2024 burakdursun.com
