// CLIENT SIDE PEER-TO-PEER connection establishment and relevant functions
var peerConnection
var uuid
var serverConnection
var stream
var peerConnectionConfig = {
  iceServers: [
    {
      urls: 'stun:stun.stunprotocol.org:3478',
    },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
}
var globalEvent
var localStream
var dataChannel
var worker
var global_markerResult

function pageReady() {
  uuid = createUUID()
  serverConnection = new WebSocket(
    'wss://' + window.location.hostname + ':8443'
  )
  serverConnection.onmessage = gotMessageFromServer
}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.onicecandidate = gotIceCandidate
  peerConnection.addStream(stream)

  peerConnection.oniceconnectionstatechange = function () {
    console.log('ICE state: ', peerConnection.iceConnectionState)
  }

  if (isCaller) {
    dataChannel = peerConnection.createDataChannel('testChannel')
    dataChannel.onmessage = handleDataChannelReceiveMessage
    dataChannel.onopen = handleDataChannelStatusChange
    dataChannel.onclose = handleDataChannelStatusChange
  } else {
    peerConnection.ondatachannel = handleDataChannelCreated
  }

  if (isCaller) {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler)
  }
}

function sendMessageThroughDataChannel() {
  var message = messageInputBox.value
  console.log('sending: ' + message)
  dataChannel.send(message)

  // Clear the input box and re-focus it, so that we're
  // ready for the next message.
  messageInputBox.value = ''
  messageInputBox.focus()
}

// Handle status changes on the local end of the data
// channel; this is the end doing the sending of data
// in this example.
function handleDataChannelStatusChange(event) {
  if (dataChannel) {
    console.log('dataChannel status: ' + dataChannel.readyState)
  }
}

// Handle onmessage events for the data channel.
// These are the data messages sent by the remote channel.
function handleDataChannelReceiveMessage(event) {
  var message = event.data
  var message_json = JSON.parse(message)
  if (message_json.type == 'found') {
    global_markerResult = {
      type: message_json.type,
      matrix: JSON.stringify(message_json.matrix),
    }
  }
  if (message_json.type == 'lost') {
    global_markerResult = {
      type: message_json.type,
    }
  }
  //console.log(global_markerResult);
  worker.postMessage(global_markerResult)
}

// Close the connection, including data channels if it's open.
// Also update the UI to reflect the disconnected status.

function disconnectPeers() {
  // Close the RTCDataChannel if it's open.
  dataChannel.close()

  // Close the RTCPeerConnection
  peerConnection.close()
  dataChannel = null
  peerConnection = null
}

function gotMessageFromServer(message) {
  if (!peerConnection) start(false)
  var signal = JSON.parse(message.data)

  // Ignore messages from ourself
  if (signal.uuid == uuid) return

  if (signal.sdp) {
    peerConnection
      .setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnection
            .createAnswer()
            .then(createdDescription)
            .catch(errorHandler)
        }
      })
      .catch(errorHandler)
  } else if (signal.ice) {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch(errorHandler)
  }
}

function gotIceCandidate(event) {
  if (event.candidate != null) {
    serverConnection.send(
      JSON.stringify({
        ice: event.candidate,
        uuid: uuid,
      })
    )
  }
}

function createdDescription(description) {
  console.log('got description')

  peerConnection
    .setLocalDescription(description)
    .then(function () {
      serverConnection.send(
        JSON.stringify({
          sdp: peerConnection.localDescription,
          uuid: uuid,
        })
      )
    })
    .catch(errorHandler)
}

function errorHandler(error) {
  console.log(error)
}

function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  )
}

// ----------------------------------------------------------
// SERVER SIDE PEER TO PEER CONNECTION ESTABLISHMENT (Similar ato client) AND INITIALIZATION

var localVideo
var localStream
var remoteVideo
var peerConnection
var uuid
var serverConnection
var testStream
var canvas
var ctx
var width
var height
var gotStream = false
var dataChannel
var prev_hash = 0
var current_hash = 0
var currentTime
var prevTime
var googCurrentDelayMs
var average_array = new Array()
var total_average_array = new Array()
var average_latency_array = new Array()
var latency
var dateStamp = Date.now()
var processing_array = new Array()
array_stamp = false

var peerConnectionConfig = {
  iceServers: [
    {
      urls: 'stun:stun.stunprotocol.org:3478',
    },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
}

var lostSent = false

function clear_avg_array() {
  average_array = []
}
function pageReady() {
  uuid = createUUID()
  serverConnection = new WebSocket(
    'wss://' + window.location.hostname + ':8443'
  )
  serverConnection.onmessage = gotMessageFromServer
}

//Array.prototype.sum = function() {
//return this.reduce(function(a,b){return a+b;});
//};

function getDelay() {
  peerConnection.getStats(function callback(connStats) {
    var rtcStatsReports = connStats.result()
    var counter = 0
    while (true) {
      googCurrentDelayMs = parseInt(
        rtcStatsReports[counter].stat('googCurrentDelayMs')
      )
      if (googCurrentDelayMs) {
        break
      } else {
        counter++
      }
    }
  })
}

function getLatency() {
  peerConnection.getStats(function callback(connStats) {
    var rtcStatsReports = connStats.result()
    var counter = 0
    while (true) {
      latency = parseInt(rtcStatsReports[counter].stat('googCurrentDelayMs'))
      if (latency) {
        break
      } else {
        counter++
      }
    }
    average_latency_array.push(latency)
    if (average_latency_array.length == 120) {
      var hiddenElement = document.createElement('a')
      hiddenElement.href =
        'data:attachment/text,' + encodeURI(average_latency_array)
      hiddenElement.target = '_blank'
      hiddenElement.download = 'latency_' + performance.now() + '.txt'
      hiddenElement.click()
    }
    console.log('The latency equals: ' + latency)
  })
}

//function getUserMediaSuccess(stream) {
//localStream = stream;
//localVideo.srcObject = stream;
//}

function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig)
  peerConnection.onicecandidate = gotIceCandidate
  peerConnection.oniceconnectionstatechange = function () {
    console.log('ICE state: ', peerConnection.iceConnectionState)
  }
  if (isCaller) {
    dataChannel = peerConnection.createDataChannel('testChannel')
    dataChannel.onmessage = handleDataChannelReceiveMessage
    dataChannel.onopen = handleDataChannelStatusChange
    dataChannel.onclose = handleDataChannelStatusChange
  } else {
    peerConnection.ondatachannel = handleDataChannelCreated
  }
  if (isCaller) {
    peerConnection.createOffer().then(createdDescription).catch(errorHandler)
  }

  peerConnection.onaddstream = function (event) {
    gotStream = true
    window.dispatchEvent(
      new CustomEvent('arjs-video-loaded', {
        detail: {
          component: document.querySelector('#arjs-video'),
          event: event,
        },
      })
    )
  }

  setInterval(getLatency, 5000)
}

function handleDataChannelCreated(event) {
  console.log('dataChannel opened')
  dataChannel = event.channel
  dataChannel.onmessage = handleDataChannelReceiveMessage
  dataChannel.onopen = handleDataChannelStatusChange
  dataChannel.onclose = handleDataChannelStatusChange
}

function sendMessageThroughDataChannel() {
  var message = 'Neando'
  console.log('sending: ' + message)
  dataChannel.send(message)
}

// Handle status changes on the local end of the data
// channel; this is the end doing the sending of data
// in this example.
function handleDataChannelStatusChange(event) {
  if (dataChannel) {
    console.log('dataChannel status: ' + dataChannel.readyState)
  }
}

// Handle onmessage events for the data channel.
// These are the data messages sent by the remote channel.
function handleDataChannelReceiveMessage(event) {
  console.log('Message: ' + event.data)
}

// Close the connection, including data channels if it's open.
// Also update the UI to reflect the disconnected status.
function disconnectPeers() {
  // Close the RTCDataChannel if it's open.
  dataChannel.close()

  // Close the RTCPeerConnection
  peerConnection.close()

  dataChannel = null
  peerConnection = null
}

function gotMessageFromServer(message) {
  if (!peerConnection) start(false)

  var signal = JSON.parse(message.data)

  // Ignore messages from ourself
  if (signal.uuid == uuid) return

  if (signal.sdp) {
    peerConnection
      .setRemoteDescription(new RTCSessionDescription(signal.sdp))
      .then(function () {
        // Only create answers in response to offers
        if (signal.sdp.type == 'offer') {
          peerConnection
            .createAnswer()
            .then(createdDescription)
            .catch(errorHandler)
        }
      })
      .catch(errorHandler)
  } else if (signal.ice) {
    peerConnection
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch(errorHandler)
  }
}

function sendMessage() {
  var message = 'Hello neando'
  dataChannel.send(message)
}

function gotIceCandidate(event) {
  if (event.candidate != null) {
    serverConnection.send(
      JSON.stringify({
        ice: event.candidate,
        uuid: uuid,
      })
    )
  }
}

function createdDescription(description) {
  console.log('got description')

  peerConnection
    .setLocalDescription(description)
    .then(function () {
      serverConnection.send(
        JSON.stringify({
          sdp: peerConnection.localDescription,
          uuid: uuid,
        })
      )
    })
    .catch(errorHandler)
}

function errorHandler(error) {
  console.log(error)
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }

  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  )
}

// This is where the server does the processing of a frame.
function handleNFT(descriptorsUrl, arController) {
  // create a Worker to handle loading of NFT marker and tracking of it
  var workerBlob = new Blob(
    [workerRunner.toString().replace(/^function .+\{?|\}$/g, '')],
    {
      type: 'text/js-worker',
    }
  )
  var workerBlobUrl = URL.createObjectURL(workerBlob)
  var worker = new Worker(workerBlobUrl)

  window.addEventListener('arjs-video-loaded', function (ev) {
    if (gotStream) {
      var video = ev.detail.component
      video.srcObject = ev.detail.event.stream
      var vw = video.clientWidth
      var vh = video.clientHeight

      var pscale = 320 / Math.max(vw, (vh / 3) * 4)

      w = vw * pscale
      h = vh * pscale
      pw = Math.max(w, (h / 3) * 4)
      ph = Math.max(h, (w / 4) * 3)
      ox = (pw - w) / 2
      oy = (ph - h) / 2

      arController.canvas.style.clientWidth = pw + 'px'
      arController.canvas.style.clientHeight = ph + 'px'
      arController.canvas.width = pw
      arController.canvas.height = ph

      var context_process = arController.canvas.getContext('2d')
      // Process function to draw an image and to get the image data off the video?
      function process() {
        currentTime = performance.now()
        context_process.fillStyle = 'black'
        context_process.fillRect(0, 0, pw, ph)
        context_process.drawImage(video, 0, 0, vw, vh, ox, oy, w, h)
        var imageData = context_process.getImageData(0, 0, pw, ph)

        getDelay()
        worker.postMessage(
          {
            type: 'process',
            imagedata: imageData,
          },
          [imageData.data.buffer]
        )
      }

      // initialize the worker
      worker.postMessage({
        type: 'init',
        pw: pw,
        ph: ph,
        marker: descriptorsUrl,
        param: arController.cameraParam.src,
      })

      worker.onmessage = function (ev) {
        if (ev && ev.data && ev.data.type === 'endLoading') {
          var loader = document.querySelector('.arjs-loader')
          if (loader) {
            loader.remove()
          }
          var endLoadingEvent = new Event('arjs-nft-loaded')
          window.dispatchEvent(endLoadingEvent)
        }

        if (ev && ev.data && ev.data.type === 'loaded') {
          var proj = JSON.parse(ev.data.proj)
          var ratioW = pw / w
          var ratioH = ph / h
          proj[0] *= ratioW
          proj[4] *= ratioW
          proj[8] *= ratioW
          proj[12] *= ratioW
          proj[1] *= ratioH
          proj[5] *= ratioH
          proj[9] *= ratioH
          proj[13] *= ratioH

          setMatrix(_this.object3d.matrix, proj)
        }

        // If we find a marker, we calculate its hash, based on its xyz coordinates. If the current frame differs a lot from the previous frame, we send the new coordinate values. Else we ignore.
        // Calculate matrix of coordinates and send the data back to the client, through the WebRTC datachannel.
        // Also keep track of several metrics, such as  end to end delay, sending delay, processing time. Store in a txt file for processing.
        if (ev && ev.data && ev.data.type === 'found') {
          var matrix = JSON.parse(ev.data.matrix)
          var tempResult = {
            type: 'found',
            matrix: matrix,
          }
          //console.log("The x coordinate equals: " + matrix[12]);
          //console.log("The y coordinate equals: " + matrix[13]);
          //console.log("The z coordinate equals: " + matrix[14]);
          prev_hash = current_hash

          current_hash = (matrix[12] + matrix[13] + matrix[14]) / 3
          var difference_hash = Math.abs(current_hash - prev_hash)
          if (difference_hash > 3.5) {
            prevTime = currentTime
            currentTime = performance.now()
            var processing_time = currentTime - prevTime

            var receiving_delay = googCurrentDelayMs
            getDelay()
            var sending_delay = googCurrentDelayMs
            var total_delay = receiving_delay + processing_time + sending_delay
            average_array.push(total_delay)
            processing_array.push(processing_time)
            if (Date.now() > dateStamp + 610000 && !array_stamp) {
              var hiddenElement = document.createElement('a')
              hiddenElement.href =
                'data:attachment/text,' + encodeURI(average_array)
              hiddenElement.target = '_blank'
              hiddenElement.download = 'endtoend_time.txt'
              hiddenElement.click()

              var hiddenElement2 = document.createElement('a')
              hiddenElement2.href =
                'data:attachment/text,' + encodeURI(processing_array)
              hiddenElement2.target = '_blank'
              hiddenElement2.download = 'processing_time.txt'
              hiddenElement2.click()

              clear_avg_array()
              array_stamp = true
            }
            dataChannel.send(JSON.stringify(tempResult))
          }

          onMarkerFound({
            data: {
              type: artoolkit.NFT_MARKER,
              matrix: matrix,
              msg: ev.data.type,
            },
          })

          _this.context.arController.showObject = true
          lostSent = false
        }

        if (ev && ev.data && ev.data.type === 'not found') {
          var lostResult = {
            type: 'lost',
          }
          if (lostSent == false) {
            dataChannel.send(JSON.stringify(lostResult))
            lostSent = true
          }
          _this.context.arController.showObject = false
        } else {
          _this.context.arController.showObject = false
        }
        process()
      }
    }
  })
}
