const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let auctions = [
    { id: 1, title: 'Vintage Clock', description: 'An antique clock from the 19th century.', currentBid: 150, bidder: null },
    { id: 2, title: 'Painting', description: 'A beautiful landscape painting.', currentBid: 300, bidder: null },
    { id: 3, title: 'Jewelry Set', description: 'A diamond necklace and earrings.', currentBid: 500, bidder: null }
];

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('join auction', (auctionId) => {
        socket.join(`auction-${auctionId}`);
        const auction = auctions.find(a => a.id === auctionId);
        socket.emit('auction data', auction);
    });

    socket.on('place bid', (auctionId, bidAmount, bidderName) => {
        let auction = auctions.find(a => a.id === auctionId);
        if (bidAmount > auction.currentBid) {
            auction.currentBid = bidAmount;
            auction.bidder = bidderName;
            io.to(`auction-${auctionId}`).emit('auction update', auction);
        }
    });

    socket.on('drop bid', (auctionId, bidderName) => {
        let auction = auctions.find(a => a.id === auctionId);
        if (auction.bidder === bidderName) {
            auction.bidder = null;
            io.to(`auction-${auctionId}`).emit('auction update', auction);
            socket.emit('dropped out', auction);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
