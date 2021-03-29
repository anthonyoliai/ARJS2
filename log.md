# edge-ar


# Monday May 11th, 2020: 
Managed to figure out how to update the modified the .js file containing the image-tracking        implementation. Issue was browser cache related. Also looked into the structure of the a-frame implementation of image tracking. Mostly looked into the HTML file, read up on how a-frame works, XMLHttpRequests, and also studied the overall structure. 

# Tuesday May 12th, 2020: 
Managed to figure out how devtools work, and how I can load the page on my android and read console values on the main development device (PC). Started looking more into the structure of the image tracking build, how parameters are set and how video's are being recorded.


# Wednesday May 12th, 2020: 
Looked more into the library AR-JS is using, known as jsartoolkit5. Followed the documentation found on the jsartoolkit5, which explains how the ARController works and how the video is played and loaded in.

# Thursday May 13th, 2020:
Managed to learn more about the emscripten tool chain used in the script of ARJS.

# Friday May 14th, 2020:
Looked more into the code, from reading in WASM, to how the ARController is used. Also modified the files, creating a HTTPS server with firebase; to see how ARJS works in action, with the help of the console.

# Sunday May 17th, 2020:
Advanced look into how the camera processes the video, how the camera parameters are set, how the ARController is initialized, and how a single image from the video stream is read. (E.g NFT Marker detection)

# Monday May 18th, 2020:
Reiterating through all the main components of ARJS. Mainly focused on looking into how to initialize all the values, and how to initialize the video stream, and how to grab an image from the video stream, to process further.

# Tuesday May 19th, 2020:
Reiterated through all the main components, from video streaming, to marker detection, to the coordinate system of the markers and the transformations. 

# Monday May 25th, 2020:
Learned new components about the ARJS library. To be specific, how the worker blob operates, when processing an image.

# Tuesday May 26th, 2020: 
Started on documentation about how ARJS works.

# Wednesdya May 27th, 2020:
Finished documentation on ARJS. Brainstorm about server implementation

# Thursday May 28th, 2020:
Created Class diagrams, of two possible implementations for client-server interaction.


# Sunday May 31st, 2020:
Work on a simple RTC client which takes pictures and stores them as base64.
Read up GRPC documentation, get familiar with protocol buffers

# Monday June 1st, 2020:
Try to implement the GRPC server on the simple RTC client

# Tuesday June 2nd, 2020:
Go through the GRPC basics, simple Hello World Server, research on browser HTTP support for GRPC.
