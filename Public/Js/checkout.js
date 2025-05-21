import { createEscrow, confirmDelivery } from '/js/escrow.js';

// Initialize wallet connection
let wallet;
let escrowUtxo;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        wallet = await CardanoBrowserWallet.enable();
        const balance = await wallet.getBalance();
        document.getElementById('adaBalance').textContent = 
            `${(balance / 1000000).toFixed(2)} ADA`;
    } catch (error) {
        alert('Please install a Cardano wallet!');
    }
});

// Escrow Checkout Flow
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    
    try {
        const { escrowAddress } = await createEscrow(wallet, amount);
        
        swal({
            title: "Escrow Payment",
            html: `<div id="escrowDetails">
                     <p>Send <b>${amount} ADA</b> to:</p>
                     <code id="escrowAddress">${escrowAddress}</code>
                     <p>Funds will be locked until delivery confirmation</p>
                   </div>`,
            confirmButtonText: "Copy Address"
        }).then(() => {
            navigator.clipboard.writeText(escrowAddress);
            document.getElementById('confirmDelivery').style.display = 'block';
        });
        
    } catch (error) {
        swal("Error", error.message, "error");
    }
});

// Delivery Confirmation
document.getElementById('confirmDelivery').addEventListener('click', async () => {
    try {
        await confirmDelivery(wallet, escrowUtxo);
        swal("Success", "Payment released to seller!", "success");
    } catch (error) {
        swal("Error", error.message, "error");
    }
});
