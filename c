[33mcommit d80a0cd57bf65e17292262c042669c7a5590fa11[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: Anthony Oliai <anthonyoliai@gmail.com>
Date:   Wed Apr 7 17:07:10 2021 +0100

    Code snippet comments

[1mdiff --git a/public/aframe/build/aframe-ar-nft.js b/public/aframe/build/aframe-ar-nft.js[m
[1mindex c4ceff3..ce4fad8 100644[m
[1m--- a/public/aframe/build/aframe-ar-nft.js[m
[1m+++ b/public/aframe/build/aframe-ar-nft.js[m
[36m@@ -20,6 +20,7 @@[m [mvar dataChannel;[m
 var worker;[m
 var global_markerResult;[m
 [m
[32m+[m[32m// Initialization section and relevant functions for peer-to-peer connection. D[m
 function pageReady() {[m
     uuid = createUUID();[m
     serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');[m
[36m@@ -35,7 +36,7 @@[m [mfunction start(isCaller) {[m
     peerConnection.oniceconnectionstatechange = function () {[m
         console.log('ICE state: ', peerConnection.iceConnectionState);[m
     }[m
[31m-[m
[32m+[m[32m    // Data channel set up[m
     if (isCaller) {[m
         dataChannel = peerConnection.createDataChannel("testChannel");[m
         dataChannel.onmessage = handleDataChannelReceiveMessage;[m
[36m@@ -90,7 +91,7 @@[m [mfunction handleDataChannelReceiveMessage(event) {[m
        };[m
    }[m
     //console.log(global_markerResult);[m
[31m-[m
[32m+[m[32m   // Here the client is notified whether a matrix of coordinates has been sent by the server or not.[m[41m [m
     worker.postMessage(global_markerResult);[m
 }[m
 [m
[36m@@ -164,7 +165,7 @@[m [mfunction createUUID() {[m
     return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();[m
 }[m
 [m
[31m-[m
[32m+[m[32m// End of peer-to-peer functions and initialization[m
 [m
 [m
 [m
[1mdiff --git a/public/aframe/build/webrtc_server.js b/public/aframe/build/webrtc_server.js[m
[1mindex a8bb518..fa982d7 100644[m
[1m--- a/public/aframe/build/webrtc_server.js[m
[1m+++ b/public/aframe/build/webrtc_server.js[m
[36m@@ -1,93 +1,99 @@[m
[31m-var localVideo;[m
[31m-var localStream;[m
[31m-var remoteVideo;[m
[31m-var peerConnection;[m
[31m-var uuid;[m
[31m-var serverConnection;[m
[31m-var testStream;[m
[31m-var canvas;[m
[31m-var ctx;[m
[31m-var width;[m
[31m-var height;[m
[31m-var gotStream = false;[m
[31m-var dataChannel;[m
[31m-var prev_hash = 0;[m
[31m-var current_hash = 0;[m
[31m-var currentTime;[m
[31m-var prevTime;[m
[31m-var googCurrentDelayMs;[m
[31m-var average_array = new Array();[m
[31m-var total_average_array = new Array();[m
[31m-var average_latency_array = new Array();[m
[31m-var latency;[m
[31m-var dateStamp = Date.now();[m
[31m-var processing_array = new Array();[m
[31m-array_stamp = false;[m
[31m-[m
[32m+[m[32mvar localVideo[m
[32m+[m[32mvar localStream[m
[32m+[m[32mvar remoteVideo[m
[32m+[m[32mvar peerConnection[m
[32m+[m[32mvar uuid[m
[32m+[m[32mvar serverConnection[m
[32m+[m[32mvar testStream[m
[32m+[m[32mvar canvas[m
[32m+[m[32mvar ctx[m
[32m+[m[32mvar width[m
[32m+[m[32mvar height[m
[32m+[m[32mvar gotStream = false[m
[32m+[m[32mvar dataChannel[m
[32m+[m[32mvar prev_hash = 0[m
[32m+[m[32mvar current_hash = 0[m
[32m+[m[32mvar currentTime[m
[32m+[m[32mvar prevTime[m
[32m+[m[32mvar googCurrentDelayMs[m
[32m+[m[32mvar average_array = new Array()[m
[32m+[m[32mvar total_average_array = new Array()[m
[32m+[m[32mvar average_latency_array = new Array()[m
[32m+[m[32mvar latency[m
[32m+[m[32mvar dateStamp = Date.now()[m
[32m+[m[32mvar processing_array = new Array()[m
[32m+[m[32marray_stamp = false[m
[32m+[m
[32m+[m[32m// Initialization section, here we set up the peer-to-peer connection with the client.[m
 var peerConnectionConfig = {[m
[31m-    'iceServers': [{[m
[31m-            'urls': 'stun:stun.stunprotocol.org:3478'[m
[31m-        },[m
[31m-        {[m
[31m-       