const { sequelize } = require('../db');
const EscrowContract = require('../models/escrowContract');
const Transaction = require('../models/transaction');
const User = require('../models/user'); // Dùng luôn User để quản lý tiền

// 1. Khởi tạo hợp đồng
exports.createContract = async (req, res) => {
    try {
        const { jobId, employerId, freelancerId, amount } = req.body;
        const newContract = await EscrowContract.create({ jobId, employerId, freelancerId, amount });
        res.status(201).json({ message: 'Tạo hợp đồng thành công', contract: newContract });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo hợp đồng', error: error.message });
    }
};

// 2. Nạp tiền cọc (Gộp logic tạo URL VNPay vào thẳng đây)
exports.deposit = async (req, res) => {
    try {
        const { contractId } = req.body;
        const contract = await EscrowContract.findByPk(contractId);

        if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
        if (contract.status !== 'PENDING_DEPOSIT') {
            return res.status(400).json({ message: 'Hợp đồng không ở trạng thái chờ nạp tiền' });
        }

        // TẠM THỜI MOCK URL VNPAY CHO GỌN (Anh em test luồng trước, đắp thuật toán thật vào sau)
        const mockPaymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?contract_id=${contract.id}&amount=${contract.amount}`;

        res.status(200).json({ message: 'Tạo link thanh toán thành công', paymentUrl: mockPaymentUrl });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi nạp tiền', error: error.message });
    }
};

// 3. Webhook (IPN) - Nhận data VNPay trả về
exports.webhookIPN = async (req, res) => {
    try {
        const vnp_Params = req.query; 
        
        // TẠM BỎ QUA CHECK CHỮ KÝ - Gỉa sử luôn hợp lệ để test luồng
        const contractId = vnp_Params['vnp_TxnRef'] ? vnp_Params['vnp_TxnRef'].split('_')[0] : null; 
        const responseCode = vnp_Params['vnp_ResponseCode'] || '00'; 

        if (!contractId) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });

        const contract = await EscrowContract.findByPk(contractId);
        if (!contract) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });

        if (contract.status !== 'PENDING_DEPOSIT') {
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        if (responseCode === '00') {
            contract.status = 'IN_PROGRESS';
            contract.transactionRef = vnp_Params['vnp_TransactionNo'] || 'MOCK_TRANS_123';
            await contract.save();

            // Ghi log Transaction
            await Transaction.create({
                escrowContractId: contract.id,
                userId: contract.employerId,
                amount: contract.amount,
                type: 'DEPOSIT',
                status: 'SUCCESS',
                paymentGateway: 'VNPAY',
                transactionRef: contract.transactionRef
            });

            return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            return res.status(200).json({ RspCode: '00', Message: 'Success with error payment code' }); 
        }
    } catch (error) {
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

// 4. Nghiệm thu & Trả tiền (Cộng tiền thẳng vào bảng User)
exports.releaseFund = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const contract = await EscrowContract.findByPk(id, { transaction: t, lock: true });

        if (!contract) throw new Error('Không tìm thấy hợp đồng');
        if (contract.status !== 'IN_PROGRESS') throw new Error('Hợp đồng chưa sẵn sàng để giải ngân');

        // Tìm Freelancer trong bảng User
        const freelancer = await User.findByPk(contract.freelancerId, { transaction: t, lock: true });
        if (!freelancer) throw new Error('Không tìm thấy tài khoản Freelancer');

        // Cộng tiền vào cột balance của User (Huynh đảm bảo trong model user.js có trường balance nhé)
        const currentBalance = parseFloat(freelancer.balance || 0);
        freelancer.balance = currentBalance + parseFloat(contract.amount);
        await freelancer.save({ transaction: t });

        // Đóng hợp đồng
        contract.status = 'COMPLETED';
        await contract.save({ transaction: t });

        // Ghi log Transaction rút tiền
        await Transaction.create({
            escrowContractId: contract.id,
            userId: contract.freelancerId, 
            amount: contract.amount,
            type: 'RELEASE',
            status: 'SUCCESS',
            paymentGateway: 'INTERNAL_WALLET',
            transactionRef: `REL_${contract.id}_${Date.now()}`
        }, { transaction: t });

        await t.commit();
        res.status(200).json({ message: 'Nghiệm thu và giải ngân thành công' });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: 'Giải ngân thất bại', error: error.message });
    }
};

// 5. Hủy hợp đồng
exports.cancelContract = async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await EscrowContract.findByPk(id);

        if (!contract) return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
        
        if (contract.status !== 'PENDING_DEPOSIT') {
            return res.status(400).json({ message: 'Không thể hủy hợp đồng đang chạy hoặc đã xong' });
        }

        contract.status = 'CANCELLED';
        await contract.save();

        res.status(200).json({ message: 'Hủy hợp đồng thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hủy hợp đồng', error: error.message });
    }
};