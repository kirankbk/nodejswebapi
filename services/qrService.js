const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

/**
 * Generate QR Code for Salary Slip Verification
 * @param {string} verificationCode
 * @param {string} baseUrl
 * @returns {Promise<Object>}
 */
exports.generateQRCode = async (verificationCode, baseUrl) => {

    try {

        const folder = path.join(__dirname, "../qr_codes");

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        const fileName = `QR_${verificationCode}.png`;

        const filePath = path.join(folder, fileName);

        const verifyUrl = `${baseUrl}${verificationCode}`;

        await QRCode.toFile(filePath, verifyUrl, {

            type: "png",

            width: 250,

            margin: 2,

            color: {

                dark: "#000000",

                light: "#FFFFFF"

            }

        });

        return {

            success: true,

            verificationUrl: verifyUrl,

            fileName,

            filePath

        };

    } catch (err) {

        throw err;

    }

};