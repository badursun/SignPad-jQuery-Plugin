(function($) {
    // jQuery existence check
    if (typeof $ === 'undefined') {
        throw new Error("jQuery is required for SignPad.");
    }

    $.fn.SignPad = async function(options) {
        // Default options
        const settings = $.extend({
            width               : 400,
            height              : 200,
            lineColor           : '#0000FF',
            lineWidth           : 2, // Default line width
            userId              : null,
            canvasId            : 'signature-pad',
            minStrokeLength     : 5,  // minimum stroke length to consider it as valid signature
            triggerInput        : { 
                target      : null, 
                value       : null 
            },
            styles              : {
                clearBtn    : "btn",
                undoBtn     : "btn",
                saveBtn     : "btn",
                expandBtn   : "btn",
                downloadBtn : "btn"
            },
            onInit              : async () => {},
            onSave              : async () => {},
            onError             : async () => {},
            onStartDrawing      : async () => {},
            onEndDrawing        : async () => {},
            onReachedMinStroke  : async () => {},
            onClear             : async () => {},
            onUndo              : async () => {},
            onOrientationChange : async () => {},
            onDrawing           : async () => {},
            onDownload          : async () => {},
        }, options);

        const signPadInit = async()=>{
            // Create canvas and buttons dynamically
            this.html(`
                <div class="signature-container">
                    <h2 style="text-align: center;" class="text-dark">Sign Here</h2>
                    <canvas id="${settings.canvasId}" width="${settings.width}" height="${settings.height}"></canvas>
                    <div class="buttons">
                        <button class="${settings.styles.clearBtn}" id="signpad_clear">Clear</button>
                        <button class="${settings.styles.undoBtn}" id="signpad_undo">Undo</button>
                        <button class="${settings.styles.saveBtn}" id="signpad_save">Save</button>
                        <button class="${settings.styles.downloadBtn}" id="signpad_download">Download</button>
                        <button class="${settings.styles.expandBtn}" id="signpad_expand">Full Screen</button>
                    </div>
                </div>
            `);

            settings.onInit(settings);

            // Check Trigger Inputs
            if (settings.triggerInput.target) {
                let $targetInput = $(settings.triggerInput.target);
                if ($targetInput.is(':checkbox')) {
                    let $label = $targetInput.parent('label');
                    if ($label.length > 0) {
                        // If in label, block label
                        $label.css({
                            'pointer-events':'none'
                        });
                    } else {
                        $targetInput.css({
                            'pointer-events':'none'
                        });
                    }
                } else {
                    $targetInput.attr('readonly', true);
                }
            };
            toggleForScreens();
        };
        // Init SignPad
        await signPadInit();

        let undoStack = [];
        let drawingStarted = false;
        let strokeLengthArray = [];  // Store stroke lengths in an array
        let savedDrawing = null;  // To save the drawing before resize
        let initialWidth = settings.width;  // Store the initial width for scaling
        let initialHeight = settings.height;
        const canvas = this.find('canvas')[0];
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0, lastY = 0;
        let currentStrokeLength = 0;

        // Set canvas drawing properties
        function setDrawingProperties() {
            const scale = canvas.width / initialWidth;  // Calculate scale based on the new width
            ctx.strokeStyle = settings.lineColor;
            ctx.lineWidth = settings.lineWidth * scale;  // Scale the line width
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        }
        
        setDrawingProperties(); // Apply properties initially

        // Start drawing
        function startDrawing(event) {
            // Trigger onStartDrawing async function
            settings.onStartDrawing({
                drawedLength: getTotalStrokeLength()
            });

            drawingStarted = true;
            isDrawing = true;
            currentStrokeLength = 0;  // Reset current stroke length for each new stroke
            const { x, y } = getMousePosition(event);
            lastX = x;
            lastY = y;
            ctx.beginPath();
            ctx.moveTo(x, y);

            // Save current canvas state for undo
            undoStack.push(canvas.toDataURL());

            // Prevent mobile scrolling
            event.preventDefault();
        }

        // Draw
        function draw(event) {
            if (!isDrawing) return;
            const { x, y } = getMousePosition(event);
            const strokeSegmentLength = Math.abs(x - lastX) + Math.abs(y - lastY);  // Calculate segment length
            currentStrokeLength += strokeSegmentLength;  // Add segment length to current stroke length
            ctx.lineTo(x, y);
            ctx.stroke();
            lastX = x;
            lastY = y;

            const totalStrokeLength = getTotalStrokeLength() + currentStrokeLength;
            // if (totalStrokeLength >= settings.minStrokeLength) {
            //       // Trigger onReachedMinStroke async function
            //     settings.onReachedMinStroke({
            //         isReached           : true,
            //         totalStrokeLength   : totalStrokeLength,
            //         minStrokeLength     : settings.minStrokeLength
            //     });
            // }

            if(currentStrokeLength > 0){
                settings.onDrawing( getDrawObjData(totalStrokeLength) );
            }

            // Prevent mobile scrolling
            event.preventDefault();
        }

        // Stop drawing and save current stroke length
        function stopDrawing() {
            if (currentStrokeLength > 0) {
                strokeLengthArray.push(currentStrokeLength);  // Save current stroke length
            }
            isDrawing = false;
            ctx.closePath();

              // Trigger onEndDrawing async function
            settings.onEndDrawing(getDrawObjData());
        }

        // Get total stroke length from array
        function getTotalStrokeLength() {
            return strokeLengthArray.reduce((acc, val) => acc + val, 0);
        }

        // Get mouse position, and adjust for the canvas resize
        function getMousePosition(event) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;  // Scale for horizontal axis
            const scaleY = canvas.height / rect.height;  // Scale for vertical axis
            const x = (event.clientX ? event.clientX - rect.left : event.touches[0].clientX - rect.left) * scaleX;
            const y = (event.clientY ? event.clientY - rect.top : event.touches[0].clientY - rect.top) * scaleY;
            return { x, y };
        }

        function toggleForScreens(){
            const innerWidthScreen = window.innerWidth;
            if (innerWidthScreen > 600) {
                $('#signpad_expand').hide();
            } else {
                $('#signpad_expand').show();
            }
        };

        // Undo functionality
        $('#signpad_undo').click(async () => {
            if (undoStack.length > 0) {
                const lastState = undoStack.pop();
                const img = new Image();
                img.src = lastState;
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Scale the image to canvas size
                };
                
                if (strokeLengthArray.length > 0) {
                    strokeLengthArray.pop();  // Remove the last stroke length from the array
                }

                setDrawingProperties();
                // await isReachedMinStroke();
                await settings.onUndo(getDrawObjData());  // Trigger onUndo async function
            }
        });

        // Clear functionality
        $('#signpad_clear').click(async () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawingStarted = false;
            strokeLengthArray = [];  // Reset stroke length array on clear
            // await isReachedMinStroke();
            await settings.onClear(getDrawObjData());  // Trigger onClear async function
        });

        // Save functionality
        $('#signpad_save').click(async () => {
            const totalStrokeLength = getTotalStrokeLength();

            if (!drawingStarted || totalStrokeLength < settings.minStrokeLength) {
                settings.onError({
                    no      : 1,
                    text    : `Please provide a valid signature with sufficient length.`
                });
                return;
            }

            const dataURL = canvas.toDataURL('image/png');
            const currentTime = new Date().toLocaleString();
            const postData = {
                userId      : settings.userId,
                signature   : dataURL,
                timestamp   : currentTime,
                userData    : getDeviceInfo()
            };

            await settings.onSave(postData);

            // Trigger custom input on save
            if (settings.triggerInput.target) {
                const $target = $(settings.triggerInput.target);
                if ($target.is(':checkbox')) {
                    $target.prop('checked', true);
                } else {
                    $target.val(settings.triggerInput.value);
                }
            }
        });

        // Download functionality
        $('#signpad_download').click(async () => {
            // Yeni bir beyaz arka planlı canvas oluştur
            const canvasWithBg = document.createElement('canvas');
                canvasWithBg.width = canvas.width;
                canvasWithBg.height = canvas.height;
            const ctxBg = canvasWithBg.getContext('2d');
        
            // Arka planı beyaz olarak doldur
            ctxBg.fillStyle = 'white';
            ctxBg.fillRect(0, 0, canvasWithBg.width, canvasWithBg.height);
        
            // Eski canvas'ı yeni canvas'ın üzerine çiz
            ctxBg.drawImage(canvas, 0, 0);
        
            // Yeni canvas'ı bir resim olarak indir
            const link = document.createElement('a');
                link.href = canvasWithBg.toDataURL('image/png');
                link.download = 'signature_with_background.png';
                link.click();
            
            await settings.onDownload({
                signatureBase64 : canvasWithBg.toDataURL('image/png')
            });
        });

        // Full Screen functionality for mobile
        $('#signpad_expand').click(() => {
            const elem = document.documentElement;
            const isFullscreenEnabled = document.fullscreenEnabled ||
                                        document.webkitFullscreenEnabled || 
                                        document.mozFullScreenEnabled ||
                                        document.msFullscreenEnabled;

            if (isFullscreenEnabled) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) { // Firefox
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { // IE/Edge
                    elem.msRequestFullscreen();
                }
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("landscape").catch(() => {
                        settings.onError({
                            no      : 4,
                            text    : `Please rotate your device to landscape mode.`
                        });
                    });
                }
            } else {
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("landscape").catch(() => {
                        settings.onError({
                            no      : 3,
                            text    : `Please rotate your device to landscape mode.`
                        });
                    });
                } else {
                    settings.onError({
                        no      : 2,
                        text    : `Your device does not support fullscreen mode.`
                    });
                }
            }
        });

        window.addEventListener("orientationchange", async (event) => {
            if (window.orientation === 90 || window.orientation === -90) {
                const newWidth = Math.min(window.innerWidth, 800);
                canvas.width = newWidth;
                canvas.height = newWidth / (settings.width / settings.height);
            };

            // Trigger onOrientationChange async function
            await settings.onOrientationChange({
                angle       : screen.orientation.angle,
                orientation : screen.orientation.type
            });
        });

        window.addEventListener('resize', () => {
            const ratio = canvas.width / canvas.height;
            savedDrawing = canvas.toDataURL();  // Save the current drawing before resizing
            canvas.width = window.innerWidth * 0.9;  // Adjust canvas size to new window width
            canvas.height = canvas.width / ratio;  // Keep the aspect ratio
            setDrawingProperties();
            redrawCanvas(savedDrawing);
            toggleForScreens();
        });

        // Function to redraw the saved drawing after resize
        function redrawCanvas(savedImage) {
            const img = new Image();
            img.src = savedImage;
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setDrawingProperties();
            };
        }

        function getDeviceInfo() {
            function getPlatform() {
                const userAgent = navigator.userAgent.toLowerCase();
                if (/mobile|android|touch|webos|iphone|ipad|ipod/.test(userAgent)) {
                    if (/tablet|ipad/.test(userAgent)) return "tablet";
                    return "phone";
                }
                return "pc";
            }

            function getOS() {
                const userAgent = navigator.userAgent.toLowerCase();
                if (/windows/.test(userAgent)) return "Windows";
                if (/macintosh|mac os x/.test(userAgent)) return "MacOS";
                if (/linux/.test(userAgent)) return "Linux";
                if (/android/.test(userAgent)) return "Android";
                if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";
                return "Unknown OS";
            }

            function getBrowser() {
                const userAgent = navigator.userAgent;
                if (userAgent.indexOf("Firefox") > -1) return "Firefox";
                if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
                if (userAgent.indexOf("Trident") > -1) return "Internet Explorer";
                if (userAgent.indexOf("Edge") > -1) return "Edge";
                if (userAgent.indexOf("Chrome") > -1) return "Chrome";
                if (userAgent.indexOf("Safari") > -1) return "Safari";
                return "Unknown Browser";
            }

            function getScreenResolution() {
                return {
                    width: window.screen.width,
                    height: window.screen.height
                };
            }

            const deviceInfo = {
                platform: getPlatform(),
                os: getOS(),
                browser: getBrowser(),
                screenResolution: getScreenResolution(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                isTouchDevice: 'ontouchstart' in window,
                hardwareConcurrency: navigator.hardwareConcurrency || "Unknown",
                maxTouchPoints: navigator.maxTouchPoints || 0,
                cookieEnabled: navigator.cookieEnabled,
                online: navigator.onLine,
                deviceMemory: navigator.deviceMemory || "Unknown"
            };

            return deviceInfo;
        }

        function getDrawObjData(currentTotal=null) {
            const totalStrokeLength = (currentTotal==null ? getTotalStrokeLength() : currentTotal);
            let data = {
                minStrokeReached    : (totalStrokeLength >= settings.minStrokeLength),
                minStrokeLength     : settings.minStrokeLength,
                totalStrokeLength   : totalStrokeLength,
                totalDrawedLines    : strokeLengthArray.length
            };
            data.minStrokeReached && settings.onReachedMinStroke(data);
            return data;
        }

        // Drawing event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);

        return this;
    };
}(jQuery));
