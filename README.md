## SignPad jQuery Plugin

![signpad](https://github.com/user-attachments/assets/743f514a-2271-4128-827a-6455c227c5fe)

SignPad is a jQuery signature pad plugin that can be integrated into websites. It allows users to sign in to accept a contract. This plugin comes with features like undo functionality and the ability to send signature data in JSON format to the server. It offers dynamic sizing, styling options, and ease of use.

#### Features

- Allows users to sign and save their signatures.
- Undo and Clear functionality improves user experience.
- Signature is sent to the server in PNG format along with additional details (timestamp, user ID).
- Can be customized with dynamic width, height, and styling parameters.

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
| onSave | Function to execute when the signature is saved. It receives the signature data as JSON format. | Empty function |

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

#### Undo and Clear Functions

- **Undo**: Removes the last drawn line by the user.
- **Clear**: Clears the entire canvas area.

```javascript
$('#undo').click();  // Undo
$('#clear').click(); // Clear
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

#### License
This project is licensed under the MIT License.

> By Badursun (c) 2024 burakdursun.com
