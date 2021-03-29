# ARJS2 implementation, a peer-to-peer client to server architecture for the popular library known as ARJS.

# How to run

1] Go to the public/aframe folder

2] Open a Linux command line in that folder

3] Run npm start to start running the server on localhost

4] Using the given ip-addresses and ports, connect to the server first, by entering https://localhost:8443/receiving_server, HTTPS required, else getUserMedia API does not work.

5] Use the given ip address and ports for the client, by entering https://localhost:8443/sending_client

6] Tap on the window of the server browser, flow of frames should be received at the server side.

7] Aim at T-rex NFT marker https://raw.githubusercontent.com/AR-js-org/AR.js/master/aframe/examples/image-tracking/nft/trex-image-big.jpeg to get the 3D model to load on the server-side

8] Client automatically loads 3D model on client side.
