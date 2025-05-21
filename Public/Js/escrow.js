import { Program, Address, Tx, PubKeyHash } from '/js/helios.js';

export async function createEscrow(wallet, amountADA) {
    const contractSource = await fetch('/js/escrow-contract.hl').then(r => r.text());
    const program = Program.new(contractSource);
    
    const deadline = Date.now() + 72 * 60 * 60 * 1000; // 72 hours
    const datum = {
        seller: await wallet.getPubKeyHash(),
        buyer: await wallet.getPubKeyHash(),
        deadline: Math.floor(deadline / 1000)
    };
    
    return {
        escrowAddress: program.compile().address,
        datum: JSON.stringify(datum)
    };
}

export async function confirmDelivery(wallet, escrowUtxo) {
    const signature = await wallet.signTx(escrowUtxo);
    const redeemer = { ConfirmDelivery: { sig: signature } };
    
    const tx = Tx.new()
        .addInput(escrowUtxo, redeemer)
        .addOutput(TxOutput.new(
            await wallet.getChangeAddress(),
            escrowUtxo.value
        ));
        
    return wallet.submitTx(tx);
}
