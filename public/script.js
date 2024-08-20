const socket = io();

window.onload = function() {
    const auctionContainer = document.getElementById('auctions');
    fetchAuctions().forEach(auction => {
        const auctionElement = document.createElement('div');
        auctionElement.className = 'auction-item';
        auctionElement.innerHTML = `
            <h3>${auction.title}</h3>
            <p>Current Bid: $${auction.currentBid}</p>
            <a href="auction.html?id=${auction.id}">Bid Now</a>
        `;
        auctionContainer.appendChild(auctionElement);
    });
}

function fetchAuctions() {
    return [
        { id: 1, title: 'Vintage Clock', description: 'An antique clock from the 19th century.', currentBid: 150, bidder: null },
        { id: 2, title: 'Painting', description: 'A beautiful landscape painting.', currentBid: 300, bidder: null },
        { id: 3, title: 'Jewelry Set', description: 'A diamond necklace and earrings.', currentBid: 500, bidder: null }
    ];
}

const urlParams = new URLSearchParams(window.location.search);
const auctionId = parseInt(urlParams.get('id'));
const bidderName = prompt("Enter your name:");

socket.emit('join auction', auctionId);

socket.on('auction data', (auction) => {
    document.getElementById('auction-title').innerText = auction.title;
    document.getElementById('description').innerText = auction.description;
    document.getElementById('current-bid').innerText = auction.currentBid;
    document.getElementById('current-bidder').innerText = auction.bidder || "None";
});

socket.on('auction update', (auction) => {
    document.getElementById('current-bid').innerText = auction.currentBid;
    document.getElementById('current-bidder').innerText = auction.bidder || "None";
    document.getElementById('bid-message').innerText = "Bid updated!";
});

socket.on('dropped out', (auction) => {
    document.getElementById('bid-message').innerText = "You dropped out of the auction.";
    document.getElementById('bid-message').style.color = "red";
});

function placeBid() {
    const bidAmount = parseFloat(document.getElementById('bid-amount').value);
    socket.emit('place bid', auctionId, bidAmount, bidderName);
}

function dropBid() {
    socket.emit('drop bid', auctionId, bidderName);
}
